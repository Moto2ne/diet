import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'
import type { DailySummary } from '../calc'

interface Props {
  baselineWeightKg: number
  summary: DailySummary
}

export function WeightReveal({ baselineWeightKg, summary }: Props) {
  const { projectedWeightKg, deltaKg, bmr, tdee, caloriesIn, netBalance } = summary
  const [displayWeight, setDisplayWeight] = useState(baselineWeightKg)

  useEffect(() => {
    const controls = animate(baselineWeightKg, projectedWeightKg, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplayWeight(v),
    })
    return () => controls.stop()
  }, [baselineWeightKg, projectedWeightKg])

  const isLosing = deltaKg < -0.005
  const isGaining = deltaKg > 0.005

  const mood = isLosing ? 'happy' : isGaining ? 'sad' : 'neutral'

  const moodStyles = {
    happy: {
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      text: 'text-emerald-600 dark:text-emerald-400',
      emoji: '😄',
    },
    sad: {
      bg: 'bg-slate-100 dark:bg-slate-900',
      text: 'text-slate-500 dark:text-slate-400',
      emoji: '😢',
    },
    neutral: {
      bg: 'bg-neutral-50 dark:bg-neutral-900',
      text: 'text-neutral-600 dark:text-neutral-400',
      emoji: '😐',
    },
  }[mood]

  return (
    <div className={`rounded-2xl p-6 text-center ${moodStyles.bg}`}>
      <motion.div
        key={mood}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={
          isLosing
            ? { scale: [0.5, 1.15, 1], opacity: 1, y: [0, -12, 0] }
            : isGaining
              ? { scale: [0.5, 1.05, 1], opacity: 1, y: [0, 6, 0] }
              : { scale: [0.5, 1], opacity: 1 }
        }
        transition={{ duration: 0.8, delay: 1.1 }}
        className="text-5xl"
      >
        {moodStyles.emoji}
      </motion.div>

      <div className="mt-3 text-4xl font-bold tabular-nums text-neutral-900 dark:text-neutral-50">
        {displayWeight.toFixed(2)} kg
      </div>

      <div className={`mt-1 text-sm font-medium ${moodStyles.text}`}>
        {deltaKg === 0
          ? '変化なし'
          : `${deltaKg > 0 ? '+' : ''}${deltaKg.toFixed(3)} kg`}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-neutral-500">
        <Stat label="基礎代謝" value={`${Math.round(bmr)} kcal`} />
        <Stat label="消費カロリー" value={`${Math.round(tdee)} kcal`} />
        <Stat label="摂取カロリー" value={`${Math.round(caloriesIn)} kcal`} />
        <Stat label="収支" value={`${netBalance > 0 ? '+' : ''}${Math.round(netBalance)} kcal`} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/60 px-2 py-1.5 dark:bg-black/20">
      <div>{label}</div>
      <div className="font-semibold text-neutral-700 dark:text-neutral-300">{value}</div>
    </div>
  )
}
