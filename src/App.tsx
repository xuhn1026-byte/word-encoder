import { useMemo, useState } from 'react'
import { BookOpen, Hammer, RotateCw, Settings } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import SettingsDialog from '@/components/SettingsDialog'
import Workshop from '@/sections/Workshop'
import Library from '@/sections/Library'
import Review from '@/sections/Review'
import { useWords } from '@/hooks/useWords'
import { loadSettings } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { AISettings } from '@/types/word'

type Tab = 'workshop' | 'library' | 'review'

const TABS: Array<{ key: Tab; label: string; icon: typeof Hammer }> = [
  { key: 'workshop', label: '编码工坊', icon: Hammer },
  { key: 'library', label: '我的词库', icon: BookOpen },
  { key: 'review', label: '复习', icon: RotateCw },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('workshop')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<AISettings>(() => loadSettings())
  const { words, addWord, updateWord, deleteWord, addWordsMany, importWords } = useWords()

  const dueCount = useMemo(() => words.filter((w) => w.nextReviewAt <= Date.now()).length, [words])

  const navButton = (t: (typeof TABS)[number]) => {
    const Icon = t.icon
    const active = tab === t.key
    return (
      <button
        key={t.key}
        onClick={() => setTab(t.key)}
        className={cn(
          'relative flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-bold transition-all',
          active ? 'bg-sage text-white shadow-pin' : 'zine-border bg-white/60 text-grape hover:bg-white',
        )}
      >
        <Icon className="size-4" />
        {t.label}
        {t.key === 'review' && dueCount > 0 && (
          <span className="sticker -mr-1 px-2 py-0.5 font-mono text-[10px]">{dueCount}</span>
        )}
      </button>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* 桌面端窄左侧栏 */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-dotted border-grape/40 px-5 py-8 md:flex">
        <div className="mb-2">
          <h1 className="text-3xl font-black leading-tight tracking-wide text-grape">
            单词
            <br />
            编码
          </h1>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-grape/50">
            Word Encoder Zine
          </p>
        </div>
        <nav className="mt-10 flex flex-col gap-3">{TABS.map(navButton)}</nav>
        <div className="mt-auto">
          <button
            onClick={() => setSettingsOpen(true)}
            className="link-dotted inline-flex items-center gap-1.5 font-mono text-xs text-grape/70 hover:text-grape"
          >
            <Settings className="size-3.5" />
            接口设置
          </button>
          <p className="mt-3 font-mono text-[10px] text-grape/40">
            {settings.apiKey ? 'AI 模式' : '演示模式'}
          </p>
        </div>
      </aside>

      {/* 移动端顶部栏 */}
      <div className="fixed inset-x-0 top-0 z-20 flex items-center gap-2 border-b border-dotted border-grape/40 bg-cream/95 px-4 py-3 backdrop-blur md:hidden">
        <span className="mr-1 text-lg font-black text-grape">单词编码</span>
        <div className="flex flex-1 gap-1.5 overflow-x-auto">{TABS.map(navButton)}</div>
        <button onClick={() => setSettingsOpen(true)} aria-label="设置" className="p-1 text-grape/70">
          <Settings className="size-5" />
        </button>
      </div>

      {/* 主内容区 */}
      <main className="min-w-0 flex-1 px-5 pb-20 pt-24 sm:px-8 md:px-10 md:pt-12">
        {tab === 'workshop' && <Workshop settings={settings} onSave={addWord} />}
        {tab === 'library' && (
          <Library
            words={words}
            onDelete={deleteWord}
            onImport={importWords}
            onAddMany={addWordsMany}
            onGoWorkshop={() => setTab('workshop')}
          />
        )}
        {tab === 'review' && <Review words={words} onUpdate={updateWord} />}
      </main>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} onSaved={setSettings} />
      <Toaster position="top-center" richColors />
    </div>
  )
}
