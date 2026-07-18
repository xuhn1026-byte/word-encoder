import { useCallback, useEffect, useState } from 'react'
import type { WordEntry } from '@/types/word'
import { loadWords, saveWords } from '@/lib/store'
import { buildSamples } from '@/lib/samples'

export function useWords() {
  const [words, setWords] = useState<WordEntry[]>(() => {
    const existing = loadWords()
    if (existing === null) {
      // 首次启动：预置示例词
      const samples = buildSamples()
      saveWords(samples)
      return samples
    }
    return existing
  })

  useEffect(() => {
    saveWords(words)
  }, [words])

  const addWord = useCallback((entry: WordEntry) => {
    setWords((prev) => [entry, ...prev])
  }, [])

  const updateWord = useCallback((id: string, patch: Partial<WordEntry>) => {
    setWords((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)))
  }, [])

  const deleteWord = useCallback((id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id))
  }, [])

  /** 批量入库：按 word 文本去重，返回实际新增数 */
  const addWordsMany = useCallback((entries: WordEntry[]): number => {
    let added = 0
    setWords((prev) => {
      const existing = new Set(prev.map((w) => w.word))
      const fresh = entries.filter((e) => !existing.has(e.word))
      added = fresh.length
      return [...fresh, ...prev]
    })
    return added
  }, [])

  const importWords = useCallback((incoming: WordEntry[]): number => {
    let added = 0
    setWords((prev) => {
      const ids = new Set(prev.map((w) => w.id))
      const fresh = incoming.filter((w) => !ids.has(w.id))
      added = fresh.length
      return [...fresh, ...prev]
    })
    return added
  }, [])

  return { words, addWord, updateWord, deleteWord, addWordsMany, importWords }
}
