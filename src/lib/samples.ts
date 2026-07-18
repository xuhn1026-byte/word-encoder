import type { WordEntry } from '@/types/word'
import { makeDemoImage } from '@/lib/demoImage'

/** 预置示例词：手工精写，首次启动播种 */
export function buildSamples(): WordEntry[] {
  const now = Date.now()

  const abalone: WordEntry = {
    id: 'sample-abalone',
    word: 'abalone',
    phonetic: '/ˌæbəˈloʊni/',
    meaning: 'n. 鲍鱼',
    chosenIndex: 0,
    level: 0,
    nextReviewAt: now,
    createdAt: now,
    reviewCount: 0,
    plans: [
      {
        methodKey: 'homophone',
        method: '谐音法',
        chunks: [
          { part: 'a', clue: '一个' },
          { part: 'balone', clue: '抱螺你' },
        ],
        scene: '海底拍卖会上，一只鲍鱼死死抱着螺壳大喊「抱螺你！抱螺你！」，谁出价都不撒手——一个（a）抱螺你（balone），就是鲍鱼 abalone。',
        example: 'The diver found a giant abalone under the rock.',
        exampleCn: '潜水员在岩石下发现了一只巨大的鲍鱼。',
      },
      {
        methodKey: 'roots',
        method: '词根词缀',
        chunks: [
          { part: 'ab', clue: '前缀 ab-：离开' },
          { part: 'alone', clue: '独自一个' },
        ],
        scene: '潮水退去，鲍鱼离开（ab-）大部队，独自一个（alone）趴在礁石上晒太阳——ab + alone = abalone。',
        example: 'The diver found a giant abalone under the rock.',
        exampleCn: '潜水员在岩石下发现了一只巨大的鲍鱼。',
      },
      {
        methodKey: 'scene',
        method: '场景联想',
        chunks: [
          { part: 'a', clue: '一个' },
          { part: 'bal', clue: '抱着' },
          { part: 'one', clue: '另一个' },
        ],
        scene: '深夜的海底健身房，一个（a）鲍鱼抱着（bal）另一个（one）鲍鱼练举重，壳碰壳哐哐作响——叠罗汉的鲍鱼，abalone！',
        example: 'The diver found a giant abalone under the rock.',
        exampleCn: '潜水员在岩石下发现了一只巨大的鲍鱼。',
      },
    ],
    image: '',
  }
  abalone.image = makeDemoImage('abalone', ['一个', '抱螺你', '鲍鱼'])

  const abuse: WordEntry = {
    id: 'sample-abuse',
    word: 'abuse',
    phonetic: '/əˈbjuːs/',
    meaning: 'v./n. 滥用；辱骂',
    chosenIndex: 1,
    level: 0,
    nextReviewAt: now,
    createdAt: now,
    reviewCount: 0,
    plans: [
      {
        methodKey: 'homophone',
        method: '谐音法',
        chunks: [
          { part: 'abu', clue: '谐音「恶补」' },
          { part: 'se', clue: '谐音「死」' },
        ],
        scene: '考前恶补（abu）到死（se）地刷题，是对假期最狠的滥用（abuse）！',
        example: 'The new law aims to prevent the abuse of power.',
        exampleCn: '新法律旨在防止权力被滥用。',
      },
      {
        methodKey: 'roots',
        method: '词根词缀',
        chunks: [
          { part: 'ab', clue: '前缀 ab-：偏离' },
          { part: 'use', clue: '词根 use：用' },
        ],
        scene: '好好的锤子被拿去敲核桃——偏离（ab-）了正常用途（use），就是滥用：abuse。',
        example: 'The new law aims to prevent the abuse of power.',
        exampleCn: '新法律旨在防止权力被滥用。',
      },
      {
        methodKey: 'scene',
        method: '场景联想',
        chunks: [
          { part: 'a', clue: '一辆' },
          { part: 'bus', clue: '公交车' },
          { part: 'e', clue: '鹅' },
        ],
        scene: '一辆（a）公交车（bus）被司机私自开去送一只鹅（e）兜风——公车私用，妥妥的滥用职权（abuse）！',
        example: 'The new law aims to prevent the abuse of power.',
        exampleCn: '新法律旨在防止权力被滥用。',
      },
    ],
    image: '',
  }
  abuse.image = makeDemoImage('abuse', ['ab- 偏离', 'use 用', '滥用'])

  const miscellaneous: WordEntry = {
    id: 'sample-miscellaneous',
    word: 'miscellaneous',
    phonetic: '/ˌmɪsəˈleɪniəs/',
    meaning: 'adj. 五花八门的；混杂的',
    chosenIndex: 1,
    level: 0,
    nextReviewAt: now,
    createdAt: now,
    reviewCount: 0,
    plans: [
      {
        methodKey: 'homophone',
        method: '谐音法',
        chunks: [
          { part: 'mis', clue: '谐音「迷思」' },
          { part: 'cell', clue: '谐音「赛哦」' },
          { part: 'a', clue: '谐音「阿」' },
          { part: 'ne', clue: '谐音「呢」' },
          { part: 'ous', clue: '谐音「饿死」' },
        ],
        scene: '迷思（mis）大赛哦（cell）！阿（a）？呢（ne）？饿死（ous）！五花八门的问题把人绕得团团转——miscellaneous。',
        example: 'The drawer was full of miscellaneous odds and ends.',
        exampleCn: '抽屉里塞满了五花八门的零碎杂物。',
      },
      {
        methodKey: 'roots',
        method: '词根词缀',
        chunks: [
          { part: 'misc', clue: '词根 misc-：混合' },
          { part: 'ell', clue: '谐音「哎哟」' },
          { part: 'aneous', clue: '后缀 -aneous：…的' },
        ],
        scene: '各种东西混合（misc-）在一起，哎哟（ell）一声，搅成了五花八门的（-aneous）大杂烩——miscellaneous。',
        example: 'The drawer was full of miscellaneous odds and ends.',
        exampleCn: '抽屉里塞满了五花八门的零碎杂物。',
      },
      {
        methodKey: 'scene',
        method: '场景联想',
        chunks: [
          { part: 'mi', clue: '大米' },
          { part: 's', clue: '一条蛇' },
          { part: 'cell', clue: '小房间' },
          { part: 'aneous', clue: '满屋子的' },
        ],
        scene: '大米（mi）缸里钻进一条蛇（s），钻进小房间（cell）打翻了满屋子的（aneous）杂货——五花八门，一片狼藉！',
        example: 'The drawer was full of miscellaneous odds and ends.',
        exampleCn: '抽屉里塞满了五花八门的零碎杂物。',
      },
    ],
    image: '',
  }
  miscellaneous.image = makeDemoImage('miscellaneous', ['misc 混合', '五花八门', '哎哟'])

  return [abalone, abuse, miscellaneous]
}
