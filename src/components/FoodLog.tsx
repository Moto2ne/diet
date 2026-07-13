import type { FoodEntry } from '../types'

interface Props {
  entries: FoodEntry[]
  onRemove: (id: string) => void
}

export function FoodLog({ entries, onRemove }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-neutral-500">まだ今日の食事は記録されていません。</p>
    )
  }

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      proteinG: acc.proteinG + e.proteinG,
      fatG: acc.fatG + e.fatG,
      carbsG: acc.carbsG + e.carbsG,
      fiberG: acc.fiberG + e.fiberG,
    }),
    { calories: 0, proteinG: 0, fatG: 0, carbsG: 0, fiberG: 0 },
  )

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
        >
          <div>
            <div className="font-medium text-neutral-900 dark:text-neutral-50">
              {entry.label}
            </div>
            <div className="text-xs text-neutral-500">
              {entry.calories} kcal · P{entry.proteinG}g F{entry.fatG}g C
              {entry.carbsG}g 食物繊維{entry.fiberG}g
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            className="text-neutral-400 hover:text-red-500"
            aria-label="削除"
          >
            ×
          </button>
        </div>
      ))}

      <div className="mt-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium dark:bg-neutral-900">
        合計: {Math.round(totals.calories)} kcal · P{totals.proteinG.toFixed(1)}g F
        {totals.fatG.toFixed(1)}g C{totals.carbsG.toFixed(1)}g 食物繊維
        {totals.fiberG.toFixed(1)}g
      </div>
    </div>
  )
}
