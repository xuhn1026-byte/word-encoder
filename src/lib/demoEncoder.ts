import { HOMOPHONES, LETTER_SHAPES, PREFIXES, ROOTS, SUFFIXES } from '@/lib/demoData'
import { hashStr } from '@/lib/constants'
import type { Chunk, EncodingPlan } from '@/types/word'

const byLenDesc = (a: [string, string], b: [string, string]) => b[0].length - a[0].length
const PREFIXES_S = [...PREFIXES].sort(byLenDesc)
const ROOTS_S = [...ROOTS].sort(byLenDesc)
const SUFFIXES_S = [...SUFFIXES].sort(byLenDesc)

/** 从 clue 中提取可印在图上的短文字 */
export function shortClue(c: Chunk): string {
  const m = c.clue.match(/「([^」]+)」/)
  if (m) return m[1]
  const i = c.clue.indexOf('：')
  if (i >= 0) return c.clue.slice(i + 1)
  return c.part
}

function clueForPiece(piece: string): string {
  const hit = HOMOPHONES[piece]
  if (hit) return `谐音「${hit}」`
  // 形近联想：逐字母描述形状
  const shapes = piece
    .split('')
    .map((l) => `${l} 像${LETTER_SHAPES[l] ?? '小符号'}`)
    .join('，')
  return `${shapes}（形近联想）`
}

/** 把一串字母切成 2-3 字母的块并配 clue */
function chunkLetters(letters: string): Chunk[] {
  const chunks: Chunk[] = []
  let rest = letters
  while (rest.length > 0) {
    let size = 2
    if (rest.length === 3) size = 3
    else if (rest.length === 1) size = 1
    else if (rest.length >= 4) {
      // 优先取能查到谐音的 3 字母块
      size = HOMOPHONES[rest.slice(0, 3)] ? 3 : 2
    }
    const piece = rest.slice(0, size)
    chunks.push({ part: piece, clue: clueForPiece(piece) })
    rest = rest.slice(size)
  }
  return chunks
}

/** 谐音法：整词切成 2-3 字母块查谐音表 */
function homophoneChunks(word: string): Chunk[] {
  const w = word.toLowerCase()
  const chunks: Chunk[] = []
  let i = 0
  while (i < w.length) {
    const rest = w.length - i
    let size = 0
    if (rest >= 3 && HOMOPHONES[w.slice(i, i + 3)]) size = 3
    else if (rest >= 2 && HOMOPHONES[w.slice(i, i + 2)]) size = 2
    else size = rest >= 3 ? 3 : rest
    // 避免结尾剩 1 个字母：并进前一块
    if (rest - size === 1) size += 1
    const piece = w.slice(i, i + size)
    chunks.push({ part: piece, clue: clueForPiece(piece) })
    i += size
  }
  return chunks
}

/** 词根词缀：先剥前缀后缀，中段贪心最长匹配词根 */
function rootsChunks(word: string): Chunk[] {
  let rest = word.toLowerCase()
  const chunks: Chunk[] = []

  const pre = PREFIXES_S.find(([p]) => rest.startsWith(p) && rest.length - p.length >= 3)
  if (pre) {
    chunks.push({ part: pre[0], clue: `前缀 ${pre[0]}-：${pre[1]}` })
    rest = rest.slice(pre[0].length)
  }

  const suf = SUFFIXES_S.find(([s]) => rest.endsWith(s) && rest.length - s.length >= 2)
  const mid = suf ? rest.slice(0, rest.length - suf[0].length) : rest

  // 中段：最长匹配词根，未命中字母积累后切块
  let i = 0
  let buf = ''
  const flushBuf = () => {
    if (buf) {
      chunks.push(...chunkLetters(buf))
      buf = ''
    }
  }
  while (i < mid.length) {
    const root = ROOTS_S.find(([r]) => mid.startsWith(r, i))
    if (root) {
      flushBuf()
      chunks.push({ part: root[0], clue: `词根 ${root[0]}：${root[1]}` })
      i += root[0].length
    } else {
      buf += mid[i]
      i += 1
    }
  }
  flushBuf()

  if (suf) chunks.push({ part: suf[0], clue: `后缀 -${suf[0]}：${suf[1]}` })
  return chunks
}

const EXAMPLES: Array<[string, string]> = [
  ['I finally locked the word "{w}" in my memory palace.', '我终于把「{w}」这个词锁进了记忆宫殿。'],
  ['My teacher smiled when I used "{w}" correctly.', '我正确使用「{w}」时，老师笑了。'],
  ['The word "{w}" jumped off the flashcard and into my brain.', '「{w}」从抽认卡上一跃，跳进了我的大脑。'],
]

function pickExample(word: string): { example: string; exampleCn: string } {
  const [en, cn] = EXAMPLES[hashStr(word) % EXAMPLES.length]
  return { example: en.replaceAll('{w}', word), exampleCn: cn.replaceAll('{w}', word) }
}

/** 演示模式：本地规则生成 3 套编码方案 */
export function demoEncode(word: string): EncodingPlan[] {
  const w = word.toLowerCase().trim()
  const { example, exampleCn } = pickExample(w)

  const hc = homophoneChunks(w)
  const rc = rootsChunks(w)
  const sc = homophoneChunks(w) // 场景联想复用谐音切块，讲一个更夸张的故事

  const homophoneScene = `把 ${w} 拆成 ${hc.map((c) => c.part).join(' + ')}，用中文扯着嗓子大声念：${hc
    .map((c) => shortClue(c))
    .join('！')}！声音越夸张，${w} 就焊在脑子里越牢。`

  const hasRootOrAffix = rc.some((c) => c.clue.startsWith('前缀') || c.clue.startsWith('词根') || c.clue.startsWith('后缀'))
  const rootsScene = hasRootOrAffix
    ? `${w} 的偏旁部首排排站：${rc.map((c) => `${c.part}（${shortClue(c)}）`).join('，')}。把意思串起来——${rc
        .map((c) => shortClue(c))
        .join(' + ')}，整个词的核心含义立刻浮出脑海！`
    : `这个词没有太多词根花样，那就把字母块当成积木：${rc.map((c) => c.part).join(' + ')}，一块一块搭出 ${w}。`

  const sceneScene = `脑洞小剧场开演：${sc
    .map((c) => shortClue(c))
    .join('、')}轮番登场，在奶油色的大舞台上追逐打闹、抱作一团，最后「砰」地一声拼出了 ${w}。画面越离谱，记得越牢！`

  return [
    { methodKey: 'homophone', method: '谐音法', chunks: hc, scene: homophoneScene, example, exampleCn },
    { methodKey: 'roots', method: '词根词缀', chunks: rc, scene: rootsScene, example, exampleCn },
    { methodKey: 'scene', method: '场景联想', chunks: sc, scene: sceneScene, example, exampleCn },
  ]
}
