---
publishDate: 2026-09-28T10:00:00Z
title: Aurora 风格 SaaS 落地页
excerpt: 暗色极光渐变的虚构笔记应用「Lumina」落地页,含功能网格、数据带与三档定价。
prompt: |
  用单个 HTML 文件生成一个 SaaS 产品落地页,要求:

  - 产品:一个叫 Lumina 的 AI 笔记应用,中文文案
  - 风格:暗色主题,背景要有极光渐变光斑缓慢漂移的动画效果
  - 结构:吸顶导航、居中 hero(标题含渐变色文字)、六宫格功能区、
    数据统计带、三档定价卡(中间一档高亮标记"最受欢迎")、页脚
  - 交互:卡片 hover 上浮,按钮 hover 有位移和阴影变化
  - 约束:纯 HTML + CSS,不依赖任何外部资源,响应式适配移动端
model: GLM-5.3-Flash
harness: ZCode
turns: 1
html: aurora-landing.html
image: '~/assets/images/shots/aurora-landing.png'
imageAlt: Lumina 落地页首屏截图
tags: [landing-page, saas, dark-theme]
featured: true
---

极光背景用了两个 `radial-gradient` 光斑 + `filter: blur(120px)` + 交替位移动画,全程 GPU 合成,不影响滚动性能。

- 生成后未做任何人工修改,原样收录
- 单文件约 260 行,零外部依赖,移动端隐藏导航链接
