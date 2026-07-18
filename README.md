# 单词编码记忆系统（Word Encoder）

帮助中文用户通过「编码记忆法」背英语单词的本地网页应用，艺术 zine × 手账风设计。

线上地址：<https://xuhn1026-byte.github.io/word-encoder/>

## 功能

- **编码工坊**：输入英文单词，生成 3 套编码方案（谐音法 / 词根词缀 / 场景联想），配 AI 或本地演示记忆插图，一键存入词库
- **我的词库**：记忆图钉卡片墙（localStorage 持久化），支持搜索、按方法筛选、删除、导入/导出 JSON
- **复习**：艾宾浩斯 8 级间隔重复，翻面抽认卡 + 忘记/模糊/记住三档自评，统计今日待复习与连续学习天数
- **新手词包**：内置高考 / 四级 / 六级 / 考研 4 个词包共 160 个高频词，本地批量编码一键入库
- **双模式**：配置 OpenAI 兼容接口（设置 Dialog）走 AI 生成；未填 Key 自动使用本地演示编码器，开箱即用

## 技术栈

React 19 + TypeScript + Vite 7 + Tailwind CSS 3.4 + shadcn/ui

## 本地开发

```bash
npm install
npm run dev      # 开发服务器
npm run build    # 生产构建（输出 dist/）
```

## 部署

构建产物推送到 `gh-pages` 分支，由 GitHub Pages 托管（`vite.config.ts` 已配置 `base: './'`）。
