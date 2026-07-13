export type Gender = 'male' | 'female'

export interface Profile {
  heightCm: number
  age: number
  gender: Gender
  baselineWeightKg: number
  claudeApiKey: string
}

export interface FoodEntry {
  id: string
  label: string
  calories: number
  proteinG: number
  fatG: number
  carbsG: number
  fiberG: number
  timestamp: number
}

export interface DailyLog {
  steps: number
  measuredWeightKg?: number
  foodEntries: FoodEntry[]
}

export type DailyLogs = Record<string, DailyLog>
