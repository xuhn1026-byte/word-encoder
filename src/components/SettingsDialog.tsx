import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loadSettings, saveSettings } from '@/lib/store'
import type { AISettings } from '@/types/word'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (s: AISettings) => void
}

export default function SettingsDialog({ open, onOpenChange, onSaved }: Props) {
  const [form, setForm] = useState<AISettings>(() => loadSettings())

  const set = (k: keyof AISettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    const cleaned: AISettings = {
      baseUrl: form.baseUrl.trim() || 'https://api.openai.com/v1',
      apiKey: form.apiKey.trim(),
      chatModel: form.chatModel.trim() || 'gpt-4o-mini',
      imageModel: form.imageModel.trim() || 'dall-e-3',
    }
    saveSettings(cleaned)
    onSaved(cleaned)
    toast.success(cleaned.apiKey ? '设置已保存，将使用 AI 模式' : '设置已保存，当前为演示模式')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-grape bg-cream sm:max-w-md" style={{ borderStyle: 'dotted' }}>
        <DialogHeader>
          <DialogTitle className="text-grape">接口设置</DialogTitle>
          <DialogDescription className="text-grape/70">
            配置 OpenAI 兼容接口。未填 API Key 时自动使用「演示模式」（本地规则生成）；部分 API
            端点可能存在浏览器 CORS 限制。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="baseUrl" className="font-mono text-xs text-grape/70">
              Base URL
            </Label>
            <Input
              id="baseUrl"
              value={form.baseUrl}
              onChange={set('baseUrl')}
              placeholder="https://api.openai.com/v1"
              className="zine-border bg-white font-mono text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="apiKey" className="font-mono text-xs text-grape/70">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={form.apiKey}
              onChange={set('apiKey')}
              placeholder="sk-…（留空则使用演示模式）"
              className="zine-border bg-white font-mono text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="chatModel" className="font-mono text-xs text-grape/70">
                对话模型
              </Label>
              <Input
                id="chatModel"
                value={form.chatModel}
                onChange={set('chatModel')}
                placeholder="gpt-4o-mini"
                className="zine-border bg-white font-mono text-sm"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="imageModel" className="font-mono text-xs text-grape/70">
                图像模型
              </Label>
              <Input
                id="imageModel"
                value={form.imageModel}
                onChange={set('imageModel')}
                placeholder="dall-e-3"
                className="zine-border bg-white font-mono text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} className="rounded-full bg-sage text-white hover:bg-sage/90">
            保存设置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
