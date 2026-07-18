import { useState } from 'react'
import { toast } from 'sonner'
import { Sparkles, Pin, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LoadingDots from '@/components/LoadingDots'
import PlanCard from '@/components/PlanCard'
import { generateImageAI, generatePlansAI } from '@/lib/ai'
import { demoEncode, shortClue } from '@/lib/demoEncoder'
import { makeDemoImage } from '@/lib/demoImage'
import { METHOD_META } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { AISettings, EncodingPlan, WordEntry } from '@/types/word'

interface Props {
  settings: AISettings
  onSave: (entry: WordEntry) => void
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function Workshop({ settings, onSave }: Props) {
  const [word, setWord] = useState('')
  const [stage, setStage] = useState<'input' | 'plans' | 'imaged'>('input')
  const [loading, setLoading] = useState<'plans' | 'image' | null>(null)
  const [plans, setPlans] = useState<EncodingPlan[]>([])
  const [chosen, setChosen] = useState<number | null>(null)
  const [image, setImage] = useState('')

  const demoImageFor = (w: string, plan: EncodingPlan) =>
    makeDemoImage(w, plan.chunks.map(shortClue))

  const handleEncode = async () => {
    const w = word.trim().toLowerCase()
    if (!/^[a-z][a-z-]*$/.test(w)) {
      toast.error('请输入一个英文单词（仅限字母）')
      return
    }
    setLoading('plans')
    setStage('input')
    setPlans([])
    setChosen(null)
    setImage('')
    try {
      let result: EncodingPlan[]
      if (settings.apiKey) {
        try {
          result = await generatePlansAI(w, settings)
        } catch (err) {
          toast.error(`AI 生成失败，已回退到演示模式：${err instanceof Error ? err.message : '未知错误'}`)
          result = demoEncode(w)
        }
      } else {
        await sleep(600) // 演示模式也展示一下加载节奏
        result = demoEncode(w)
      }
      setPlans(result)
      setStage('plans')
    } finally {
      setLoading(null)
    }
  }

  const handleImage = async () => {
    if (chosen === null) return
    const w = word.trim().toLowerCase()
    const plan = plans[chosen]
    setLoading('image')
    try {
      let img: string
      if (settings.apiKey) {
        try {
          img = await generateImageAI(plan.imagePrompt || `memory illustration for the English word "${w}": ${plan.scene}`, settings)
        } catch (err) {
          toast.error(`AI 绘图失败，已回退到演示图：${err instanceof Error ? err.message : '未知错误'}`)
          img = demoImageFor(w, plan)
        }
      } else {
        await sleep(500)
        img = demoImageFor(w, plan)
      }
      setImage(img)
      setStage('imaged')
    } finally {
      setLoading(null)
    }
  }

  const handleSave = () => {
    if (chosen === null || !image) return
    const w = word.trim().toLowerCase()
    onSave({
      id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      word: w,
      plans,
      chosenIndex: chosen,
      image,
      level: 0,
      nextReviewAt: Date.now(),
      createdAt: Date.now(),
      reviewCount: 0,
    })
    toast.success(`「${w}」已存入词库，可以立即复习`)
    setWord('')
    setPlans([])
    setChosen(null)
    setImage('')
    setStage('input')
  }

  const chosenPlan = chosen !== null ? plans[chosen] : null

  return (
    <div className="mx-auto w-full max-w-[900px]">
      <h2 className="mb-1 text-2xl font-bold">
        <span className="hl">编码工坊</span>
      </h2>
      <p className="mb-8 font-mono text-xs text-grape/60">
        输入一个单词，生成 3 套记忆编码方案：谐音法 / 词根词缀 / 场景联想
      </p>

      {/* 输入区 */}
      <div className="mb-10 flex flex-col gap-3 sm:flex-row">
        <Input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleEncode()}
          placeholder="输入英文单词，如 serendipity"
          className="zine-border h-14 flex-1 rounded-2xl bg-white px-5 font-word text-xl text-grape placeholder:font-body placeholder:text-base placeholder:text-grape/40"
        />
        <Button
          onClick={handleEncode}
          disabled={loading !== null}
          className="h-14 rounded-2xl bg-sage px-8 text-base font-bold text-white hover:bg-sage/90"
        >
          {loading === 'plans' ? (
            <LoadingDots label="编码中" />
          ) : (
            <>
              <Sparkles className="mr-2 size-4" />
              开始编码
            </>
          )}
        </Button>
      </div>

      {/* 方案卡 */}
      {stage !== 'input' && plans.length > 0 && (
        <>
          <div className="mb-6 flex items-baseline gap-3">
            <span className="font-word text-3xl text-grape">{word.trim().toLowerCase()}</span>
            <span className="font-mono text-xs text-grape/60">点选一套你最来电的方案</span>
          </div>
          <div className="grid gap-8 pb-4 md:grid-cols-3 md:gap-5">
            {plans.map((p, i) => (
              <PlanCard key={p.methodKey} plan={p} selected={chosen === i} onSelect={() => setChosen(i)} />
            ))}
          </div>

          {/* 生成图钉按钮 */}
          {chosen !== null && stage === 'plans' && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleImage}
                disabled={loading !== null}
                className="h-13 rounded-full bg-salmon px-8 py-3.5 text-base font-bold text-white hover:bg-salmon/90"
              >
                {loading === 'image' ? (
                  <LoadingDots label="绘制中" />
                ) : (
                  <>
                    <Pin className="mr-2 size-4" />
                    生成记忆图钉
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* 图钉预览 + 存入词库 */}
      {stage === 'imaged' && chosenPlan && (
        <div className="mt-10 flex justify-center">
          <div className="pin-card wiggle-hover relative w-full max-w-md p-6 pt-9">
            <div className="pushpin pushpin-sunny absolute -top-3 left-1/2 -translate-x-1/2" />
            <div className="mb-3 flex items-center justify-between">
              <span className="font-word text-2xl text-grape">{word.trim().toLowerCase()}</span>
              <span className={cn('rounded-full px-3 py-1 font-mono text-xs font-bold', METHOD_META[chosenPlan.methodKey].pillClass)}>
                {chosenPlan.method}
              </span>
            </div>
            <img src={image} alt={`${word} 记忆插图`} className="mb-4 w-full rounded-2xl" />
            <p className="mb-5 text-sm leading-relaxed text-grape/90">{chosenPlan.scene}</p>
            <Button onClick={handleSave} className="w-full rounded-full bg-sage font-bold text-white hover:bg-sage/90">
              <Check className="mr-2 size-4" />
              存入词库
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
