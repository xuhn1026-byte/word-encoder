import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Download, Hammer, Package, Search, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import WordPackDialog from '@/components/WordPackDialog'
import { METHOD_META, METHOD_ORDER, MAX_LEVEL, fmtRelative, hashStr } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { MethodKey, WordEntry } from '@/types/word'

interface Props {
  words: WordEntry[]
  onDelete: (id: string) => void
  onImport: (incoming: WordEntry[]) => number
  onAddMany: (entries: WordEntry[]) => number
  onGoWorkshop: () => void
}

/** 由 id 生成稳定的 -2 ~ 2deg 随机旋转 */
function tiltOf(id: string): number {
  return (hashStr(id) % 41) / 10 - 2
}

function MasteryDots({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1" title={`掌握度 ${level}/${MAX_LEVEL}`}>
      {Array.from({ length: MAX_LEVEL + 1 }).map((_, i) => (
        <span
          key={i}
          className={cn('inline-block size-2 rounded-full', i <= level ? 'bg-sage' : 'bg-grape/15')}
        />
      ))}
    </span>
  )
}

export default function Library({ words, onDelete, onImport, onAddMany, onGoWorkshop }: Props) {
  const [query, setQuery] = useState('')
  const [method, setMethod] = useState<MethodKey | 'all'>('all')
  const [detail, setDetail] = useState<WordEntry | null>(null)
  const [packOpen, setPackOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return words.filter((w) => {
      if (q && !w.word.includes(q) && !(w.meaning ?? '').includes(q)) return false
      if (method !== 'all' && w.plans[w.chosenIndex]?.methodKey !== method) return false
      return true
    })
  }, [words, query, method])

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(words, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `word-encoder-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`已导出 ${words.length} 个单词`)
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as unknown
      if (!Array.isArray(parsed)) throw new Error('格式不正确')
      const valid = parsed.filter(
        (w): w is WordEntry =>
          !!w && typeof w.word === 'string' && Array.isArray(w.plans) && typeof w.id === 'string',
      )
      if (valid.length === 0) throw new Error('没有可用的单词数据')
      const added = onImport(valid)
      toast.success(`导入完成：新增 ${added} 个，跳过重复 ${valid.length - added} 个`)
    } catch (err) {
      toast.error(`导入失败：${err instanceof Error ? err.message : '未知错误'}`)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[900px]">
      <h2 className="mb-1 text-2xl font-bold">
        <span className="hl">我的词库</span>
      </h2>
      <p className="mb-8 font-mono text-xs text-grape/60">
        共 {words.length} 枚记忆图钉 · localStorage 持久化
      </p>

      {/* 工具栏 */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setPackOpen(true)}
          className="sticker wiggle-hover inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold"
        >
          <Package className="size-4" />
          新手词包
        </button>
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-grape/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索单词或释义…"
            className="zine-border rounded-full bg-white pl-9"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMethod('all')}
            className={cn(
              'rounded-full px-3 py-1.5 font-mono text-xs font-bold transition-colors',
              method === 'all' ? 'bg-grape text-cream' : 'zine-border bg-white text-grape',
            )}
          >
            全部
          </button>
          {METHOD_ORDER.map((k) => (
            <button
              key={k}
              onClick={() => setMethod(k)}
              className={cn(
                'rounded-full px-3 py-1.5 font-mono text-xs font-bold transition-opacity',
                METHOD_META[k].pillClass,
                method !== k && 'opacity-45',
              )}
            >
              {METHOD_META[k].label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="zine-border rounded-full bg-white">
            <Download className="mr-1.5 size-3.5" />
            导出
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            className="zine-border rounded-full bg-white"
          >
            <Upload className="mr-1.5 size-3.5" />
            导入
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportFile} />
        </div>
      </div>

      {/* 图钉网格 */}
      {filtered.length === 0 ? (
        words.length === 0 ? (
          /* 空态引导：大图钉卡片 */
          <div className="flex justify-center py-10">
            <div className="pin-card wiggle-hover relative w-full max-w-md p-8 pt-12 text-center" style={{ transform: 'rotate(-1.2deg)' }}>
              <div className="pushpin pushpin-sunny absolute -top-3 left-1/2 -translate-x-1/2" />
              <p className="font-word text-2xl text-grape">还没有单词？</p>
              <p className="mt-2 text-sm text-grape/70">先从新手词包开始，一键钉好 40 枚记忆图钉</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={() => setPackOpen(true)} className="rounded-full bg-salmon px-6 font-bold text-white hover:bg-salmon/90">
                  <Package className="mr-2 size-4" />
                  去词包
                </Button>
                <Button onClick={onGoWorkshop} variant="outline" className="zine-border rounded-full bg-white px-6 font-bold text-grape">
                  <Hammer className="mr-2 size-4" />
                  去编码工坊
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="zine-border rounded-3xl bg-white/50 py-20 text-center">
            <p className="text-grape/60">没有匹配的单词</p>
          </div>
        )
      ) : (
        <div className="grid gap-8 pb-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => {
            const plan = w.plans[w.chosenIndex]
            return (
              <div
                key={w.id}
                onClick={() => setDetail(w)}
                className="pin-card wiggle-hover relative cursor-pointer p-5 pt-8 transition-shadow hover:shadow-pop"
                style={{ transform: `rotate(${tiltOf(w.id)}deg)` }}
              >
                <div className="pushpin absolute -top-3 left-1/2 -translate-x-1/2" />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(w.id)
                    toast(`已删除「${w.word}」`)
                  }}
                  className="absolute right-3 top-3 rounded-full p-1 text-grape/30 transition-colors hover:bg-coral hover:text-grape"
                  aria-label="删除"
                >
                  <X className="size-4" />
                </button>
                <p className="font-word mb-2 break-words text-2xl leading-tight text-grape">{w.word}</p>
                {w.meaning && <p className="mb-3 text-sm text-grape/75">{w.meaning}</p>}
                {plan && (
                  <span className={cn('mb-3 inline-block rounded-full px-2.5 py-0.5 font-mono text-xs font-bold', METHOD_META[plan.methodKey].pillClass)}>
                    {plan.method}
                  </span>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-dotted border-grape/30 pt-3">
                  <MasteryDots level={w.level} />
                  <span className="font-mono text-[11px] text-grape/60">
                    复习：{fmtRelative(w.nextReviewAt)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 详情 Dialog */}
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-grape bg-cream sm:max-w-lg" style={{ borderStyle: 'dotted' }}>
          {detail && (
            <DetailView entry={detail} onDelete={() => { onDelete(detail.id); setDetail(null) }} />
          )}
        </DialogContent>
      </Dialog>

      {/* 新手词包 Dialog */}
      <WordPackDialog open={packOpen} onOpenChange={setPackOpen} words={words} onAddMany={onAddMany} />
    </div>
  )
}

function DetailView({ entry, onDelete }: { entry: WordEntry; onDelete: () => void }) {
  const plan = entry.plans[entry.chosenIndex]
  return (
    <div className="pt-2">
      <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-word text-4xl text-grape">{entry.word}</span>
        {entry.phonetic && <span className="font-mono text-sm text-grape/60">{entry.phonetic}</span>}
      </div>
      {entry.meaning && <p className="mb-3 text-grape/85">{entry.meaning}</p>}
      {plan && (
        <span className={cn('mb-4 inline-block rounded-full px-3 py-1 font-mono text-xs font-bold', METHOD_META[plan.methodKey].pillClass)}>
          {plan.method}
        </span>
      )}
      <img src={entry.image} alt={`${entry.word} 记忆插图`} className="mb-4 w-full rounded-2xl" />
      {plan && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {plan.chunks.map((c, i) => (
              <span key={i} className="zine-border rounded-lg bg-white px-2.5 py-1.5 text-sm">
                <span className="font-word text-grape">{c.part}</span>
                <span className="mx-1.5 text-grape/40">→</span>
                <span>{c.clue}</span>
              </span>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-grape/90">{plan.scene}</p>
          <div className="rounded-xl bg-white p-3 text-sm">
            <p className="italic text-grape">{plan.example}</p>
            <p className="mt-1 text-grape/70">{plan.exampleCn}</p>
          </div>
        </div>
      )}
      <div className="mt-5 flex items-center justify-between">
        <span className="font-mono text-xs text-grape/60">
          等级 {entry.level}/{MAX_LEVEL} · 已复习 {entry.reviewCount} 次 · 下次 {fmtRelative(entry.nextReviewAt)}
        </span>
        <Button variant="outline" size="sm" onClick={onDelete} className="zine-border rounded-full bg-white text-salmon hover:bg-coral">
          <Trash2 className="mr-1.5 size-3.5" />
          删除
        </Button>
      </div>
    </div>
  )
}
