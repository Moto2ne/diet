import { useRef, useState } from 'react'
import { parseNutritionImage, type ParsedNutrition } from '../api/visionClient'
import type { FoodEntry } from '../types'

interface Props {
  apiKey: string
  onAdd: (entry: FoodEntry) => void
}

export function FoodUpload({ apiKey, onAdd }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<ParsedNutrition | null>(null)

  const handleFile = async (file: File) => {
    setPreviewUrl(URL.createObjectURL(file))
    setDraft(null)
    setError('')

    if (!apiKey) {
      setStatus('error')
      setError('設定画面でClaude APIキーを登録してください。')
      return
    }

    setStatus('loading')
    try {
      const result = await parseNutritionImage(apiKey, file)
      setDraft(result)
      setStatus('idle')
    } catch (e) {
      setStatus('error')
      setError(e instanceof Error ? e.message : '画像の読み取りに失敗しました。')
    }
  }

  const handleConfirm = () => {
    if (!draft) return
    onAdd({
      id: crypto.randomUUID(),
      label: draft.label,
      calories: draft.calories,
      proteinG: draft.proteinG,
      fatG: draft.fatG,
      carbsG: draft.carbsG,
      fiberG: draft.fiberG,
      timestamp: Date.now(),
    })
    setDraft(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <h3 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-50">
        食事を追加
      </h3>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full rounded-lg border-2 border-dashed border-neutral-300 py-6 text-sm text-neutral-500 hover:border-blue-400 dark:border-neutral-700"
      >
        栄養成分のスクリーンショットを選択
      </button>

      {previewUrl && (
        <img
          src={previewUrl}
          alt="プレビュー"
          className="mt-3 max-h-48 w-full rounded-lg object-contain"
        />
      )}

      {status === 'loading' && (
        <p className="mt-3 text-sm text-neutral-500">読み取り中...</p>
      )}

      {status === 'error' && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {draft && (
        <div className="mt-3 space-y-2 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
          <DraftField label="内容" value={draft.label} onChange={(v) => setDraft({ ...draft, label: v })} isText />
          <DraftField label="カロリー (kcal)" value={draft.calories} onChange={(v) => setDraft({ ...draft, calories: Number(v) })} />
          <DraftField label="たんぱく質 (g)" value={draft.proteinG} onChange={(v) => setDraft({ ...draft, proteinG: Number(v) })} />
          <DraftField label="脂質 (g)" value={draft.fatG} onChange={(v) => setDraft({ ...draft, fatG: Number(v) })} />
          <DraftField label="炭水化物 (g)" value={draft.carbsG} onChange={(v) => setDraft({ ...draft, carbsG: Number(v) })} />
          <DraftField label="食物繊維 (g)" value={draft.fiberG} onChange={(v) => setDraft({ ...draft, fiberG: Number(v) })} />
          <button
            type="button"
            onClick={handleConfirm}
            className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
          >
            この内容で記録する
          </button>
        </div>
      )}
    </div>
  )
}

function DraftField({
  label,
  value,
  onChange,
  isText,
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  isText?: boolean
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
      <input
        type={isText ? 'text' : 'number'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-32 rounded border border-neutral-300 px-2 py-1 text-right dark:border-neutral-700 dark:bg-neutral-800"
      />
    </label>
  )
}
