/**
 * Claude Token 管理器 Web 界面的 HTML 模板
 */

import { UI_TEXT } from './config.js';

// Web 界面的 CSS 样式
export const CSS_STYLES = `
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
  .card { background: #f9f9f9; border-radius: 8px; padding: 30px; margin: 20px 0; }
  .button { background: #007cba; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
  .button:hover { background: #005a87; }
  .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
  .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
  .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
  .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
  .code { background: #f4f4f4; padding: 10px; border-radius: 4px; font-family: monospace; }
`;

// Web 界面的 JavaScript 代码
export const CLIENT_JAVASCRIPT = `
  let currentPkce = null;
  
  async function generateAuthUrl() {
      try {
          const response = await fetch('/generate-auth-url');
          const data = await response.json();
          
          if (!data.success) {
              throw new Error(data.message);
          }
          
          currentPkce = data.data.pkce;
          
          document.getElementById('auth-url-result').innerHTML = \`
              <div class="status success">
                  <strong>✅ 授权链接已生成</strong><br>
                  <a href="\${data.data.authUrl}" target="_blank" style="color: #007cba; text-decoration: underline;">
                      点击这里在新窗口中授权
                  </a><br>
                  <small>授权完成后，请从地址栏复制 code 参数的值</small>
              </div>
          \`;
      } catch (error) {
          document.getElementById('auth-url-result').innerHTML = \`
              <div class="status error">
                  <strong>❌ 生成失败:</strong> \${error.message}
              </div>
          \`;
      }
  }
  
  async function submitAuthCode() {
      let authCode = document.getElementById('auth-code').value.trim();
      if (!authCode) {
          alert('请输入授权码');
          return;
      }
      
      // 清理授权码：移除 # 后面的部分和其他参数
      authCode = authCode.split('#')[0].split('&')[0].split('?')[0];
      
      if (!currentPkce) {
          alert('请先生成授权链接');
          return;
      }
      
      try {
          const response = await fetch('/exchange-token', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  code: authCode,
                  pkce: currentPkce
              })
          });
          
          const data = await response.json();
          
          if (!data.success) {
              throw new Error(data.message);
          }
          
          document.getElementById('submit-result').innerHTML = \`
              <div class="status success">
                  <strong>🎉 Token 获取成功!</strong><br>
                  现在可以使用 Claude Code 了！
              </div>
          \`;
          
          // 清空输入框
          document.getElementById('auth-code').value = '';
          currentPkce = null;
          
          // 自动刷新状态
          setTimeout(checkStatus, 1000);
          
      } catch (error) {
          document.getElementById('submit-result').innerHTML = \`
              <div class="status error">
                  <strong>❌ 提交失败:</strong> \${error.message}
              </div>
          \`;
      }
  }
  
  async function checkStatus() {
      try {
          const response = await fetch('/token-status');
          const data = await response.json();
          const statusDiv = document.getElementById('status-result');
          
          if (data.data && data.data.hasToken) {
              statusDiv.innerHTML = \`
                  <div class="status success">
                      <strong>✅ Token 状态: 正常</strong><br>
                      过期时间: \${new Date(data.data.expiresAt).toLocaleString()}<br>
                      获取时间: \${new Date(data.data.obtainedAt).toLocaleString()}
                  </div>
              \`;
          } else {
              statusDiv.innerHTML = \`
                  <div class="status warning">
                      <strong>⚠️ 未找到有效 Token</strong><br>
                      请点击上方按钮获取新的 Token
                  </div>
              \`;
          }
      } catch (error) {
          document.getElementById('status-result').innerHTML = \`
              <div class="status error">
                  <strong>❌ 检查失败:</strong> \${error.message}
              </div>
          \`;
      }
  }
  
  // 页面加载时自动检查状态
  window.onload = checkStatus;
`;

// 生成完整的 HTML 模板
export function getTokenPageHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${UI_TEXT.PAGE_TITLE}</title>
    <style>
        ${CSS_STYLES}
    </style>
</head>
<body>
    <h1>🚀 ${UI_TEXT.PAGE_TITLE}</h1>
    
    <div class="card">
        <h2>📋 ${UI_TEXT.GET_NEW_TOKEN}</h2>
        <p>由于 Claude OAuth 限制，需要手动完成授权流程：</p>
        <ol>
            <li>点击下面的按钮获取授权链接</li>
            <li>在新窗口中完成 Claude 授权</li>
            <li>复制授权码并粘贴到下面的输入框</li>
            <li>点击提交完成设置</li>
        </ol>
        <button class="button" onclick="generateAuthUrl()">${UI_TEXT.GENERATE_AUTH_LINK}</button>
        <div id="auth-url-result" style="margin-top: 15px;"></div>
        
        <div style="margin-top: 20px;">
            <label for="auth-code" style="display: block; margin-bottom: 5px; font-weight: bold;">授权码 (Authorization Code):</label>
            <input type="text" id="auth-code" placeholder="${UI_TEXT.AUTH_CODE_PLACEHOLDER}" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
            <small style="color: #666;">${UI_TEXT.AUTH_CODE_HINT}</small><br>
            <button class="button" onclick="submitAuthCode()" style="margin-top: 10px;">${UI_TEXT.SUBMIT_AUTH_CODE}</button>
        </div>
        <div id="submit-result"></div>
    </div>
    
    <div class="card">
        <h2>📊 ${UI_TEXT.TOKEN_STATUS}</h2>
        <button class="button" onclick="checkStatus()">${UI_TEXT.CHECK_STATUS}</button>
        <div id="status-result"></div>
    </div>
    
    <div class="card">
        <h2>🔗 ${UI_TEXT.API_USAGE}</h2>
        <p><strong>API 端点:</strong></p>
        <div class="code">POST \${window.location.origin}/v1/messages</div>
        <p><strong>使用方法:</strong></p>
        <ul>
            <li>设置 Claude Code 的 ANTHROPIC_BASE_URL 为: <code>\${window.location.origin}/</code></li>
            <li>设置 ANTHROPIC_AUTH_TOKEN 为你的 Claude OAuth Token</li>
        </ul>
    </div>

    <script>
        ${CLIENT_JAVASCRIPT}
    </script>
</body>
</html>`;
}