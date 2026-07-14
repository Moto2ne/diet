import type { DailyLog, DailyLogs, Profile } from './types'

const PROFILE_KEY = 'diet-app:profile'
const LOGS_KEY = 'diet-app:logs'

export function loadProfile(): Profile | null {
  const raw = localStorage.getItem(PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Profile
  } catch {
    return null
  }
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function loadDailyLogs(): DailyLogs {
  const raw = localStorage.getItem(LOGS_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as DailyLogs
  } catch {
    return {}
  }
}

export function saveDailyLogs(logs: DailyLogs) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

export function todayKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function shiftDateKey(key: string, deltaDays: number): string {
  const date = new Date(`${key}T00:00:00`)
  date.setDate(date.getDate() + deltaDays)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function emptyLog(): DailyLog {
  return { steps: 0, foodEntries: [] }
}
