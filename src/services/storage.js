import { INITIAL_MISSION } from '@/logic/mission'

const KEYS = {
  VERSION: 'lifelens_version',
  USER: 'lifelens_user',
  ENTRIES: 'lifelens_entries',
  MISSION: 'lifelens_mission',
}

const CURRENT_VERSION = 3

function seed() {
  localStorage.clear()
  localStorage.setItem(KEYS.VERSION, String(CURRENT_VERSION))
  localStorage.setItem(KEYS.USER, JSON.stringify({ name: 'User', onboardingCompleted: false }))

  const DAY = 864e5
  const now = Date.now()
  const entries = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (14 - i) * DAY)
    // Behavioral pattern: Starting car-heavy, moving to active/transit (transformation story)
    const modes = ['car', 'car', 'car', 'public', 'car', 'car', 'public', 'car', 'public', 'cycle', 'car', 'cycle', 'public', 'cycle']
    const mode = modes[i] || 'public'
    const co2 = mode === 'car' ? 2.5 : mode === 'public' ? 0.5 : 0

    return {
      id: `seed-${i}`,
      date: d.toISOString().split('T')[0],
      timestamp: d.getTime(),
      sleep: 6.5 + (i * 0.1),
      energy: 5 + (i * 0.2) + Math.random(),
      mood: 6 + (i * 0.1) + Math.random(),
      transport: mode,
      wellnessScore: 60 + (i * 2),
      co2Emitted: co2,
    }
  })

  localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries))
  localStorage.setItem(KEYS.MISSION, JSON.stringify(INITIAL_MISSION))
}

export const StorageService = {
  init() {
    const v = localStorage.getItem(KEYS.VERSION)
    if (!v || parseInt(v) !== CURRENT_VERSION) seed()
  },

  resetData: seed,

  saveEntry(entry) {
    const entries = this.getEntries().filter(e => e.date !== entry.date)
    entries.push(entry)
    entries.sort((a, b) => a.timestamp - b.timestamp)
    localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries))
  },

  getEntries() {
    const s = localStorage.getItem(KEYS.ENTRIES)
    return s ? JSON.parse(s) : []
  },

  getMissionState() {
    const s = localStorage.getItem(KEYS.MISSION)
    return s ? JSON.parse(s) : INITIAL_MISSION
  },

  saveMissionState(state) {
    localStorage.setItem(KEYS.MISSION, JSON.stringify(state))
  },

  getUserProfile() {
    const s = localStorage.getItem(KEYS.USER)
    return s ? JSON.parse(s) : { name: 'User', onboardingCompleted: false }
  },

  saveUserProfile(profile) {
    localStorage.setItem(KEYS.USER, JSON.stringify(profile))
  },
}
