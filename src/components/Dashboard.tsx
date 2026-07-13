import { useState } from 'react'
import type { DailyLog, DailyLogs, Profile } from '../types'
import { calcAvgDailyNetBalance, calcDailySummary, calcGoalProjection } from '../calc'
import { emptyLog, todayKey } from '../storage'
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
  onLogChange: (log: DailyLog) => void
  onProfileChange: (profile: Profile) => void
}

export function Dashboard({ profile, log, logs, onLogChange, onProfileChange }: Props) {
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

  const dateLabel = new Date(`${todayKey()}T00:00:00`).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <div className="mx-auto max-w-md p-4 pb-12">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          {dateLabel}
        </h1>
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
            今日の食事
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
