
/**
 * SOMNOAI EMAIL BRIDGE
 * 前端请求后端的 SMTP 发送服务
 */

export const emailService = {
  /**
   * 格式化 AI 分析结果为实验室风格的 HTML
   */
  formatAnalysisHtml: (content: string, email: string) => {
    return `
      <div style="font-family: sans-serif; background-color: #020617; color: #f1f5f9; padding: 40px; border-radius: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #818cf8; font-style: italic; margin-bottom: 5px;">SomnoAI Neural Report</h1>
          <p style="font-size: 10px; color: #475569; letter-spacing: 2px;">SECURE TELEMETRY DISPATCH</p>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; line-height: 1.6;">
          <p style="color: #94a3b8; font-size: 12px;">SUBJECT: ${email}</p>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.05); margin: 20px 0;">
          <div style="font-size: 14px; color: #e2e8f0; white-space: pre-wrap; font-style: italic;">
            ${content}
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #475569;">
          © 2026 SomnoAI Digital Sleep Lab • Neural Infrastructure
        </div>
      </div>
    `;
  },

  /**
   * 发送系统邮件
   * @param to 接收者
   * @param subject 主题
   * @param html HTML内容
   */
  sendSystemEmail: async (to: string, subject: string, html: string) => {
    const secret = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2"; 

    try {
      const response = await fetch('/api/send-system-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html, secret }),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (e) {
      console.error("Email bridge severed.", e);
      return { success: false, error: "NETWORK_EXCEPTION" };
    }
  }
};
