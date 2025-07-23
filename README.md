# Claude Relay Worker

一个 Cloudflare Workers 代理服务，让你可以通过 Claude Code 使用 Claude API，而无需直接管理 API 密钥。

## 🎯 这是什么？

Claude Relay Worker 解决了一个简单的问题：让你能够安全、便捷地使用 Claude API。

**它提供：**
- 🔐 OAuth 身份验证（无需手动管理 API 密钥）
- 🌐 API 代理转发（自动处理认证）
- 📱 简洁的 Web 管理界面
- ⚡ 全球边缘部署（低延迟）

## 🚀 如何使用

### 1. 部署服务

```bash
git clone https://github.com/your-username/claude-relay-worker.git
cd claude-relay-worker

# 配置 wrangler
cp wrangler.toml.example wrangler.toml
# 编辑 wrangler.toml，填入你的实际配置

npx wrangler deploy
```

### 2. 设置令牌

1. 访问你的 Worker URL（如：`https://your-worker.workers.dev/`）
2. 点击"生成授权链接" → 完成 Claude 授权
3. 复制授权码并提交

### 3. 配置 Claude Code

```bash
export ANTHROPIC_BASE_URL="https://your-worker.workers.dev/"
export ANTHROPIC_AUTH_TOKEN="placeholder"
```

### 4. 使用 Claude Code
```bash
claude
```

就是这样！现在你可以正常使用 Claude Code 了。

## ❓ 为什么需要这个？

- **安全性**：令牌存储在云端，不暴露在本地
- **便捷性**：一次设置，多设备使用
- **稳定性**：自动处理令牌刷新和错误重试

## 🔧 配置说明

编辑 `wrangler.toml` 文件，替换以下配置：

```toml
# 替换为你的 Cloudflare 账户 ID
account_id = "your-cloudflare-account-id"

[[kv_namespaces]]
binding = "CLAUDE_KV"
# 替换为你的 KV 命名空间 ID
id = "your-kv-namespace-id"
```

**获取方式：**
1. **account_id**：Cloudflare Dashboard 右侧边栏
2. **KV namespace ID**：Workers & Pages → KV → 创建命名空间后获取

## 📝 许可证

MIT License

---

⭐ 如果对你有帮助，请给个星标！
