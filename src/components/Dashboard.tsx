import { useState } from 'react'
import type { DailyLog, DailyLogs, Profile } from '../types'
import { calcAvgDailyNetBalance, calcDailySummary, calcGoalProjection } from '../calc'
import { emptyLog, shiftDateKey, todayKey } from '../storage'
import { StepsInput } from './StepsInput'
import { FoodUpload } from './FoodUpload'
import { FoodLog } from './FoodLog'
import { WeightReveal } from './WeightReveal'
import { GoalProgress } from './GoalProgress'
import { Settings } from './Settings'

interface Props {
  profile: Profile
  log: DailyLog
  logs: DailyLogs
  selectedDate: string
  onDateChange: (date: string) => void
  onLogChange: (log: DailyLog) => void
  onProfileChange: (profile: Profile) => void
}

export function Dashboard({
  profile,
  log,
  logs,
  selectedDate,
  onDateChange,
  onLogChange,
  onProfileChange,
}: Props) {
  const [showSettings, setShowSettings] = useState(false)
  const currentLog = log ?? emptyLog()
  const summary = calcDailySummary(profile, currentLog)

  const { avgNetBalance, sampleDays } = calcAvgDailyNetBalance(profile, logs)
  // 記録がまだ無ければ今日の収支にフォールバック
  const paceNetBalance = sampleDays === 0 ? summary.netBalance : avgNetBalance
  const projection =
    profile.goalWeightKg != null
      ? calcGoalProjection(profile.baselineWeightKg, profile.goalWeightKg, paceNetBalance)
      : null

  const today = todayKey()
  const isToday = selectedDate === today
  const dateLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <div className="mx-auto max-w-md p-4 pb-12">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center justify-between rounded-lg border border-neutral-200 px-1 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => onDateChange(shiftDateKey(selectedDate, -1))}
            className="rounded-md px-2 py-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="前の日"
          >
            ‹
          </button>
          <label className="relative cursor-pointer text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            {dateLabel}
            {isToday && <span className="ml-1 text-xs text-blue-500">(今日)</span>}
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="日付を選択"
            />
          </label>
          <button
            type="button"
            onClick={() => onDateChange(shiftDateKey(selectedDate, 1))}
            disabled={isToday}
            className="rounded-md px-2 py-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
            aria-label="次の日"
          >
            ›
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="設定"
        >
          ⚙️
        </button>
      </header>

      <div className="space-y-4">
        <WeightReveal baselineWeightKg={profile.baselineWeightKg} summary={summary} />

        <GoalProgress
          goalWeightKg={profile.goalWeightKg}
          projection={projection}
          sampleDays={sampleDays}
          onOpenSettings={() => setShowSettings(true)}
        />

        <StepsInput
          steps={currentLog.steps}
          label={isToday ? '今日の歩数' : 'この日の歩数'}
          onChange={(steps) => onLogChange({ ...currentLog, steps })}
        />

        <FoodUpload
          apiKey={profile.claudeApiKey}
          onAdd={(entry) =>
            onLogChange({ ...currentLog, foodEntries: [...currentLog.foodEntries, entry] })
          }
        />

        <div>
          <h3 className="mb-2 font-semibold text-neutral-900 dark:text-neutral-50">
            {isToday ? '今日の食事' : 'この日の食事'}
          </h3>
          <FoodLog
            entries={currentLog.foodEntries}
            onRemove={(id) =>
              onLogChange({
                ...currentLog,
                foodEntries: currentLog.foodEntries.filter((e) => e.id !== id),
              })
            }
          />
        </div>
      </div>

      {showSettings && (
        <Settings
          profile={profile}
          onSave={onProfileChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
