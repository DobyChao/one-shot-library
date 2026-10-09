## 新作品提交清单

- [ ] 产物放在 `public/artifacts/`(单文件 `<slug>.html` 或独立子目录 `<slug>/index.html`)
- [ ] 新增条目 `src/data/shot/<slug>.md`(可用 `npm run new -- <slug> "标题"` 生成骨架),frontmatter 含 `title` / `prompt`(第一条原文)/ `mode`(`one-shot` 或 `vibe`)/ `turns` / `html` / `tags`;改过几轮的补上有序 `session`
- [ ] 写了 `harness` / `model` 时使用规范写法(见关于页或 `src/data/taxonomy.ts`);不知道可以留空
- [ ] 已跑 `npx prettier --write src/data/shot/<slug>.md`(CI 有 prettier --check)
- [ ] 本地 `npm run dev` 自测过画廊列表与详情页
- [ ] (可选)已跑 `npm run screenshots` 生成封面;没有的话维护者会代补
- [ ] 产物为本人所有或已获授权收录;prompt 与 session 是真实对话,或已在备注里标明是样例

> 合并后站点自动重新部署。详情页以沙箱 iframe 嵌入产物(禁站内跳转 / 表单 / 弹窗),请确认产物在新窗口打开时也能独立运行。
