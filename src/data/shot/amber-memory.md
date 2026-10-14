---
publishDate: 2026-10-14T12:00:00Z
title: 东方琥珀录 ～ Ephemeral Amber Memory
excerpt: 浏览器纵版 STG。Stage 1–6 加 Extra，角色、弹幕、背景全是 SVG。
prompt: |
  按 SCRIPT.md 先做可玩的 Stage 1 切片。浏览器纵版 STG。正式画面只用 SVG，不要位图。策划写关卡，美术出 SVG，程序接到本地静态页上。
mode: vibe
vibe: 全 SVG 的纵版 STG，从 1 面切片做到 1–6 加 Extra。
outcome: 标题按 Z 从 1 面打到 Extra，C 打开 Music Room。曲目表没有音频。
turns: 3
harness: Cursor
model: Grok 4.7
html: amber-memory/index.html
image: '~/assets/images/shots/amber-memory/index.png'
imageAlt: 东方琥珀录 Stage 1 道中，湖面背景和琥珀妖精
tags: [game, svg, touhou, canvas]
video: true
videoKey: Z
featured: true
session:
  - role: user
    text: |
      按 SCRIPT.md 先做可玩的 Stage 1 切片。浏览器纵版 STG。正式画面只用 SVG，不要位图。策划写关卡，美术出 SVG，程序接到本地静态页上。
    note: 先只做 1 面。剧本在 SCRIPT.md，这里不贴全文。
  - role: agent
    text: |
      Stage 1 能玩。标题、道中、Boss 雫。自机、妖精、弹幕、湖面背景和标题字都是 SVG，相对路径加载。方向键或 WASD 移动，Z 射击，Shift 低速，X 跳过对话。
  - role: user
    text: |
      按同样规矩把 Stage 2 到 6 和 Extra 接上。还是只用 SVG。每面的 Boss、符卡和背景分开交。
  - role: agent
    text: |
      2 面木灵响子、3 面算盘珠、4 面阿求投影和墨染、5 面久远寺琥珀、6 面天香久远，Extra 天逆烛。可以从标题一路打下去，也可以用 ?phase= 跳到某一段。
  - role: user
    text: |
      加一个 Music Room。标题按 C 进去。没有音频文件的话就只列曲名，不要塞占位音乐。
    note: 这一版就是收录的最终页。
    html: amber-memory/index.html
  - role: agent
    text: |
      标题画面按 C 进 Music Room，上下选曲，Z 会提示没有音频。正式素材仍然只有 SVG。
---

多文件收录在 `public/artifacts/amber-memory/`（`index.html`、`js/`、`css/`、`assets/` 里的 SVG）。预览走 `/artifacts/amber-memory/index.html`。

上面的时间线是按分工收口写的摘要，不是逐字对话。Grok 在 Cursor 里协调策划、美术、程序。剧本原文没有贴进来。

- 硬规则：正式可视素材只用 SVG
- 操作：方向键 / WASD 移动，Z 射击或确认，Shift 低速，X 跳过对话，C 进 Music Room。标题按 Z 从 Stage 1 开始
- Music Room 只有曲目列表，没有音频
- **在 iframe 里玩：先点一下画面拿键盘焦点**，再按 Z。完整画面用「新窗口打开」
