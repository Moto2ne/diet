import type { Profile } from '../types'
import { ProfileSetup } from './ProfileSetup'

interface Props {
  profile: Profile
  onSave: (profile: Profile) => void
  onClose: () => void
}

export function Settings({ profile, onSave, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-10 bg-white dark:bg-neutral-950">
      <ProfileSetup
        initial={profile}
        onSave={(p) => {
          onSave(p)
          onClose()
        }}
        onCancel={onClose}
      />
    </div>
  )
}
