import type { DailyLog, Profile } from './types'

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
