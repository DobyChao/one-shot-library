# One-Shot Library

一个 Prompt,一个页面。收藏 AI one-shot 生成的前端产物(落地页 / 仪表盘 / 小工具),每件作品都附**原始 prompt、模型与在线预览**。

基于 [AstroWind](https://github.com/onwidget/astrowind)(Astro 7 + Tailwind CSS v4)构建,产物以单文件 HTML 静态分发,详情页内嵌 iframe 实时预览。

## 常用命令

```bash
npm run dev          # 本地开发 http://localhost:4321
npm run build        # 构建到 dist/
npm run preview      # 预览构建产物
npm run screenshots  # 批量生成作品封面(Playwright,video: true 的录循环视频)
npm run audit        # 批量跑 Lighthouse,分数进详情页(首次需 npx playwright install chromium)
npm run new          # 脚手架:新建条目骨架并格式化
```

## 如何添加一件作品

最快路径:`npm run new -- <slug> "作品标题"`,然后按提示填 TODO。完整流程:

1. **放产物**:`public/artifacts/` 下——单文件直接放(`my-landing.html`),多文件/带本地 JS 的整目录放(`th-game/index.html`,`html` 字段写相对路径);产物走 `/artifacts/` 路径,与 `/shots/` 详情路由隔离;
2. **写条目**:在 `src/data/shot/` 新建同名 `my-landing.md`,frontmatter 字段见下方;
3. **截图**:`npm run screenshots`(首次需 `npx playwright install chromium`);
4. **格式化**:`npx prettier --write src/data/shot/<slug>.md`——CI 会跑 `prettier --check`,漏了会红;
5. **验收**:`npm run dev` 打开画廊确认。

```yaml
---
title: 作品标题
excerpt: 一句话介绍
prompt: |
  生成它的那条完整 prompt(原样粘贴)
harness: ZCode # 驱动生成的 agent harness(ZCode / Claude Code / Cursor / v0 …)
model: GLM-5.3-Flash # 使用的模型
turns: 1 # 实际对话轮数,1 = 真 one-shot
html: my-landing.html # public/artifacts/ 下的文件名
image: '~/assets/images/shots/my-landing.png'
tags: [landing-page, saas]
featured: false # 首页精选
---
```

可选字段:`externalUrl`(外部链接代替本地 HTML)、`imageAlt`、`updateDate`、`draft: true`(隐藏)、
`video: true` + `videoKey`(录循环视频封面,录制时按该键或点击画面启动产物)、
`series`(同题对照系列的组名;prompt 相同或只是相近都可以,详情页与对照页互链)。
`harness` / `model` / `turns` 会成为卡片徽章并参与画廊筛选(也可按 harness、模型或 series 分组),请用规范写法(见 `src/data/taxonomy.ts` 或站内关于页);
`series` 相同的作品进入 `/shots/series/<name>` 并排对照;prompt 不同会各自保留原文;
`turns`、日期、产物形式出现在详情页「生成信息」面板;`npm run audit` 的 Lighthouse 分数有则自动展示;
markdown 正文可选,显示在详情页「备注」区。

## 目录速览

| 路径                       | 作用                                            |
| -------------------------- | ----------------------------------------------- |
| `src/data/shot/`           | 作品条目(markdown)                              |
| `public/artifacts/`        | 产物 HTML(单文件或子目录,`/artifacts/` 路径)    |
| `src/assets/images/shots/` | 作品截图(由脚本生成)                            |
| `src/components/shots/`    | ShotCard / PromptBox / PreviewFrame / MetaChips |
| `src/pages/shots/`         | 画廊列表页 + 详情页                             |
| `src/config.yaml`          | 站点名 / SEO / 主题                             |

## 部署

纯静态站点(`astro.config.ts` 为 `output: 'static'`,`npm run build` 产出 `dist/`,无任何服务端代码),任何能挂静态文件的地方都能部署。

**部署前必改**(`src/config.yaml`):

| 字段        | 改成                                               | 说明                                                                                                                                                       |
| ----------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site.site` | `https://<user>.github.io`(纯 origin,不含仓库路径) | canonical / sitemap / 结构化数据用;注意 AstroWind 会把它设为 Astro 原生 `site`                                                                             |
| `site.base` | `/` 或 `/<repo>`                                   | **GitHub Pages 项目页必须设为 `/<repo>`(不带尾斜杠)**,否则所有资源 404;带尾斜杠会让首页被 Astro 的尾斜杠重定向页覆盖(死循环)。自定义域名或用户主站保持 `/` |

- **GitHub Pages**:设置上面两项后,把 `dist/` 发布到 gh-pages 分支,或加一个 `actions/upload-pages-artifact` + `actions/deploy-pages` 的 workflow(可参考 `.github/workflows/actions.yaml` 的构建步骤改)。访问 `/shots` 这类无斜杠路径时 GH Pages 会 301 到 `/shots/`,属正常行为。
- **Vercel / Cloudflare Pages / Netlify**:连上仓库零配置即可,`site.base` 保持 `/`,只改 `site.site`。

**站点身份已经定好**:名称、简介、页脚、favicon 与 Logo 都是 One-Shot Library,不再使用模板火箭图。部署时仍必须改上面的 `site.site` 与 `site.base`;`base` 不要加尾斜杠,否则首页会被 Astro 的尾斜杠重定向页盖住。
