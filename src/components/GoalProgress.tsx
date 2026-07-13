import type { GoalProjection } from '../calc'

interface Props {
  goalWeightKg?: number
  projection: GoalProjection | null
  sampleDays: number
  onOpenSettings: () => void
}

export function GoalProgress({ goalWeightKg, projection, sampleDays, onOpenSettings }: Props) {
  // 目標未設定
  if (goalWeightKg == null || projection == null) {
    return (
      <Panel className="bg-neutral-50 dark:bg-neutral-900">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          🎯 目標体重を設定すると、達成予測とアドバイスが見られます。
        </p>
        <button
          type="button"
          onClick={onOpenSettings}
          className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400"
        >
          設定を開く →
        </button>
      </Panel>
    )
  }

  // 既に達成
  if (projection.alreadyReached) {
    return (
      <Panel className="bg-emerald-50 dark:bg-emerald-950">
        <div className="text-center">
          <div className="text-4xl">🎉</div>
          <p className="mt-2 font-semibold text-emerald-700 dark:text-emerald-300">
            目標体重 {goalWeightKg.toFixed(1)}kg を達成しています！
          </p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            この調子でキープしていきましょう。
          </p>
        </div>
      </Panel>
    )
  }

  return (
    <Panel className="bg-blue-50 dark:bg-blue-950/40">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">
          🎯 目標 {goalWeightKg.toFixed(1)}kg まで
        </h3>
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          あと {projection.weightToLoseKg.toFixed(1)}kg
        </span>
      </div>

      {/* 現ペースの予測 */}
      <div className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-sm dark:bg-black/20">
        {sampleDays === 0 ? (
          <span className="text-neutral-500">
            食事を数日記録すると、今のペースでの予測が出ます。
          </span>
        ) : projection.onTrack && projection.monthsToGoal != null ? (
          <span className="text-neutral-700 dark:text-neutral-300">
            今のペースだと約{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">
              {formatMonths(projection.monthsToGoal)}
            </strong>{' '}
            で達成しそうです 🙌
          </span>
        ) : (
          <span className="text-neutral-700 dark:text-neutral-300">
            今のペースでは目標に近づいていません。下のペースを目安にしてみましょう 💪
          </span>
        )}
        {sampleDays > 0 && (
          <span className="ml-1 text-xs text-neutral-400">(直近{sampleDays}日の平均)</span>
        )}
      </div>

      {/* 1・2・3ヶ月の改善カード */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {projection.targets.map((t) => (
          <div
            key={t.months}
            className="rounded-lg bg-white/70 p-2 text-center text-xs dark:bg-black/20"
          >
            <div className="font-semibold text-neutral-700 dark:text-neutral-300">
              {t.months}ヶ月で
            </div>
            {t.achievableNow ? (
              <div className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
                このペースで達成 👍
              </div>
            ) : (
              <div className="mt-1 space-y-0.5 text-neutral-600 dark:text-neutral-400">
                <div>
                  1日あと
                  <br />
                  <strong className="text-neutral-900 dark:text-neutral-50">
                    {Math.round(t.extraKcalToCut)}kcal
                  </strong>
                </div>
                <div className="text-[10px] text-neutral-400">または</div>
                <div>
                  <strong className="text-neutral-900 dark:text-neutral-50">
                    +{Math.round(t.extraSteps).toLocaleString()}歩
                  </strong>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  )
}

function formatMonths(months: number): string {
  if (months < 1) {
    const days = Math.max(1, Math.round(months * 30))
    return `${days}日後`
  }
  if (months >= 24) {
    return `${(months / 12).toFixed(1)}年後`
  }
  return `${months.toFixed(1)}ヶ月後`
}

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-2xl p-4 ${className ?? ''}`}>{children}</div>
}
