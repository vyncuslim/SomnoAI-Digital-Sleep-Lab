import { fetchWithLogging } from './apiService';

const API_URL = '/api';

export const emailService = {
  sendAdminAlert: async (payload: any) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'admin@sleepsomno.com',
          subject: '管理员警报：系统事件通知',
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <p>尊敬的管理员，</p>
              <p>您好。</p>
              <p>系统刚刚检测到一项新的管理事件，需要您尽快查看。</p>
              <h3>事件摘要：</h3>
              <ul>
                <li><strong>事件类型：</strong> ${payload.type || 'N/A'}</li>
                <li><strong>时间：</strong> ${new Date().toLocaleString()}</li>
                <li><strong>用户/来源：</strong> ${payload.source || 'System'}</li>
                <li><strong>风险等级：</strong> ${payload.riskLevel || 'Medium'}</li>
                <li><strong>详情：</strong> ${JSON.stringify(payload.details || {})}</li>
              </ul>
              <p>请尽快登录管理后台进行核查，并根据需要采取进一步措施。</p>
              <p><strong>管理后台链接：</strong><br><a href="${window.location.origin}/admin">${window.location.origin}/admin</a></p>
              <p>如这不是预期行为，建议您立即：</p>
              <ul>
                <li>检查相关账户活动</li>
                <li>更新管理员密码</li>
                <li>审查系统日志</li>
                <li>启用或检查多重验证设置</li>
              </ul>
              <p>此邮件由系统自动发送，请勿直接回复。</p>
              <p>Best regards,<br>SomnoAI Digital Sleep Lab<br>Website: https://sleepsomno.com<br>Support: support@sleepsomno.com<br>Security: security@sleepsomno.com</p>
            </div>
          `,
        }),
      }, 'sendAdminAlert', 'CRITICAL');
    } catch (error) {
      console.warn('Failed to send admin alert:', error);
    }
  },
  sendSignupWelcome: async (email: string) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: '欢迎加入 SomnoAI Digital Sleep Lab',
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <p>您好：</p>
              <p>欢迎注册 SomnoAI Digital Sleep Lab。</p>
              <p>您的账户已成功创建，现在可以开始使用我们的服务。</p>
              <h3>账户信息：</h3>
              <ul>
                <li><strong>注册邮箱：</strong> ${email}</li>
                <li><strong>注册时间：</strong> ${new Date().toLocaleString()}</li>
              </ul>
              <p>您可以通过以下链接登录您的账户：<br><a href="${window.location.origin}/auth/login">${window.location.origin}/auth/login</a></p>
              <p>为了帮助您更顺利开始使用，建议您优先完成以下操作：</p>
              <ul>
                <li>完善个人资料</li>
                <li>设置安全密码</li>
                <li>查看平台功能介绍</li>
                <li>开启账户安全保护</li>
              </ul>
              <p>如果这次注册并非由您本人操作，请立即联系我们：support@sleepsomno.com</p>
              <p>感谢您的加入，期待为您提供服务。</p>
              <p>Best regards,<br>SomnoAI Digital Sleep Lab<br>Website: https://sleepsomno.com<br>Support: support@sleepsomno.com<br>Security: security@sleepsomno.com</p>
            </div>
          `,
        }),
      }, 'sendSignupWelcome', 'INFO');
    } catch (error) {
      console.warn('Failed to send welcome email:', error);
    }
  },
  sendPasswordReset: async (email: string) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: '重置您的账户密码',
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <p>您好：</p>
              <p>我们收到了一个重置您账户密码的请求。</p>
              <p>您可以点击以下链接重置密码：<br><a href="${window.location.origin}/auth/reset-password">重置密码</a></p>
              <h3>注意事项：</h3>
              <ul>
                <li>该链接将在 1 小时后失效</li>
                <li>如果您没有请求重置密码，请忽略此邮件</li>
                <li>为了账户安全，请勿将此链接分享给他人</li>
              </ul>
              <p>如果您未发起此请求，但担心账户安全，请尽快联系我们：support@sleepsomno.com</p>
              <p>此邮件由系统自动发送，请勿直接回复。</p>
              <p>Best regards,<br>SomnoAI Digital Sleep Lab<br>Website: https://sleepsomno.com<br>Support: support@sleepsomno.com<br>Security: security@sleepsomno.com</p>
            </div>
          `,
        }),
      }, 'sendPasswordReset', 'WARNING');
    } catch (error) {
      console.warn('Failed to send password reset email:', error);
    }
  },
  sendSecurityAlert: async (email: string, event: string, details: string) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: '安全警报：检测到异常活动',
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <p>您好：</p>
              <p>我们检测到您的账户出现了一次异常或敏感操作，因此向您发送此安全提醒。</p>
              <h3>活动详情：</h3>
              <ul>
                <li><strong>操作类型：</strong> ${event}</li>
                <li><strong>时间：</strong> ${new Date().toLocaleString()}</li>
                <li><strong>详情：</strong> ${details}</li>
              </ul>
              <p>如果这是您本人操作，则无需进一步处理。</p>
              <p>如果这不是您本人执行的操作，请立即采取以下措施：</p>
              <ul>
                <li>立即重置密码</li>
                <li>检查近期登录记录</li>
                <li>联系我们的支持团队</li>
                <li>启用额外安全验证措施</li>
              </ul>
              <p>安全处理链接：<br><a href="${window.location.origin}/settings/security">${window.location.origin}/settings/security</a></p>
              <p>支持邮箱：support@sleepsomno.com</p>
              <p>我们非常重视账户安全。如发现异常，请尽快处理。</p>
              <p>Best regards,<br>SomnoAI Digital Sleep Lab<br>Website: https://sleepsomno.com<br>Support: support@sleepsomno.com<br>Security: security@sleepsomno.com</p>
            </div>
          `,
        }),
      }, 'sendSecurityAlert', 'CRITICAL');
    } catch (error) {
      console.warn('Failed to send security alert:', error);
    }
  },
  sendBlockNotification: async (email: string, reason: string, blockCode: string) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Account Blocked',
          html: `
            <h1>Account Blocked</h1>
            <p>Your account has been blocked due to: ${reason}</p>
            <p>Your block code is: <strong>${blockCode}</strong></p>
            <p>Please email admin@sleepsomno.com with this code to resolve the issue.</p>
          `,
        }),
      }, 'sendBlockNotification', 'CRITICAL');
      console.log('Block notification sent to:', email);
    } catch (error) {
      console.warn('Failed to send block notification:', error);
    }
  }
};

export const sendEmailAlert = emailService.sendAdminAlert;
