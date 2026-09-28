---
publishDate: 2026-09-28T12:00:00Z
title: Nimbus 运营数据看板
excerpt: 侧边导航 + KPI 卡 + 柱状趋势图 + 订单表格的电商运营看板,纯 CSS 图表。
prompt: |
  用单个 HTML 文件生成一个电商运营数据看板,要求:

  - 左侧白色侧边导航(品牌名、6 个菜单项、当前项高亮、底部用户信息),移动端隐藏
  - 顶部标题区 + 「今日 / 近 7 日 / 近 30 日」分段切换器
  - 四张 KPI 卡:GMV、有效订单、支付转化率、客单价,各带涨跌徽章(绿涨红跌)
  - 主区两栏:左栏近 7 日营收柱状图(纯 CSS,进场时从底部生长),右栏最新订单表格
    (状态列用彩色胶囊徽章:已支付/待支付/已退款)
  - 浅灰蓝底、白色圆角卡片、细分割线的清爽风格,中文数据随便编
  - 纯 HTML + CSS,不用任何图表库
model: GLM-5.3-Flash
harness: ZCode
turns: 1
html: metrics-dashboard.html
image: '~/assets/images/shots/metrics-dashboard.png'
imageAlt: 运营看板截图
tags: [dashboard, admin]
featured: true
---

柱状图高度直接写在每个柱子的内联 `style` 里,`scaleY` 动画从 0 生长,无 JS 参与。

- 生成后未做任何人工修改,原样收录
- 数据为演示用虚构数据;看板在窄屏下会自动隐藏侧边栏、面板改单列
