import { useState } from 'react'
import type { DailyLog, DailyLogs, Profile } from './types'
import { emptyLog, loadDailyLogs, loadProfile, saveDailyLogs, saveProfile, todayKey } from './storage'
import { ProfileSetup } from './components/ProfileSetup'
import { Dashboard } from './components/Dashboard'

function App() {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile())
  const [logs, setLogs] = useState<DailyLogs>(() => loadDailyLogs())
  const [selectedDate, setSelectedDate] = useState(() => todayKey())

  const handleProfileSave = (p: Profile) => {
    saveProfile(p)
    setProfile(p)
  }

  if (!profile) {
    return <ProfileSetup onSave={handleProfileSave} />
  }

  const selectedLog = logs[selectedDate] ?? emptyLog()

  const handleLogChange = (log: DailyLog) => {
    const next = { ...logs, [selectedDate]: log }
    saveDailyLogs(next)
    setLogs(next)
  }

  return (
    <Dashboard
      profile={profile}
      log={selectedLog}
      logs={logs}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
      onLogChange={handleLogChange}
      onProfileChange={handleProfileSave}
    />
  )
}

export default App
