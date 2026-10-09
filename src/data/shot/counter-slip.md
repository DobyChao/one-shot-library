---
publishDate: 2026-10-09T12:00:00Z
title: 柜台纸条
excerpt: 样例。第一稿是一张待办清单,第二稿改成三张能划掉的纸条。
prompt: |
  做一张今天柜台用的清单。浅绿底,三条待办,底下放一个提交按钮。
mode: vibe
vibe: 不要表格,改成能划掉的纸条。
outcome: 三张黄纸条,按钮每按一次划掉一条。
turns: 2
html: counter-slip/index.html
image: '~/assets/images/shots/counter-slip/index.png'
imageAlt: 柜台纸条的最终页面,三张黄色便条
tags: [note, tool]
featured: false
session:
  - role: user
    text: |
      做一张今天柜台用的清单。浅绿底,三条待办,底下放一个提交按钮。
    note: 第一稿还是清单。
    html: counter-slip/step-1.html
    image: '~/assets/images/shots/counter-slip/step-1.png'
  - role: agent
    text: |
      做好了。三条都有勾选框,按钮写着提交清单。
  - role: user
    text: |
      表格拿掉,提交也拿掉。换成三张纸条,颜色黄一点,要能一条条划掉。
    note: 第二稿就是下面的最终页面。
    html: counter-slip/index.html
  - role: agent
    text: |
      改好了。三张纸条稍微歪着。底下的按钮按一下,划掉下一条。
---

这是我们写的样例,用来演示多轮对话在时间线上怎么显示。没有模型那边的原始记录,所以工具和模型空着。页面是单独加的两个 HTML。
