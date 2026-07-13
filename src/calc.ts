import type { DailyLog, DailyLogs, Profile } from './types'

const KCAL_PER_KG = 7200
const SEDENTARY_ACTIVITY_FACTOR = 1.2
const KCAL_PER_STEP_PER_KG = 0.0005

export function calcBmr(profile: Pick<Profile, 'heightCm' | 'age' | 'gender' | 'baselineWeightKg'>): number {
  const { heightCm, age, gender, baselineWeightKg } = profile
  const base = 10 * baselineWeightKg + 6.25 * heightCm - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

export function calcStepsCalories(steps: number, weightKg: number): number {
  return steps * weightKg * KCAL_PER_STEP_PER_KG
}

export function calcTdee(bmr: number, steps: number, weightKg: number): number {
  return bmr * SEDENTARY_ACTIVITY_FACTOR + calcStepsCalories(steps, weightKg)
}

export function calcCaloriesIn(log: DailyLog): number {
  return log.foodEntries.reduce((sum, entry) => sum + entry.calories, 0)
}

export interface DailySummary {
  bmr: number
  tdee: number
  caloriesIn: number
  netBalance: number
  deltaKg: number
  projectedWeightKg: number
}

export function calcDailySummary(profile: Profile, log: DailyLog): DailySummary {
  const bmr = calcBmr(profile)
  const tdee = calcTdee(bmr, log.steps, profile.baselineWeightKg)
  const caloriesIn = calcCaloriesIn(log)
  const netBalance = caloriesIn - tdee
  const deltaKg = netBalance / KCAL_PER_KG
  const projectedWeightKg = profile.baselineWeightKg + deltaKg
  return { bmr, tdee, caloriesIn, netBalance, deltaKg, projectedWeightKg }
}

// 直近の「食事を記録した日」最大 days 件の 1 日あたり収支の平均。
export function calcAvgDailyNetBalance(
  profile: Profile,
  logs: DailyLogs,
  days = 7,
): { avgNetBalance: number; sampleDays: number } {
  const bmr = calcBmr(profile)
  const loggedDays = Object.entries(logs)
    .filter(([, log]) => log.foodEntries.length > 0)
    .sort(([a], [b]) => (a < b ? 1 : -1)) // キー(YYYY-MM-DD)降順
    .slice(0, days)

  if (loggedDays.length === 0) {
    return { avgNetBalance: 0, sampleDays: 0 }
  }

  const total = loggedDays.reduce((sum, [, log]) => {
    const tdee = calcTdee(bmr, log.steps, profile.baselineWeightKg)
    return sum + (calcCaloriesIn(log) - tdee)
  }, 0)

  return { avgNetBalance: total / loggedDays.length, sampleDays: loggedDays.length }
}

const PROJECTION_MONTHS = [1, 2, 3] as const
const DAYS_PER_MONTH = 30

export interface TimeframeTarget {
  months: number
  requiredDailyDeficitKcal: number
  extraKcalToCut: number
  extraSteps: number
  achievableNow: boolean
}

export interface GoalProjection {
  goalWeightKg: number
  weightToLoseKg: number
  avgDailyDeltaKg: number
  onTrack: boolean
  monthsToGoal: number | null
  alreadyReached: boolean
  targets: TimeframeTarget[]
}

export function calcGoalProjection(
  baselineWeightKg: number,
  goalWeightKg: number,
  avgNetBalance: number,
): GoalProjection {
  const weightToLoseKg = baselineWeightKg - goalWeightKg
  const avgDailyDeltaKg = avgNetBalance / KCAL_PER_KG
  const currentDailyDeficitKcal = -avgNetBalance
  const alreadyReached = weightToLoseKg <= 0
  const onTrack = !alreadyReached && avgDailyDeltaKg < 0

  const monthsToGoal = onTrack
    ? weightToLoseKg / -avgDailyDeltaKg / DAYS_PER_MONTH
    : null

  const kcalPerStep = baselineWeightKg * KCAL_PER_STEP_PER_KG

  const targets: TimeframeTarget[] = PROJECTION_MONTHS.map((months) => {
    const requiredDailyDeficitKcal = alreadyReached
      ? 0
      : (weightToLoseKg * KCAL_PER_KG) / (months * DAYS_PER_MONTH)
    const extraKcalToCut = requiredDailyDeficitKcal - currentDailyDeficitKcal
    const extraSteps = extraKcalToCut > 0 ? extraKcalToCut / kcalPerStep : 0
    return {
      months,
      requiredDailyDeficitKcal,
      extraKcalToCut,
      extraSteps,
      achievableNow: extraKcalToCut <= 0,
    }
  })

  return {
    goalWeightKg,
    weightToLoseKg,
    avgDailyDeltaKg,
    onTrack,
    monthsToGoal,
    alreadyReached,
    targets,
  }
}
