---
publishDate: 2026-09-28T11:00:00Z
title: 番茄专注钟
excerpt: 带圆环进度、专注/休息模式切换与完成统计的番茄钟,单文件可交互。
prompt: |
  用单个 HTML 文件做一个番茄钟应用,要求:

  - 米白纸质感背景,卡片式主界面,圆角 + 柔和阴影
  - 顶部「专注 / 休息」两个模式胶囊切换,专注 25 分钟、休息 5 分钟
  - 中间是 SVG 圆环倒计时进度,剩余时间大号等宽数字显示在环中心
  - 开始/暂停合一按钮 + 重置按钮;专注时按钮是暖红色,休息时变绿色
  - 底部统计:今日完成轮数、连续天数、每 4 轮提示长休息
  - 浏览器标签页标题同步显示剩余时间
  - 纯 HTML + CSS + 原生 JS,不依赖任何库
model: GLM-5.3-Flash
harness: ZCode
turns: 1
html: focus-pomodoro.html
image: '~/assets/images/shots/focus-pomodoro.png'
imageAlt: 番茄钟应用截图
tags: [tool, interactive]
featured: true
---

计时核心是 `setInterval` 每秒递减 + 圆环 `stroke-dashoffset` 按剩余比例同步,逻辑 40 行以内。

- 生成后未做任何人工修改,原样收录
- 专注/休息模式切换时会自动重置进度环并按新模式配色
