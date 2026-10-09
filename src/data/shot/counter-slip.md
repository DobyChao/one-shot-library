---
publishDate: 2026-10-09T12:00:00Z
title: 柜台纸条
excerpt: 从一份要勾完的清单,改成可以划掉的三张纸条。展陈样例,用来演示多轮时间线。
prompt: |
  做一张今日柜台清单。浅绿色表格,三条待办,底部一个提交按钮。
mode: vibe
vibe: 柜台边的纸条要能划掉,不要再像一张表。
outcome: 清单收成三张赭色纸条,划掉即可,不再提交。
turns: 2
html: counter-slip/index.html
image: '~/assets/images/shots/counter-slip/index.png'
imageAlt: 柜台纸条成稿,三张赭色便条
tags: [note, tool]
featured: false
session:
  - role: user
    text: |
      做一张今日柜台清单。浅绿色表格,三条待办,底部一个提交按钮。
    note: 第一稿还是一张清单。
    html: counter-slip/step-1.html
    image: '~/assets/images/shots/counter-slip/step-1.png'
  - role: agent
    text: |
      先交一张浅绿色清单:三条待办,勾选框,底部是提交。
  - role: user
    text: |
      不要表格,也不要提交。改成三张可以划掉的纸条,颜色用柜台灯下的赭黄。
    note: 成稿在页底预览,这一步不再嵌一次。
    html: counter-slip/index.html
  - role: agent
    text: |
      收成三张略微歪斜的纸条。底部一枚按钮,按一次划掉下一条。
---

这是为会话时间线准备的展陈样例。对话由馆方撰写,不是某次模型转录,因此没有填写 harness 和 model。两份页面都是为本条目新写的静态 HTML。
