import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PartyPopper, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { INTERVALS_MIN, MAX_LEVEL, METHOD_META, fmtRelative } from '@/lib/constants'
import { computeStreak, markStudiedToday } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { WordEntry } from '@/types/word'

interface Props {
  words: WordEntry[]
  onUpdate: (id: string, patch: Partial<WordEntry>) => void
}

type Grade = 'forgot' | 'vague' | 'known'

export default function Review({ words, onUpdate }: Props) {
  const [now, setNow] = useState(() => Date.now())
  const [flipped, setFlipped] = useState(false)
  const [streak, setStreak] = useState(() => computeStreak())

  // 每分钟刷新一次到期状态
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  const due = useMemo(
    () => words.filter((w) => w.nextReviewAt <= now).sort((a, b) => a.nextReviewAt - b.nextReviewAt),
    [words, now],
  )
  const current = due[0] ?? null
  const currentId = current?.id

  // 换卡时合回正面
  useEffect(() => {
    setFlipped(false)
  }, [currentId])

  const nextUpcoming = useMemo(() => {
    const future = words.filter((w) => w.nextReviewAt > now).sort((a, b) => a.nextReviewAt - b.nextReviewAt)
    return future[0] ?? null
  }, [words, now])

  const grade = (g: Grade) => {
    if (!current) return
    let level: number
    if (g === 'forgot') level = 0
    else if (g === 'vague') level = Math.max(0, current.level - 1)
    else level = Math.min(MAX_LEVEL, current.level + 1)
    const nextReviewAt = Date.now() + INTERVALS_MIN[level] * 60_000
    onUpdate(current.id, { level, nextReviewAt, reviewCount: current.reviewCount + 1 })
    setStreak(markStudiedToday())
    const label = g === 'forgot' ? '忘记' : g === 'vague' ? '模糊' : '记住'
    toast.success(`「${current.word}」标记为${label}，${fmtRelative(nextReviewAt)}再见`)
  }

  const plan = current?.plans[current.chosenIndex]

  return (
    <div className="mx-auto w-full max-w-[900px]">
      <h2 className="mb-1 text-2xl font-bold">
        <span className="hl">复习</span>
      </h2>
      <p className="mb-6 font-mono text-xs text-grape/60">艾宾浩斯间隔重复 · 点击卡片翻面</p>

      {/* 统计条 */}
      <div className="mb-10 grid grid-cols-3 gap-3">
        {[
          { label: '今日待复习', value: due.length },
          { label: '词库总数', value: words.length },
          { label: '连续学习', value: `${streak} 天` },
        ].map((s) => (
          <div key={s.label} className="zine-border rounded-2xl bg-white px-4 py-3 text-center">
            <p className="font-word text-2xl text-grape">{s.value}</p>
            <p className="mt-0.5 font-mono text-[11px] text-grape/60">{s.label}</p>
          </div>
        ))}
      </div>

      {current && plan ? (
        <div className="flex flex-col items-center">
          {/* 抽认卡 */}
          <div className="flip-scene w-full max-w-xl cursor-pointer select-none" onClick={() => setFlipped((v) => !v)}>
            <div className={cn('flip-inner', flipped && 'flipped')}>
              {/* 正面：特大单词 */}
              <div className="flip-face pin-card relative flex min-h-72 flex-col items-center justify-center p-8 pt-12">
                <div className="pushpin pushpin-sage absolute -top-3 left-1/2 -translate-x-1/2" />
                <span className="word-display break-words text-center text-grape">{current.word}</span>
                {current.phonetic && <span className="mt-3 font-mono text-sm text-grape/60">{current.phonetic}</span>}
                <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs text-grape/50">
                  <RotateCw className="size-3.5" />
                  点击翻面
                </span>
              </div>
              {/* 背面：释义 + 编码方案 + 记忆图 */}
              <div className="flip-face flip-back pin-card absolute inset-0 overflow-y-auto p-6 pt-10">
                <div className="pushpin pushpin-sunny absolute -top-3 left-1/2 -translate-x-1/2" />
                {current.meaning && <p className="mb-3 text-center text-lg font-bold text-grape">{current.meaning}</p>}
                <div className="mb-3 text-center">
                  <span className={cn('rounded-full px-3 py-1 font-mono text-xs font-bold', METHOD_META[plan.methodKey].pillClass)}>
                    {plan.method}
                  </span>
                </div>
                <img src={current.image} alt={`${current.word} 记忆插图`} className="mx-auto mb-3 w-full max-w-xs rounded-2xl" />
                <div className="mb-2 flex flex-wrap justify-center gap-1.5">
                  {plan.chunks.map((c, i) => (
                    <span key={i} className="zine-border rounded-lg bg-cream/70 px-2 py-1 text-xs">
                      <span className="font-word">{c.part}</span>
                      <span className="mx-1 text-grape/40">→</span>
                      {c.clue}
                    </span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-grape/85">{plan.scene}</p>
              </div>
            </div>
          </div>

          {/* 自评三档 */}
          <div className={cn('mt-8 flex gap-3 transition-opacity', !flipped && 'pointer-events-none opacity-30')}>
            <Button onClick={() => grade('forgot')} className="rounded-full bg-salmon px-6 font-bold text-white hover:bg-salmon/90">
              忘记
            </Button>
            <Button onClick={() => grade('vague')} className="rounded-full bg-sunny px-6 font-bold text-grape hover:bg-sunny/90">
              模糊
            </Button>
            <Button onClick={() => grade('known')} className="rounded-full bg-sage px-6 font-bold text-white hover:bg-sage/90">
              记住
            </Button>
          </div>
          <p className="mt-3 font-mono text-[11px] text-grape/50">
            剩余 {due.length} 张 · 忘记→重学 · 模糊→降一级 · 记住→升一级
          </p>
        </div>
      ) : (
        <div className="zine-border flex flex-col items-center rounded-3xl bg-white/60 py-20 text-center">
          <PartyPopper className="mb-4 size-10 text-salmon" />
          <p className="text-lg font-bold text-grape">今天的复习全部完成！</p>
          {nextUpcoming ? (
            <p className="mt-2 font-mono text-xs text-grape/60">
              下一枚图钉「{nextUpcoming.word}」{fmtRelative(nextUpcoming.nextReviewAt, now)}到期
            </p>
          ) : (
            <p className="mt-2 font-mono text-xs text-grape/60">去编码工坊添加新单词吧</p>
          )}
        </div>
      )}
    </div>
  )
}
