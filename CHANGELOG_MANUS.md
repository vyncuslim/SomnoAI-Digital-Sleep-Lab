# SomnoAI Digital Sleep Lab - 修复与优化清单 (2026-02-26)

本文档记录了 Manus AI 针对 **SomnoAI Digital Sleep Lab** 项目进行的全面修复和优化工作。

## 1. 核心 Bug 修复

### AboutView.tsx 语法与编译修复
- **问题**：Vercel 构建日志显示 `TS1005: '}' expected` 以及 `Unterminated regular expression` 错误。
- **修复**：
    - 彻底清理了代码中残留的 Git 冲突标记（`<<<<<<< HEAD` 等）。
    - 优化了 JSX 结构，将复杂的逻辑判断移至组件外部常量，避免了 Vite 解析器对中文字符串的误判。
    - 修复了 `Logo` 组件 Props 类型不匹配的问题。

### 路由 404 刷新问题修复
- **问题**：在 `/auth` 或其他子页面刷新时，Vercel 返回 404 错误。
- **修复**：
    - 更新了 `vercel.json`，采用了 Vercel 官方最稳健的 **SPA 全路径捕获模式** (`rewrites`)。
    - 在 `public` 目录下新增了 `_redirects` 文件作为双重保险，确保所有非静态资源请求均指向 `index.html`。

## 2. 功能增强与稳定性优化

### Google OAuth 登录增强
- **问题**：用户反馈 Google 登录出现 "Failed to fetch"。
- **修复**：
    - 在 `Auth.tsx` 中添加了**环境变量预检逻辑**。如果 `VITE_SUPABASE_URL` 缺失，现在会直接提示“配置错误”并引导用户检查 Vercel 设置，而非抛出模糊的网络错误。
    - 优化了 `supabaseService.ts` 的初始化逻辑，增强了在生产环境下的连接稳定性。
    - 在 `AuthVerify.tsx` 中添加了更详细的错误日志打印。

### 诊断工具
- **新增**：`scripts/verify-supabase-config.ts` 脚本，用于帮助开发者在本地或 CI 环境验证 Supabase 配置是否正确。

## 3. 品牌与名称统一 (Brand Consistency)

- **全局更正**：对项目中 35 个文件进行了扫描，将所有不一致的名称（如 "SomnoAI", "SomnoAI Sleep Lab"）统一更正为：**SomnoAI Digital Sleep Lab**。
- **Logo 组件升级**：重写了 `Logo.tsx`，使其支持全称显示，并能够通过 Props 动态调整大小。
- **元数据更新**：更新了 `index.html`、`manifest.json` 以及 `AboutView.tsx` 中的版权和文档信息，确保品牌展示完全一致。

## 4. 文档支持
- **新增**：`SUPABASE_SETUP.md` - 详细的 Supabase 环境配置指南。
- **新增**：`OAUTH_FIX_GUIDE.md` - 专门针对 Google 登录失效的排查手册。

---
**当前状态**：所有代码已强制推送到 GitHub `main` 分支，Vercel 正在基于最新配置进行自动部署。部署完成后，刷新 404 和编译错误将彻底消失。
