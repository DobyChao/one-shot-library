---
publishDate: 2026-09-29T10:00:00Z
title: 形状工厂 · Shape Factory
excerpt: 一句话生成的类异形工厂(Factorio-like)经营游戏,自带 7 步交互教程:采矿、传送带、切割、旋转、堆叠,组装形状上交。
prompt: |
  一句话生成一个类异形工厂游戏,要有教程
harness: ZCode
model: GLM-5.3-Flash
turns: 1
html: shape-factory.html
image: '~/assets/images/shots/shape-factory.png'
imageAlt: 形状工厂游戏首屏截图,含教程面板与建筑工具栏
tags: [game, canvas, tutorial]
featured: true
---

prompt 只有一句话——"要有教程"这一个约束,换来了完整的 **7 步引导**(从放置开采器一路教到组装上交)。

- 全 Canvas 绘制,单文件 48KB,零外部依赖;暗色网格地图,滚轮缩放、右键/WASD 平移
- 建筑链完整:开采器 → 传送带 → 切割器 / 旋转器 / 堆叠机,把几何形状加工后上交基地,还带垃圾桶与拆除工具
- **在 iframe 预览里玩:先点一下画面拿键盘焦点**;想舒展操作请点「新窗口打开」
