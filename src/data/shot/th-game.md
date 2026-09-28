---
publishDate: 2026-09-28T14:00:00Z
title: 東方星塵録 ~ Star Dust Incident.
excerpt: 一句话生成的东方同人纵版弹幕射击,完整 6 关剧情,角色/弹幕/背景 Canvas 绘制,音乐音效 Web Audio 合成。
prompt: |
  一句话生成一个完整的弹幕射击游戏,以touhou project为背景,包含完整6 stage。
  素材尽量自己画,音乐也是,可以上网找背景参考。剧情建议自己想一个。
harness: ZCode
model: GLM-5.3-Flash
turns: 1
html: th-game/index.html
image: '~/assets/images/shots/th-game/index.png'
imageAlt: 東方星塵録游戏标题画面截图
tags: [game, canvas, webaudio]
featured: true
---

**这个产物是多文件形态**(index.html + 5 个本地 JS 模块),所以收录为 `public/artifacts/th-game/` 整个子目录,
预览走 `/artifacts/th-game/index.html`,其余几件作品则是单文件直接托管。

- 零外部依赖:素材全部程序实时生成——角色、弹幕、背景为 Canvas 代码绘制,音乐音效由 Web Audio 实时合成,没有任何资源文件
- 原创剧情「六扇星门与未完的诗」:初秋星屑坠落幻想乡,六位门守依次登场,完整 6 stage + Boss 战
- 操作:方向键/WASD 移动,Z 射击,X 符卡(Bomb),Shift 低速模式,Esc 暂停,M 静音
- **在 iframe 预览里玩:先点击一次游戏画面获得键盘焦点**,再按 Z 开始;想要完整体验也可以点「新窗口打开」
