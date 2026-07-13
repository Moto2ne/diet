import { useState } from 'react'
import type { Gender, Profile } from '../types'

interface Props {
  initial?: Profile
  onSave: (profile: Profile) => void
  onCancel?: () => void
}

export function ProfileSetup({ initial, onSave, onCancel }: Props) {
  const [heightCm, setHeightCm] = useState(initial?.heightCm.toString() ?? '')
  const [age, setAge] = useState(initial?.age.toString() ?? '')
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'male')
  const [weightKg, setWeightKg] = useState(initial?.baselineWeightKg.toString() ?? '')
  const [goalKg, setGoalKg] = useState(initial?.goalWeightKg?.toString() ?? '')
  const [apiKey, setApiKey] = useState(initial?.claudeApiKey ?? '')

  const canSave =
    Number(heightCm) > 0 && Number(age) > 0 && Number(weightKg) > 0

  const handleSave = () => {
    onSave({
      heightCm: Number(heightCm),
      age: Number(age),
      gender,
      baselineWeightKg: Number(weightKg),
      goalWeightKg: Number(goalKg) > 0 ? Number(goalKg) : undefined,
      claudeApiKey: apiKey.trim(),
    })
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
        プロフィール設定
      </h1>

      <div className="space-y-4">
        <Field label="身長 (cm)">
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="input"
            placeholder="170"
          />
        </Field>

        <Field label="年齢">
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="input"
            placeholder="30"
          />
        </Field>

        <Field label="性別">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`flex-1 rounded-lg border px-4 py-2 ${gender === 'male' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-neutral-300 dark:border-neutral-700'}`}
            >
              男性
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`flex-1 rounded-lg border px-4 py-2 ${gender === 'female' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-neutral-300 dark:border-neutral-700'}`}
            >
              女性
            </button>
          </div>
        </Field>

        <Field label="現在の体重 (kg)">
          <input
            type="number"
            step="0.1"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="input"
            placeholder="65.0"
          />
        </Field>

        <Field label="目標体重 (kg)（任意）">
          <input
            type="number"
            step="0.1"
            value={goalKg}
            onChange={(e) => setGoalKg(e.target.value)}
            className="input"
            placeholder="60.0"
          />
        </Field>

        <Field label="Claude APIキー（食事画像の読み取りに使用）">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="input"
            placeholder="sk-ant-..."
          />
          <p className="mt-1 text-xs text-neutral-500">
            このキーはブラウザのローカルストレージにのみ保存され、Claude
            APIへ直接送信されます。
          </p>
        </Field>
      </div>

      <div className="mt-6 flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 dark:border-neutral-700"
          >
            キャンセル
          </button>
        )}
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-40"
        >
          保存
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
      {children}
    </label>
  )
}
