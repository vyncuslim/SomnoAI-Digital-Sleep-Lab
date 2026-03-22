import { fetchWithLogging } from './apiService';

const API_URL = '/api';

export const emailService = {
  sendLoginCode: async (email: string, code: string) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Your Login Code',
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <p>Hello,</p>
              <p>Use this code to login:</p>
              <h2 style="color: #4f46e5;">${code}</h2>
              <p>Best regards,<br>SomnoAI Digital Sleep Lab<br>Website: https://sleepsomno.com<br>Support: support@sleepsomno.com<br>Security: security@sleepsomno.com<br><br><small>SDSL-CS-001</small></p>
            </div>
          `,
        }),
      }, 'sendLoginCode', 'INFO');
    } catch (error) {
      console.warn('Failed to send login code:', error);
    }
  },
  sendAdminAlert: async (payload: any) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'admin@sleepsomno.com',
          subject: 'Admin Alert: System Event Notification',
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <p>Hello Admin,</p>
              <p>A new administrative event has been detected by the system and requires your attention.</p>
              <h3>Event Summary</h3>
              <ul>
                <li><strong>Event Type:</strong> ${payload.type || 'N/A'}</li>
                <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Source/User:</strong> ${payload.source || 'System'}</li>
                <li><strong>Risk Level:</strong> ${payload.riskLevel || 'Medium'}</li>
                <li><strong>Details:</strong> ${JSON.stringify(payload.details || {})}</li>
              </ul>
              <p>Please log in to the admin dashboard as soon as possible to review this event and take any necessary action.</p>
              <p><strong>Admin Dashboard:</strong><br><a href="${window.location.origin}/admin">${window.location.origin}/admin</a></p>
              <p>If this activity was not expected, we recommend that you immediately:</p>
              <ul>
                <li>Review related account activity</li>
                <li>Update administrator credentials</li>
                <li>Check system logs</li>
                <li>Verify multi-factor authentication settings</li>
              </ul>
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>Best regards,<br>SomnoAI Digital Sleep Lab<br>Website: https://sleepsomno.com<br>Support: support@sleepsomno.com<br>Security: security@sleepsomno.com<br><br><small>SDSL-CS-001</small></p>
            </div>
          `,
        }),
      }, 'sendAdminAlert', 'CRITICAL');
    } catch (error) {
      console.warn('Failed to send admin alert:', error);
    }
  },
  sendSignupWelcome: async (email: string, userName: string, loginUrl: string, signupTime: string) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Welcome to SomnoAI Digital Sleep Lab',
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <p>Hello ${userName},</p>
              <p>Welcome to SomnoAI Digital Sleep Lab.</p>
              <p>Your account has been successfully created, and you can now start using our services.</p>
              <h3>Account Details</h3>
              <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Signup Time:</strong> ${signupTime}</li>
              </ul>
              <p>You can log in to your account here:<br><a href="${loginUrl}">${loginUrl}</a></p>
              <p>To get started smoothly, we recommend that you:</p>
              <ul>
                <li>Complete your profile</li>
                <li>Set a strong password</li>
                <li>Explore the platform features</li>
                <li>Enable account security protection</li>
              </ul>
              <p>If this account was not created by you, please contact us immediately at: support@sleepsomno.com</p>
              <p>Thank you for joining us. We look forward to supporting you.</p>
              <p>Best regards,<br>SomnoAI Digital Sleep Lab<br>Website: https://sleepsomno.com<br>Support: support@sleepsomno.com<br>Security: security@sleepsomno.com<br><br><small>SDSL-CS-001</small></p>
            </div>
          `,
        }),
      }, 'sendSignupWelcome', 'INFO');
    } catch (error) {
      console.warn('Failed to send welcome email:', error);
    }
  },
  sendPasswordReset: async (email: string, userName: string, resetLink: string, expiryTime: string) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Reset Your Account Password',
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <p>Hello ${userName},</p>
              <p>We received a request to reset the password for your account.</p>
              <p>You can reset your password by clicking the link below:<br><a href="${resetLink}">Reset Password</a></p>
              <h3>Important Notes</h3>
              <ul>
                <li>This link will expire in ${expiryTime}</li>
                <li>If you did not request a password reset, please ignore this email</li>
                <li>For security reasons, do not share this link with anyone</li>
              </ul>
              <p>If you did not make this request and believe your account may be at risk, please contact us immediately at: support@sleepsomno.com</p>
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>Best regards,<br>SomnoAI Digital Sleep Lab<br>Website: https://sleepsomno.com<br>Support: support@sleepsomno.com<br>Security: security@sleepsomno.com<br><br><small>SDSL-CS-001</small></p>
            </div>
          `,
        }),
      }, 'sendPasswordReset', 'WARNING');
    } catch (error) {
      console.warn('Failed to send password reset email:', error);
    }
  },
  sendSecurityAlert: async (email: string, userName: string, activityType: string, activityTime: string, ipAddress: string, deviceInfo: string, location: string, securityPageUrl: string) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Security Alert: Unusual Activity Detected',
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <p>Hello ${userName},</p>
              <p>We detected unusual or sensitive activity on your account, so we are sending you this security alert.</p>
              <h3>Activity Details</h3>
              <ul>
                <li><strong>Activity Type:</strong> ${activityType}</li>
                <li><strong>Time:</strong> ${activityTime}</li>
                <li><strong>IP Address:</strong> ${ipAddress}</li>
                <li><strong>Device/Browser:</strong> ${deviceInfo}</li>
                <li><strong>Location:</strong> ${location}</li>
              </ul>
              <p>If this was you, no further action is required.</p>
              <p>If this was not you, please take action immediately:</p>
              <ul>
                <li>Reset your password</li>
                <li>Review your recent login activity</li>
                <li>Contact our support team</li>
                <li>Enable additional security protections</li>
              </ul>
              <p>Security Page:<br><a href="${securityPageUrl}">${securityPageUrl}</a></p>
              <p>Support Email: support@sleepsomno.com</p>
              <p>We take account security seriously. Please act promptly if you do not recognize this activity.</p>
              <p>Best regards,<br>SomnoAI Digital Sleep Lab<br>Website: https://sleepsomno.com<br>Support: support@sleepsomno.com<br>Security: security@sleepsomno.com<br><br><small>SDSL-CS-001</small></p>
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
