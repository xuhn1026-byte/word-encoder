import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Check, Package } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import LoadingDots from '@/components/LoadingDots'
import { WORD_PACKS } from '@/lib/wordPacks'
import { demoEncode, shortClue } from '@/lib/demoEncoder'
import { makeDemoImage } from '@/lib/demoImage'
import { cn } from '@/lib/utils'
import type { WordEntry } from '@/types/word'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  words: WordEntry[]
  onAddMany: (entries: WordEntry[]) => number
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function WordPackDialog({ open, onOpenChange, words, onAddMany }: Props) {
  const [packId, setPackId] = useState(WORD_PACKS[0].id)
  const [checked, setChecked] = useState<Set<string>>(() => new Set(WORD_PACKS[0].words.map((w) => w.word)))
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })

  const pack = WORD_PACKS.find((p) => p.id === packId) ?? WORD_PACKS[0]
  const existing = useMemo(() => new Set(words.map((w) => w.word)), [words])

  const selectPack = (id: string) => {
    const p = WORD_PACKS.find((x) => x.id === id)
    if (!p || running) return
    setPackId(id)
    setChecked(new Set(p.words.map((w) => w.word)))
  }

  const toggle = (word: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(word)) next.delete(word)
      else next.add(word)
      return next
    })
  }

  const handleRun = async () => {
    const selected = pack.words.filter((w) => checked.has(w.word))
    if (selected.length === 0) {
      toast.error('先勾选要编码的单词')
      return
    }
    setRunning(true)
    try {
      const todo = selected.filter((w) => !existing.has(w.word))
      const skipped = selected.length - todo.length
      setProgress({ done: 0, total: todo.length })
      const entries: WordEntry[] = []
      for (let i = 0; i < todo.length; i++) {
        const item = todo[i]
        const plans = demoEncode(item.word)
        const image = makeDemoImage(item.word, plans[0].chunks.map(shortClue))
        entries.push({
          id: `w-pack-${pack.id}-${item.word}-${Date.now()}`,
          word: item.word,
          phonetic: item.phonetic,
          meaning: item.meaning,
          plans,
          chosenIndex: 0,
          image,
          level: 0,
          nextReviewAt: Date.now(),
          createdAt: Date.now(),
          reviewCount: 0,
        })
        setProgress({ done: i + 1, total: todo.length })
        if (i % 5 === 4) await sleep(0) // 分批让出主线程，避免 UI 卡死
      }
      const added = onAddMany(entries)
      toast.success(`成功入库 ${added} 个，跳过 ${skipped + (entries.length - added)} 个`)
      onOpenChange(false)
    } finally {
      setRunning(false)
      setProgress({ done: 0, total: 0 })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !running && onOpenChange(o)}>
      <DialogContent
        className="max-h-[88vh] overflow-y-auto border-grape bg-cream sm:max-w-3xl"
        style={{ borderStyle: 'dotted' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-grape">
            <Package className="size-5 text-salmon" />
            新手词包
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 md:flex-row">
          {/* 左侧词包卡片 */}
          <div className="grid shrink-0 grid-cols-2 gap-4 md:w-52 md:grid-cols-1">
            {WORD_PACKS.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPack(p.id)}
                className={cn(
                  'zine-border wiggle-hover rounded-3xl bg-white p-4 text-left transition-shadow',
                  packId === p.id && 'border-solid ring-2 ring-salmon ring-offset-2 ring-offset-cream',
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-grape">{p.name}</span>
                  <span className="font-mono text-[10px] text-salmon">{p.words.length} 词</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-grape/65">{p.desc}</p>
              </button>
            ))}
          </div>

          {/* 右侧单词网格 */}
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs text-grape/60">
                已选 {checked.size}/{pack.words.length}
              </span>
              <span className="flex gap-3">
                <button
                  onClick={() => setChecked(new Set(pack.words.map((w) => w.word)))}
                  className="link-dotted font-mono text-xs text-grape/70 hover:text-grape"
                >
                  全选
                </button>
                <button
                  onClick={() => setChecked(new Set())}
                  className="link-dotted font-mono text-xs text-grape/70 hover:text-grape"
                >
                  清空
                </button>
              </span>
            </div>
            <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {pack.words.map((w) => {
                const on = checked.has(w.word)
                const dup = existing.has(w.word)
                return (
                  <button
                    key={w.word}
                    onClick={() => toggle(w.word)}
                    className={cn(
                      'zine-border flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 text-left',
                      dup && 'opacity-50',
                    )}
                  >
                    {/* 小贴纸勾选样式 */}
                    <span
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-white outline outline-1 outline-ink transition-colors',
                        on ? 'bg-salmon' : 'bg-cream',
                      )}
                      style={{ transform: 'rotate(-3deg)' }}
                    >
                      {on && <Check className="size-3.5 text-white" strokeWidth={3.5} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-word text-sm text-grape">
                        {w.word}
                        {dup && <span className="ml-1.5 font-mono text-[10px] text-sage">已在库</span>}
                      </span>
                      <span className="block truncate text-xs text-grape/60">{w.meaning}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            {/* 进度条 + 执行按钮 */}
            {running && (
              <div className="mt-4">
                <div className="h-3 overflow-hidden rounded-full bg-grape/10">
                  <div
                    className="h-full rounded-full bg-sunny transition-all duration-200"
                    style={{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : '0%' }}
                  />
                </div>
                <p className="mt-2 text-center">
                  <LoadingDots label={`正在编码 ${progress.done}/${progress.total}`} />
                </p>
              </div>
            )}
            <Button
              onClick={handleRun}
              disabled={running || checked.size === 0}
              className="mt-4 w-full rounded-full bg-salmon font-bold text-white hover:bg-salmon/90"
            >
              {running ? '编码中…' : `批量编码 ${checked.size} 个词`}
            </Button>
            <p className="mt-2 text-center font-mono text-[10px] text-grape/50">
              使用本地演示编码器，不消耗 AI 配额 · 已在词库中的单词自动跳过
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
