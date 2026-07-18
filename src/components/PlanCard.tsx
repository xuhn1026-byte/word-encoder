import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { METHOD_META } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { EncodingPlan } from '@/types/word'

interface Props {
  plan: EncodingPlan
  selected: boolean
  onSelect: () => void
}

export default function PlanCard({ plan, selected, onSelect }: Props) {
  const [showExample, setShowExample] = useState(false)
  const meta = METHOD_META[plan.methodKey]

  return (
    <div
      onClick={onSelect}
      className={cn(
        'pin-card wiggle-hover relative cursor-pointer p-6 pt-8 transition-shadow hover:shadow-pop',
        selected && 'ring-2 ring-sage ring-offset-2 ring-offset-cream',
      )}
    >
      {/* 顶部图钉 */}
      <div className="pushpin absolute -top-3 left-1/2 -translate-x-1/2" />

      {selected && <span className="sticker absolute -right-3 -top-3 px-3 py-1 text-xs font-bold">已选中</span>}

      <div className="mb-4 flex items-center justify-between">
        <span className={cn('rounded-full px-3 py-1 font-mono text-xs font-bold', meta.pillClass)}>
          {plan.method}
        </span>
      </div>

      {/* 拆分链条 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {plan.chunks.map((c, i) => (
          <span key={i} className="zine-border rounded-lg bg-cream/60 px-2.5 py-1.5 text-sm">
            <span className="font-word text-base text-grape">{c.part}</span>
            <span className="mx-1.5 text-grape/40">→</span>
            <span>{c.clue}</span>
          </span>
        ))}
      </div>

      {/* 联想画面 */}
      <p className="mb-3 text-sm leading-relaxed text-grape/90">{plan.scene}</p>

      {/* 例句：0fr → 1fr 展开 */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setShowExample((v) => !v)
        }}
        className="link-dotted inline-flex items-center gap-1 font-mono text-xs text-grape/70 hover:text-grape"
      >
        例句
        <ChevronDown className={cn('size-3.5 transition-transform duration-300', showExample && 'rotate-180')} />
      </button>
      <div className={cn('reveal', showExample && 'open')}>
        <div>
          <div className="mt-2 rounded-xl bg-cream/70 p-3 text-sm">
            <p className="italic text-grape">{plan.example}</p>
            <p className="mt-1 text-grape/70">{plan.exampleCn}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
