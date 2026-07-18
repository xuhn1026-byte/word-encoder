import { hashStr } from '@/lib/constants'

/** 确定性伪随机数生成器（同一个单词每次生成同一张图） */
function mulberry(seed: number) {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function starPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45
    const ang = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${(cx + rad * Math.cos(ang)).toFixed(1)},${(cy + rad * Math.sin(ang)).toFixed(1)}`)
  }
  return pts.join(' ')
}

/**
 * 演示模式记忆插图：奶油色底 + 打散字母 + 手绘涂鸦形状 + 中文 clue，
 * 返回内联 SVG data URI。
 */
export function makeDemoImage(word: string, clues: string[]): string {
  const rand = mulberry(hashStr(word.toLowerCase()))
  const W = 480
  const H = 360
  const palette = ['#F28482', '#84A59D', '#563E79', '#C98F2D']
  const letters = word.toLowerCase().split('')
  const fontSize = letters.length > 10 ? 40 : letters.length > 6 ? 54 : 72

  // 字母沿波浪线打散排布
  const spans: string[] = []
  const step = (W - 80) / Math.max(letters.length, 1)
  letters.forEach((ch, i) => {
    const x = 40 + step * i + step / 2 + (rand() - 0.5) * 14
    const y = 150 + Math.sin(i * 1.1) * 34 + (rand() - 0.5) * 26
    const rot = ((rand() - 0.5) * 36).toFixed(1)
    const fill = palette[Math.floor(rand() * palette.length)]
    spans.push(
      `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})" font-family="'Arial Black', Impact, sans-serif" font-size="${fontSize}" font-weight="900" fill="${fill}" text-anchor="middle">${ch}</text>`,
    )
  })

  // 手绘涂鸦：圆、星、波浪线
  const cx = 60 + rand() * (W - 160)
  const cy = 60 + rand() * 60
  const cr = 18 + rand() * 16
  const sx = W - 70 - rand() * 60
  const sy = 70 + rand() * 50
  const waveY = 235 + rand() * 20
  const wave = `M 30 ${waveY.toFixed(0)} q 30 -22 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`
  const doodles = [
    `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${cr.toFixed(0)}" fill="none" stroke="#F28482" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 9"/>`,
    `<polygon points="${starPoints(sx, sy, 24)}" fill="#FFCE80" stroke="#563E79" stroke-width="2.5" stroke-linejoin="round"/>`,
    `<path d="${wave}" fill="none" stroke="#84A59D" stroke-width="4" stroke-linecap="round"/>`,
    `<circle cx="${(W - 60 - rand() * 80).toFixed(0)}" cy="${(255 + rand() * 40).toFixed(0)}" r="7" fill="#F5CAC3" stroke="#563E79" stroke-width="2"/>`,
  ]

  // 中文 clue 文字（最多 3 条）
  const clueTexts = clues
    .filter(Boolean)
    .slice(0, 3)
    .map((c, i) => {
      const x = 70 + i * 150 + rand() * 20
      const y = 300 + (i % 2) * 28
      const rot = ((rand() - 0.5) * 8).toFixed(1)
      return `<text x="${x.toFixed(0)}" y="${y}" transform="rotate(${rot} ${x.toFixed(0)} ${y})" font-family="'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="21" font-weight="700" fill="#563E79">${c}</text>`
    })

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="24" fill="#FDF3E7"/>
  <rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="20" fill="none" stroke="#563E79" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>
  ${doodles.join('\n  ')}
  ${spans.join('\n  ')}
  ${clueTexts.join('\n  ')}
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
