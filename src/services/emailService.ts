import { Resend } from 'resend';
import { User } from './userService';
// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';

interface EmailLog {
  id: string;
  user_id: string;
  email_type: string;
  status: 'pending' | 'sent' | 'failed';
  retry_count: number;
  error?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

class EmailService {
  private resend: Resend;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  private async logEmailAttempt(data: Partial<EmailLog>) {
    try {
      const { error } = await supabase
        .from('email_logs')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging email attempt:', error);
    }
  }

  private async updateEmailLog(id: string, data: Partial<EmailLog>) {
    try {
      const { error } = await supabase
        .from('email_logs')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating email log:', error);
    }
  }

  private async sendWithRetry(
    options: {
      to: string;
      subject: string;
      html: string;
      user_id: string;
      email_type: string;
    },
    retryCount = 0
  ): Promise<boolean> {
    try {
      const logEntry = await this.logEmailAttempt({
        user_id: options.user_id,
        email_type: options.email_type,
        status: 'pending',
        retry_count: retryCount,
      });

      const { data, error } = await this.resend.emails.send({
        from: `HopeCare <${process.env.RESEND_FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) throw error;

      await this.updateEmailLog(logEntry.id, {
        status: 'sent',
        metadata: { message_id: data.id },
      });

      return true;
    } catch (error) {
      console.error(`Email sending failed (attempt ${retryCount + 1}):`, error);

      if (retryCount < this.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.sendWithRetry(options, retryCount + 1);
      }

      await this.updateEmailLog(logEntry.id, {
        status: 'failed',
        error: error.message,
      });

      return false;
    }
  }

  async sendVerificationEmail(user: User, token: string) {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media only screen and (max-width: 600px) {
              .button {
                width: 100% !important;
              }
            }
          </style>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Welcome to HopeCare!</h1>
            <p>Hello ${user.first_name || 'there'},</p>
            <p>Thank you for registering with HopeCare. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button" style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
              ">
                Verify Email Address
              </a>
            </div>
            <p>If you did not create an account, no further action is required.</p>
            <p>This verification link will expire in 24 hours.</p>
            <p>Best regards,<br>The HopeCare Team</p>
          </div>
        </body>
      </html>
    `;

    return this.sendWithRetry({
      to: user.email,
      subject: 'Verify Your Email Address - HopeCare',
      html,
      user_id: user.id,
      email_type: 'verification',
    });
  }

  async sendPasswordResetEmail(user: User, token: string) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media only screen and (max-width: 600px) {
              .button {
                width: 100% !important;
              }
            }
          </style>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
            <p>Hello ${user.first_name || 'there'},</p>
            <p>You are receiving this email because we received a password reset request for your account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button" style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
              ">
                Reset Password
              </a>
            </div>
            <p>If you did not request a password reset, no further action is required.</p>
            <p>This password reset link will expire in 24 hours.</p>
            <p>Best regards,<br>The HopeCare Team</p>
          </div>
        </body>
      </html>
    `;

    return this.sendWithRetry({
      to: user.email,
      subject: 'Reset Your Password - HopeCare',
      html,
      user_id: user.id,
      email_type: 'password_reset',
    });
  }

  async sendTwoFactorEnabledEmail(user: User) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Two-Factor Authentication Enabled</h1>
            <p>Hello ${user.first_name || 'there'},</p>
            <p>Two-factor authentication has been successfully enabled for your HopeCare account.</p>
            <p>From now on, you will need to enter a verification code from your authenticator app when signing in.</p>
            <div style="
              background-color: #fff3cd;
              color: #856404;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
            ">
              <strong>Security Notice:</strong> If you did not enable two-factor authentication,
              please contact our support team immediately.
            </div>
            <p>Best regards,<br>The HopeCare Team</p>
          </div>
        </body>
      </html>
    `;

    return this.sendWithRetry({
      to: user.email,
      subject: 'Two-Factor Authentication Enabled - HopeCare',
      html,
      user_id: user.id,
      email_type: 'two_factor_enabled',
    });
  }

  async sendLoginNotificationEmail(user: User, loginInfo: {
    time: string;
    ipAddress: string;
    userAgent: string;
    location?: string;
  }) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">New Login to Your Account</h1>
            <p>Hello ${user.first_name || 'there'},</p>
            <p>We detected a new login to your HopeCare account:</p>
            <div style="
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
            ">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 10px;">Time: ${loginInfo.time}</li>
                <li style="margin-bottom: 10px;">IP Address: ${loginInfo.ipAddress}</li>
                <li style="margin-bottom: 10px;">Device: ${loginInfo.userAgent}</li>
                ${loginInfo.location ? `<li>Location: ${loginInfo.location}</li>` : ''}
              </ul>
            </div>
            <p>If this was you, no further action is required.</p>
            <div style="
              background-color: #f8d7da;
              color: #721c24;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
            ">
              <strong>Security Alert:</strong> If you don't recognize this activity,
              please change your password immediately and contact our support team.
            </div>
            <p>Best regards,<br>The HopeCare Team</p>
          </div>
        </body>
      </html>
    `;

    return this.sendWithRetry({
      to: user.email,
      subject: 'New Login to Your Account - HopeCare',
      html,
      user_id: user.id,
      email_type: 'login_notification',
    });
  }

  async sendDonationReceiptEmail(user: User, donation: {
    amount: number;
    date: string;
    transactionId: string;
    cause?: string;
  }) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Thank You for Your Donation!</h1>
            <p>Hello ${user.first_name || 'there'},</p>
            <p>Thank you for your generous donation to HopeCare. Your support helps us make a difference!</p>
            <div style="
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 4px;
              margin: 20px 0;
            ">
              <h2 style="margin-top: 0; color: #333;">Donation Details:</h2>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 10px;">Amount: $${donation.amount.toFixed(2)}</li>
                <li style="margin-bottom: 10px;">Date: ${donation.date}</li>
                <li style="margin-bottom: 10px;">Transaction ID: ${donation.transactionId}</li>
                ${donation.cause ? `<li>Cause: ${donation.cause}</li>` : ''}
              </ul>
            </div>
            <p style="
              background-color: #d4edda;
              color: #155724;
              padding: 15px;
              border-radius: 4px;
            ">
              This email serves as your donation receipt for tax purposes.
            </p>
            <p>Best regards,<br>The HopeCare Team</p>
          </div>
        </body>
      </html>
    `;

    return this.sendWithRetry({
      to: user.email,
      subject: 'Donation Receipt - HopeCare',
      html,
      user_id: user.id,
      email_type: 'donation_receipt',
    });
  }

  async sendVolunteerApplicationConfirmationEmail(user: User, application: {
    program: string;
    date: string;
    status: string;
  }) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Volunteer Application Received</h1>
            <p>Hello ${user.first_name || 'there'},</p>
            <p>Thank you for applying to volunteer with HopeCare! We have received your application for the following program:</p>
            <div style="
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 4px;
              margin: 20px 0;
            ">
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 10px;">Program: ${application.program}</li>
                <li style="margin-bottom: 10px;">Application Date: ${application.date}</li>
                <li style="margin-bottom: 10px;">Status: ${application.status}</li>
              </ul>
            </div>
            <p>Our team will review your application and get back to you soon.</p>
            <p>Best regards,<br>The HopeCare Team</p>
          </div>
        </body>
      </html>
    `;

    return this.sendWithRetry({
      to: user.email,
      subject: 'Volunteer Application Received - HopeCare',
      html,
      user_id: user.id,
      email_type: 'volunteer_application',
    });
  }
}

export const emailService = new EmailService(); 