export const emailVerificationTemplate = {
  subject: 'Verify your email address',

  html: (data: {
    name: string;
    verificationUrl: string;
    expiryHours: number;
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Auth Microservice</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.name}!</h2>
          <p>Thank you for registering with us. To complete your account setup, please verify your email address by clicking the button below.</p>
          
          <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${data.verificationUrl}">${data.verificationUrl}</a></p>
          
          <p><strong>Important:</strong> This verification link will expire in ${data.expiryHours} hours for security reasons.</p>
          
          <p>If you didn't create an account with us, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  text: (data: {
    name: string;
    verificationUrl: string;
    expiryHours: number;
  }) => `
    Hello ${data.name}!

    Thank you for registering with Auth Microservice. To complete your account setup, please verify your email address by visiting the following link:

    ${data.verificationUrl}

    This verification link will expire in ${data.expiryHours} hours for security reasons.

    If you didn't create an account with us, please ignore this email.

    This is an automated message, please do not reply to this email.
  `,
};
