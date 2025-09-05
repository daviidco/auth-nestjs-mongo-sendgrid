export const passwordResetTemplate = {
  subject: 'Reset your password',

  html: (data: { name: string; resetUrl: string; expiryHours: number }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.name}!</h2>
          <p>We received a request to reset your password for your Auth Microservice account.</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account is still secure.
          </div>
          
          <p>To reset your password, click the button below:</p>
          
          <a href="${data.resetUrl}" class="button">Reset Password</a>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${data.resetUrl}">${data.resetUrl}</a></p>
          
          <p><strong>Important:</strong> This password reset link will expire in ${data.expiryHours} hour(s) for security reasons.</p>
          
          <p>After clicking the link, you'll be able to create a new password for your account.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>If you're having trouble, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  text: (data: { name: string; resetUrl: string; expiryHours: number }) => `
    Hello ${data.name}!

    We received a request to reset your password for your Auth Microservice account.

    SECURITY NOTICE: If you didn't request this password reset, please ignore this email. Your account is still secure.

    To reset your password, visit the following link:

    ${data.resetUrl}

    This password reset link will expire in ${data.expiryHours} hour(s) for security reasons.

    After clicking the link, you'll be able to create a new password for your account.

    This is an automated message, please do not reply to this email.
    If you're having trouble, please contact our support team.
  `,
};
