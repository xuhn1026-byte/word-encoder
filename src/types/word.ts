export interface Chunk {
  /** 字母块，如 "ab" / "tion" */
  part: string
  /** 对应中文谐音或含义 */
  clue: string
}

export type MethodKey = 'homophone' | 'roots' | 'scene'

export interface EncodingPlan {
  methodKey: MethodKey
  /** 方法名：谐音法 / 词根词缀 / 场景联想 */
  method: string
  chunks: Chunk[]
  /** 一句生动夸张的联想画面描述（中文） */
  scene: string
  example: string
  exampleCn: string
  /** AI 生图用的英文提示词（演示模式可省略） */
  imagePrompt?: string
}

export interface WordEntry {
  id: string
  word: string
  phonetic?: string
  meaning?: string
  plans: EncodingPlan[]
  chosenIndex: number
  /** data URI 或 URL */
  image: string
  /** 艾宾浩斯等级 0-7 */
  level: number
  nextReviewAt: number
  createdAt: number
  reviewCount: number
}

export interface AISettings {
  baseUrl: string
  apiKey: string
  chatModel: string
  imageModel: string
}
