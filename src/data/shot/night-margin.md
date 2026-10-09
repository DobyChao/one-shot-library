---
publishDate: 2026-10-08T12:00:00Z
title: 夜读页边
excerpt: 从居中海报改成可以顺着读的一页。展陈样例,用来演示多轮时间线。
prompt: |
  做一页夜读。米白纸,一句短引文居中,像海报。句子用:灯还亮着的时候,只读一页。
mode: vibe
vibe: 灯下读一页,字要沉,边距要宽。
outcome: 从居中海报改成左对齐的窄栏,页边留出批注。
turns: 2
html: night-margin/index.html
image: '~/assets/images/shots/night-margin/index.png'
imageAlt: 夜读页边成稿,左对齐窄栏与页边批注
tags: [reading, page]
featured: false
session:
  - role: user
    text: |
      做一页夜读。米白纸,一句短引文居中,像海报。句子用:灯还亮着的时候,只读一页。
    note: 第一稿是居中海报。
    html: night-margin/step-1.html
    image: '~/assets/images/shots/night-margin/step-1.png'
  - role: agent
    text: |
      先交一版居中的引文海报:大字、宽留白、纸色背景,没有正文。
  - role: user
    text: |
      不要海报。改成可以顺着读的一页:标题靠左,正文窄栏,页边像笔记。仍用那句做开头。
    note: 成稿在页底预览,这一步不再嵌一次。
    html: night-margin/index.html
  - role: agent
    text: |
      改成左对齐窄栏,墨蓝字,页边留出一行批注。
---

这是为会话时间线准备的展陈样例。对话由馆方撰写,不是某次模型转录,因此没有填写 harness 和 model。两份页面都是为本条目新写的静态 HTML。
