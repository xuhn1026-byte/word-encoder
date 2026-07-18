import type { AISettings, MethodKey } from '@/types/word'

/** 艾宾浩斯复习间隔（分钟） */
export const INTERVALS_MIN = [20, 60, 540, 1440, 2880, 8640, 21600, 44640] as const

export const MAX_LEVEL = INTERVALS_MIN.length - 1

export const METHOD_META: Record<MethodKey, { label: string; pillClass: string }> = {
  homophone: { label: '谐音法', pillClass: 'pill-homophone' },
  roots: { label: '词根词缀', pillClass: 'pill-roots' },
  scene: { label: '场景联想', pillClass: 'pill-scene' },
}

export const METHOD_ORDER: MethodKey[] = ['homophone', 'roots', 'scene']

export const LS_WORDS = 'wcs.words'
export const LS_SETTINGS = 'wcs.settings'
export const LS_STUDY_DAYS = 'wcs.studyDays'

export const DEFAULT_SETTINGS: AISettings = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  chatModel: 'gpt-4o-mini',
  imageModel: 'dall-e-3',
}

/** 把毫秒时间戳格式化为「x 分钟后 / x 小时后 / x 天后 / 现在」 */
export function fmtRelative(ts: number, now = Date.now()): string {
  const diff = ts - now
  if (diff <= 0) return '现在'
  const min = Math.round(diff / 60000)
  if (min < 60) return `${min} 分钟后`
  const h = Math.round(min / 60)
  if (h < 24) return `${h} 小时后`
  const d = Math.round(h / 24)
  return `${d} 天后`
}

/** 由字符串生成稳定哈希（用于确定性随机） */
export function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}
