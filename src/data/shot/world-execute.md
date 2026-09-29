---
publishDate: 2026-09-29T14:00:00Z
title: 'world.execute(me); — 网页 PV'
excerpt: 一句话生成的实时渲染网页 PV:把世界送上被告席。节拍同步动画 + Web Audio 频谱分析,全片 100% 程序化 Canvas,没有任何视频文件。
prompt: |
  一句话生成一个world execute me 的网页pv动画,风格放飞一点,音乐资源自己下
harness: ZCode
model: GLM-5.3-Flash
turns: 1
html: world-execute/index.html
image: '~/assets/images/shots/world-execute/index.png'
imageAlt: WORLD EXECUTE ME PV 开场画面,大字排版与播放按钮
tags: [pv, animation, music]
video: true
videoKey: Space
featured: true
---

"风格放飞一点 + 音乐自己下"执行得很彻底:选了 Kevin MacLeod 的《Volatile Reaction》(CC BY 4.0,片头自带署名),
音频经 Web Audio 做节拍/频谱分析驱动动画,视觉全部为程序化 Canvas 实时渲染。

- **多文件收录**(index.html + 5MB 音频):音频分析不能用 file:// 协议(会被 CORS 拦),托管在站点上同源访问正好没问题
- 播放按钮点击后才出声(规避浏览器自动播放限制);音频缺失时自动降级为 visual-only 模式继续跑动画
- 片头有 FLASHING LIGHTS / LOUD 警示,光敏与音量敏感者注意
- **在 iframe 里看:点击播放按钮即可**,想要全屏沉浸请点「新窗口打开」
