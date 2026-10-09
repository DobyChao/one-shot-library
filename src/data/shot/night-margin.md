---
publishDate: 2026-10-08T12:00:00Z
title: 夜读页边
excerpt: 样例。第一稿把一句话放在中间,第二稿改成能往下读的一页。
prompt: |
  做一页夜里看的。背景用米白。中间只放一句:灯还亮着的时候,只读一页。先做成海报,字居中。
mode: vibe
vibe: 夜里看的一页,不要海报。
outcome: 第二稿把字靠左,右边留了一行小字。
turns: 2
harness: Cursor
model: Grok 4.7 High
html: night-margin/index.html
image: '~/assets/images/shots/night-margin/index.png'
imageAlt: 夜读页边的最终页面,字靠左,右边有一行小字
tags: [reading, page]
featured: false
session:
  - role: user
    text: |
      做一页夜里看的。背景用米白。中间只放一句:灯还亮着的时候,只读一页。先做成海报,字居中。
    note: 第一稿,字在中间。
    html: night-margin/step-1.html
    image: '~/assets/images/shots/night-margin/step-1.png'
  - role: agent
    text: |
      做好了。一句大字居中,纸色底,没有正文。
  - role: user
    text: |
      太大了,看着像广告。标题靠左,正文窄一点,右边留空写一句批注。开头那句留着。
    note: 第二稿就是下面的最终页面。
    html: night-margin/index.html
  - role: agent
    text: |
      改好了。标题和正文靠左,右边有一行小字。
---

这是我们写的样例,用来演示多轮对话在时间线上怎么显示。工具是 Cursor,模型是 Grok 4.7 High。页面是单独加的两个 HTML。
