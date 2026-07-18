import { DEFAULT_SETTINGS, LS_SETTINGS, LS_STUDY_DAYS, LS_WORDS } from '@/lib/constants'
import type { AISettings, WordEntry } from '@/types/word'

/** 读取词库；键不存在返回 null（用于首次启动播种） */
export function loadWords(): WordEntry[] | null {
  try {
    const raw = localStorage.getItem(LS_WORDS)
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as WordEntry[]) : []
  } catch {
    return []
  }
}

export function saveWords(words: WordEntry[]): void {
  localStorage.setItem(LS_WORDS, JSON.stringify(words))
}

export function loadSettings(): AISettings {
  try {
    const raw = localStorage.getItem(LS_SETTINGS)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AISettings>) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(s: AISettings): void {
  localStorage.setItem(LS_SETTINGS, JSON.stringify(s))
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function loadStudyDays(): string[] {
  try {
    const raw = localStorage.getItem(LS_STUDY_DAYS)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

/** 记录今天完成了复习，并返回新的连续学习天数 */
export function markStudiedToday(): number {
  const days = new Set(loadStudyDays())
  days.add(dayKey(new Date()))
  const arr = [...days].sort()
  localStorage.setItem(LS_STUDY_DAYS, JSON.stringify(arr))
  return computeStreak(arr)
}

/** 连续学习天数：从今天（或昨天）往前数连续有记录的日期 */
export function computeStreak(days?: string[]): number {
  const set = new Set(days ?? loadStudyDays())
  const cursor = new Date()
  if (!set.has(dayKey(cursor))) {
    // 今天还没学，从昨天开始往回看
    cursor.setDate(cursor.getDate() - 1)
    if (!set.has(dayKey(cursor))) return 0
  }
  let streak = 0
  while (set.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
