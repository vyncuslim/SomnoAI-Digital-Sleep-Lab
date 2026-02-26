# Supabase 配置指南

## 问题诊断

### "Failed to fetch" 错误原因

当用户看到 "Failed to fetch" 错误时，通常是以下原因：

1. **环境变量未配置** - Supabase URL 或 Anon Key 缺失
2. **Google OAuth 未启用** - Supabase 中未配置 Google 提供商
3. **重定向 URI 不匹配** - Google OAuth 回调地址配置错误
4. **网络连接问题** - 无法连接到 Supabase 服务器

## 必需的环境变量

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 获取这些值

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 点击 **Settings > API**
4. 复制：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

## Vercel 部署配置

### 步骤 1: 添加环境变量

1. 访问 Vercel 项目
2. 点击 **Settings > Environment Variables**
3. 添加以下变量：

| 名称 | 值 | 环境 |
|------|-----|------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `your_anon_key` | Production, Preview, Development |

### 步骤 2: 重新部署

```bash
# 推送代码后，Vercel 会自动重新部署
git push origin main
```

## Supabase Google OAuth 配置

### 在 Supabase 中启用 Google

1. **Supabase Dashboard**
   - 进入 **Authentication > Providers**
   - 找到 **Google**
   - 点击启用

2. **配置 Google OAuth 凭证**
   - Client ID
   - Client Secret

### 在 Google Cloud Console 中配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 创建或选择项目
3. 启用 **Google+ API**
4. 创建 **OAuth 2.0 客户端 ID**（Web 应用类型）
5. 添加授权重定向 URI：

```
https://your-project-ref.supabase.co/auth/v1/callback?provider=google
```

对于本地开发：
```
http://localhost:3000/auth/v1/callback?provider=google
```

## 本地开发设置

### 创建 `.env.local` 文件

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 运行开发服务器

```bash
npm install
npm run dev
```

## 数据库架构

### 必需的表和函数

项目使用以下 Supabase 功能：

1. **profiles** - 用户资料表
2. **audit_logs** - 审计日志表
3. **login_attempts** - 登录尝试记录
4. **notification_recipients** - 通知接收者

### 初始化数据库

运行 `setup.sql` 中的 SQL 脚本：

```bash
# 在 Supabase SQL Editor 中运行
# 复制 setup.sql 的内容并执行
```

## 故障排除

### 检查清单

- [ ] 环境变量在 Vercel 中正确设置
- [ ] Supabase URL 格式正确（`https://xxx.supabase.co`）
- [ ] Anon Key 长度合理（通常 > 100 字符）
- [ ] Google OAuth 在 Supabase 中已启用
- [ ] Google OAuth 凭证正确配置
- [ ] 重定向 URI 完全匹配
- [ ] Supabase 项目未暂停
- [ ] 网络连接正常

### 调试步骤

1. **打开浏览器开发工具**
   - F12 或 Cmd+Option+I
   - 切换到 **Console** 标签

2. **尝试 Google 登录**
   - 查看错误消息
   - 记录完整的错误信息

3. **检查网络请求**
   - 切换到 **Network** 标签
   - 查找失败的请求到 `supabase.co`
   - 检查响应状态和错误

4. **查看 Supabase 日志**
   - Supabase Dashboard > Logs
   - 过滤 `auth` 服务
   - 查找 OAuth 相关错误

### 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|--------|
| `Failed to fetch` | 无法连接到 Supabase | 检查 URL 和网络连接 |
| `Invalid client` | Google OAuth 凭证错误 | 验证 Client ID 和 Secret |
| `Redirect URI mismatch` | 回调地址不匹配 | 检查 Google Cloud 配置 |
| `CORS error` | 跨域请求被阻止 | 检查 Supabase CORS 设置 |
| `401 Unauthorized` | Anon Key 无效 | 重新生成或复制正确的 Key |

## 验证配置

### 使用验证脚本

```bash
# 运行配置验证脚本
npx ts-node scripts/verify-supabase-config.ts
```

### 手动验证

1. **测试连接**
   ```bash
   curl https://your-project-ref.supabase.co/auth/v1/settings
   ```

2. **检查 API 可用性**
   - 访问 `https://your-project-ref.supabase.co/rest/v1/`
   - 应该返回 API 文档

## 生产部署检查清单

- [ ] 所有环境变量在 Vercel 中设置
- [ ] Supabase 项目已备份
- [ ] Google OAuth 在生产域名中配置
- [ ] SSL 证书有效
- [ ] 数据库备份已启用
- [ ] 监控和日志已配置
- [ ] 错误处理已实现
- [ ] 性能测试已完成

## 更多资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Google OAuth 设置指南](https://supabase.com/docs/guides/auth/social-auth/auth-google)
- [Vercel 环境变量文档](https://vercel.com/docs/projects/environment-variables)
- [项目 README](./README.md)
