---
publishDate: 2026-09-30T00:30:00Z
title: 'world.execute(me); — fan PV(本地学习版)'
excerpt: 同一题材的第二次生成:这次指名 Mili 原曲并自带播放方案。音频经 Web Audio 节拍分析驱动全片,视觉 100% 程序化 Canvas。
prompt: |
  一句话生成一个Mili - world.execute (me) 的网页pv动画,有音乐资源文件,仅本地学习使用。
harness: ZCode
model: GLM-5.3-Flash
turns: 1
series: world-execute-me
html: wem/index.html
image: '~/assets/images/shots/wem/index.png'
imageAlt: world.execute(me) fan PV 开场画面
tags: [pv, animation, music]
video: true
videoKey: Space
featured: true
---

与系列另一件(world-execute,配 CC 音乐)互为对照:同样的"放飞 PV"命题,这次指名了 Mili 原曲。

- **版权处理得干净**:HTML 本体不含音频,运行时在同目录探测 mp3(支持 `music.mp3` 等别名,还能把文件直接拖进页面);页脚自带「版权归 Mili · 仅供本地学习 · 请勿传播」。所以公开仓库只收录 HTML,**线上是 visual-only 模式**(无声时钟驱动,动画照常),本地学习时把 mp3 放进同目录即可获得节拍同步的完整体验
- 音频缺失自动降级 + 拖拽导入,工程完成度比上一件更高
- Space 播放/暂停;片头同样有光敏与音量警示
