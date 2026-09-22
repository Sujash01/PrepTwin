import type { CandidateProfile } from '../utils/types'
import { generateId } from '../utils/helpers'

const STORAGE_KEY = 'preptwin-candidate-profile'

export const candidateService = {
  saveCandidateProfile(profile: Omit<CandidateProfile, 'id' | 'createdAt'>): CandidateProfile {
    const saved: CandidateProfile = {
      id: generateId(),
      createdAt: new Date(),
      ...profile,
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      // sessionStorage unavailable — the profile still lives in memory for this session.
    }
    return saved
  },

  getCandidateProfile(): CandidateProfile | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as CandidateProfile
      parsed.createdAt = new Date(parsed.createdAt)
      return parsed
    } catch {
      return null
    }
  },

  clearCandidateProfile(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  },
}