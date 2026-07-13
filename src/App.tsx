import { useState } from 'react'
import type { DailyLog, DailyLogs, Profile } from './types'
import { emptyLog, loadDailyLogs, loadProfile, saveDailyLogs, saveProfile, todayKey } from './storage'
import { ProfileSetup } from './components/ProfileSetup'
import { Dashboard } from './components/Dashboard'

function App() {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile())
  const [logs, setLogs] = useState<DailyLogs>(() => loadDailyLogs())

  const handleProfileSave = (p: Profile) => {
    saveProfile(p)
    setProfile(p)
  }

  if (!profile) {
    return <ProfileSetup onSave={handleProfileSave} />
  }

  const key = todayKey()
  const todayLog = logs[key] ?? emptyLog()

  const handleLogChange = (log: DailyLog) => {
    const next = { ...logs, [key]: log }
    saveDailyLogs(next)
    setLogs(next)
  }

  return (
    <Dashboard
      profile={profile}
      log={todayLog}
      onLogChange={handleLogChange}
      onProfileChange={handleProfileSave}
    />
  )
}

export default App
