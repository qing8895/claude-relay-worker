/**
 * Claude Token 管理器的 API 代理处理
 */

import { API_CONFIG, ERROR_CODES } from './config.js';
import { createErrorResponse, isTokenExpired, logError } from './utils.js';

/**
 * 处理 Claude API 代理请求
 * @param {Request} request - HTTP 请求
 * @param {Object} env - 环境变量
 * @returns {Promise<Response>} 来自 Claude API 的代理响应
 */
export async function handleMessages(request, env) {
  const url = new URL(request.url);

  // 验证请求方法和路径
  if (request.method !== 'POST' || url.pathname !== '/v1/messages') {
    return createErrorResponse(ERROR_CODES.API_ONLY_POST_MESSAGES, null, 404, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
  }

  try {
    // 从 KV 获取存储的令牌
    const tokenData = await env.CLAUDE_KV.get('claude_token');
    if (!tokenData) {
      return createErrorResponse(ERROR_CODES.AUTH_NO_TOKEN_CONFIGURED, '请访问 /get-token 设置身份验证', 401, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
    }

    const token = JSON.parse(tokenData);

    // 检查令牌是否过期
    if (isTokenExpired(token)) {
      return createErrorResponse(ERROR_CODES.AUTH_TOKEN_EXPIRED, '请访问 /get-token 刷新您的令牌', 401, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
    }

    // 获取请求体
    const requestBody = await request.json();

    // 转发请求到 Claude API
    const claudeResponse = await fetch(API_CONFIG.CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
        'anthropic-version': API_CONFIG.ANTHROPIC_VERSION,
        'anthropic-beta': API_CONFIG.ANTHROPIC_BETA
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await claudeResponse.text();

    return new Response(responseText, {
      status: claudeResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

  } catch (error) {
    logError('API代理错误', error);
    return createErrorResponse(ERROR_CODES.API_PROXY_ERROR, `API代理请求失败: ${error.message}`, 502, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
  }
}
