---
publishDate: 2026-10-14T12:00:00Z
updateDate: 2026-10-14T12:30:00Z
title: 东方琥珀录 ～ Ephemeral Amber Memory
excerpt: 浏览器纵版 STG。Stage 1–6 加 Extra，角色、弹幕、背景全是 SVG（美术 v1.1 重绘）。?treat=1 开 Treat 观关。17 首 Web Audio BGM，M 或 ?mute=1 静音。
prompt: |
  按 SCRIPT.md 先做可玩的 Stage 1 切片。浏览器纵版 STG。正式画面只用 SVG，不要位图。策划写关卡，美术出 SVG，程序接到本地静态页上。
mode: vibe
vibe: 全 SVG 的纵版 STG，从 1 面切片做到 1–6 加 Extra。
outcome: 标题按 Z 从 1 面打到 Extra。Treat 能看完全关，Music Room 能播合成曲，也能静音。
turns: 4
harness: Cursor
model: Grok 4.7
html: amber-memory/index.html
image: '~/assets/images/shots/amber-memory/index.png'
imageAlt: 东方琥珀录 Stage 1 道中，湖面背景和琥珀妖精
tags: [game, svg, touhou, canvas, webaudio]
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
    note: 这一版曲目表还没有声音。
  - role: agent
    text: |
      标题画面按 C 进 Music Room，上下选曲，Z 会提示没有音频。正式素材仍然只有 SVG。
  - role: user
    text: |
      再收一版。SVG 按 v1.1 重绘，描边清楚一点。Shift 按住时松 Z，射击不要粘住，低速要看见判定点。Normal 弹速和密度乘 0.85，难的几段再削一点。加 ?treat=1：无敌、弹更疏、判定点一直亮，用来看完全关。Music Room 用 Web Audio 按 17 个曲目 id 合成 BGM。M 静音，?mute=1 强制关。Treat 不要把音乐关掉。
    note: 这一版就是收录的最终页。
    html: amber-memory/index.html
  - role: agent
    text: |
      换上 v1.1 的 SVG。Shift+Z 松开后射击会停，低速画出判定点。默认难度按 0.85 收过。地址加 ?treat=1，标题会写 Treat，判定点一直亮。Music Room 按 Z 播对应 id 的合成曲。M 切换静音，?mute=1 进来就是关的。Treat 本身不关音乐。
---

多文件收录在 `public/artifacts/amber-memory/`（`index.html`、`js/`、`css/`、`assets/` 里的 SVG）。预览走 `/artifacts/amber-memory/index.html`。

上面的时间线是按分工收口写的摘要，不是逐字对话。Grok 在 Cursor 里协调策划、美术、程序。剧本原文没有贴进来。

- 硬规则：正式可视素材只用 SVG。美术 v1.1 用硬描边和实色重绘了自机、各面 Boss 和几颗弹，同名覆盖
- 操作：方向键 / WASD 移动，Z 射击或确认，Shift 低速并显示判定点，X 战斗中 Bomb、对话里跳过，C 战斗中 Bomb、标题进 Music Room，M 切换静音。标题按 Z 从 Stage 1 开始
- Shift 按住时松 Z，射击不会粘住
- `?treat=1`：无敌、残机 99、弹更慢更疏、判定点常亮，用来看完全关。Treat 不关音乐
- 默认 Normal 的弹速和发数乘 0.85，热点另削。`?simple=1` 再松一档
- BGM 是 Web Audio 合成的 17 首（`bgm_title` 到 `bgm_staff`），没有音频文件。第一次按键才出声。M 切换静音，`?mute=1` 强制关
- **在 iframe 里玩：先点一下画面拿键盘焦点**，再按 Z。完整画面用「新窗口打开」
