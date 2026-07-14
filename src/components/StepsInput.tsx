interface Props {
  steps: number
  label?: string
  onChange: (steps: number) => void
}

export function StepsInput({ steps, label = '今日の歩数', onChange }: Props) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </span>
        <input
          type="number"
          min={0}
          value={steps || ''}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder="ヘルスケアアプリの歩数を入力"
          className="input"
        />
      </label>
    </div>
  )
}
