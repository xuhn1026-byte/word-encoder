import type { AISettings, EncodingPlan } from '@/types/word'
import { METHOD_META, METHOD_ORDER } from '@/lib/constants'

/** 去掉模型可能输出的 markdown 代码围栏后解析 JSON */
function parseJsonLoose(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?/im, '')
    .replace(/```$/im, '')
    .trim()
  return JSON.parse(cleaned)
}

function normalizePlans(raw: unknown): EncodingPlan[] {
  const obj = raw as { plans?: unknown }
  const arr = Array.isArray(raw) ? raw : obj?.plans
  if (!Array.isArray(arr) || arr.length === 0) throw new Error('返回结果中没有方案')
  return arr.slice(0, 3).map((p, i) => {
    const plan = p as Partial<EncodingPlan>
    const methodKey = METHOD_ORDER.includes(plan.methodKey as (typeof METHOD_ORDER)[number])
      ? (plan.methodKey as (typeof METHOD_ORDER)[number])
      : METHOD_ORDER[i]
    return {
      methodKey,
      method: plan.method || METHOD_META[methodKey].label,
      chunks: Array.isArray(plan.chunks)
        ? plan.chunks.map((c) => ({ part: String(c?.part ?? ''), clue: String(c?.clue ?? '') }))
        : [],
      scene: String(plan.scene ?? ''),
      example: String(plan.example ?? ''),
      exampleCn: String(plan.exampleCn ?? ''),
      imagePrompt: plan.imagePrompt ? String(plan.imagePrompt) : undefined,
    }
  })
}

/** AI 模式：chat/completions 生成 3 套严格 JSON 编码方案 */
export async function generatePlansAI(word: string, settings: AISettings): Promise<EncodingPlan[]> {
  const base = settings.baseUrl.replace(/\/+$/, '')
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.chatModel,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            '你是英语单词「编码记忆法」教练，帮助中文用户背单词。对用户给出的英文单词，生成恰好 3 套编码方案，方法依次为 homophone（谐音法）、roots（词根词缀）、scene（场景联想）。' +
            '只返回严格 JSON，格式：{"plans":[{"methodKey":"homophone","method":"谐音法","chunks":[{"part":"字母块","clue":"对应中文谐音或含义"}],"scene":"一句生动夸张的联想画面描述（中文）","example":"英文例句","exampleCn":"例句中文翻译","imagePrompt":"用于生成记忆插图的英文绘画提示词，描绘 scene 的画面"}]}。',
        },
        { role: 'user', content: word },
      ],
    }),
  })
  if (!res.ok) throw new Error(`对话接口错误 ${res.status}：${(await res.text()).slice(0, 120)}`)
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('对话接口返回为空')
  return normalizePlans(parseJsonLoose(content))
}

const IMAGE_STYLE = ', cute hand-drawn zine illustration, cream paper background, coral pink and sage green palette, playful doodle style'

/** AI 模式：images/generations 生成记忆插图，返回 dataURL 或 URL */
export async function generateImageAI(prompt: string, settings: AISettings): Promise<string> {
  const base = settings.baseUrl.replace(/\/+$/, '')
  const body = (withB64: boolean) =>
    JSON.stringify({
      model: settings.imageModel,
      prompt: prompt + IMAGE_STYLE,
      n: 1,
      size: '1024x1024',
      ...(withB64 ? { response_format: 'b64_json' } : {}),
    })
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${settings.apiKey}`,
  }

  let res = await fetch(`${base}/images/generations`, { method: 'POST', headers, body: body(true) })
  if (!res.ok) {
    // 部分端点不支持 response_format，降级重试一次
    res = await fetch(`${base}/images/generations`, { method: 'POST', headers, body: body(false) })
  }
  if (!res.ok) throw new Error(`图像接口错误 ${res.status}：${(await res.text()).slice(0, 120)}`)
  const data = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> }
  const item = data.data?.[0]
  if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`
  if (item?.url) return item.url
  throw new Error('图像接口返回为空')
}
