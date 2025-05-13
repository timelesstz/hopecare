import { Resend } from 'resend';
import { User } from './userService';
import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

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
      const emailLogsCollection = collection(db, 'email_logs');
      const timestamp = new Date().toISOString();
      
      const docRef = await addDoc(emailLogsCollection, {
        ...data,
        created_at: timestamp,
        updated_at: timestamp,
      });
      
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error logging email attempt:', error);
      return { id: 'error-logging-email', ...data };
    }
  }

  private async updateEmailLog(id: string, data: Partial<EmailLog>) {
    try {
      const emailLogRef = doc(db, 'email_logs', id);
      
      await updateDoc(emailLogRef, {
        ...data,
        updated_at: new Date().toISOString(),
      });
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
    let logEntry;
    
    try {
      logEntry = await this.logEmailAttempt({
        user_id: options.user_id,
        email_type: options.email_type,
        status: 'pending',
        retry_count: retryCount,
      });

      const result = await this.resend.emails.send({
        from: `HopeCare <${process.env.RESEND_FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (result.error) throw result.error;

      await this.updateEmailLog(logEntry.id, {
        status: 'sent',
        metadata: { message_id: result.data?.id || 'unknown' },
      });

      return true;
    } catch (error) {
      console.error(`Email sending failed (attempt ${retryCount + 1}):`, error);

      if (retryCount < this.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.sendWithRetry(options, retryCount + 1);
      }

      if (logEntry) {
        await this.updateEmailLog(logEntry.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        });
      }

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
}

async sendVolunteerWelcomeEmail(email: string, data: { firstName: string; lastName: string }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Welcome to HopeCare Volunteer Program!</h1>
          <p>Hello ${data.firstName},</p>
          <p>Thank you for joining our volunteer program. We're excited to have you on board!</p>
          <p>Our team will be in touch with you soon about available opportunities.</p>
          <p>Best regards,<br>The HopeCare Team</p>
        </div>
      </body>
    </html>
  `;

  return this.sendWithRetry({
    to: email,
    subject: 'Welcome to HopeCare Volunteer Program',
    html,
    user_id: 'volunteer', // This is a placeholder, should be replaced with actual user ID
    email_type: 'volunteer_welcome',
  });
}

async sendVolunteerAssignmentEmail(email: string, data: { 
  firstName: string;
  opportunityName: string;
  startDate: string;
  location: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Volunteer Assignment Confirmation</h1>
          <p>Hello ${data.firstName},</p>
          <p>You have been assigned to the following volunteer opportunity:</p>
          <div style="
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 4px;
            margin: 20px 0;
          ">
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 10px;">Opportunity: ${data.opportunityName}</li>
              <li style="margin-bottom: 10px;">Start Date: ${data.startDate}</li>
              <li style="margin-bottom: 10px;">Location: ${data.location}</li>
            </ul>
          </div>
          <p>Please contact us if you have any questions or need to reschedule.</p>
          <p>Best regards,<br>The HopeCare Team</p>
        </div>
      </body>
    </html>
  `;

  return this.sendWithRetry({
    to: email,
    subject: 'Volunteer Assignment Confirmation - HopeCare',
    html,
    user_id: 'volunteer', // This is a placeholder, should be replaced with actual user ID
    email_type: 'volunteer_assignment',
  });
}

async sendHoursApprovedEmail(email: string, data: {
  firstName: string;
  hours: number;
  date: string;
  opportunityName: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Volunteer Hours Approved</h1>
          <p>Hello ${data.firstName},</p>
          <p>Your volunteer hours have been approved:</p>
          <div style="
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 4px;
            margin: 20px 0;
          ">
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin-bottom: 10px;">Hours: ${data.hours}</li>
              <li style="margin-bottom: 10px;">Date: ${data.date}</li>
              <li style="margin-bottom: 10px;">Opportunity: ${data.opportunityName}</li>
            </ul>
          </div>
          <p>Thank you for your dedication and service!</p>
          <p>Best regards,<br>The HopeCare Team</p>
        </div>
      </body>
    </html>
  `;

  return this.sendWithRetry({
    to: email,
    subject: 'Volunteer Hours Approved - HopeCare',
    html,
    user_id: 'volunteer', // This is a placeholder, should be replaced with actual user ID
    email_type: 'hours_approved',
  });
}

async sendBackgroundCheckApprovedEmail(email: string, data: { firstName: string }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Background Check Approved</h1>
          <p>Hello ${data.firstName},</p>
          <p>We are pleased to inform you that your background check has been approved.</p>
          <p>You are now eligible to participate in all volunteer opportunities that require a background check.</p>
          <p>Thank you for your patience during this process.</p>
          <p>Best regards,<br>The HopeCare Team</p>
        </div>
      </body>
    </html>
  `;

  return this.sendWithRetry({
    to: email,
    subject: 'Background Check Approved - HopeCare',
    html,
    user_id: 'volunteer', // This is a placeholder, should be replaced with actual user ID
    email_type: 'background_check_approved',
  });
}

async sendBackgroundCheckRejectedEmail(email: string, data: { firstName: string; reason?: string }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Background Check Status</h1>
          <p>Hello ${data.firstName},</p>
          <p>We regret to inform you that we are unable to approve your background check at this time.</p>
          ${data.reason ? `<p>Reason: ${data.reason}</p>` : ''}
          <p>If you believe this is an error or would like to discuss this further, please contact our volunteer coordinator.</p>
          <p>Best regards,<br>The HopeCare Team</p>
        </div>
      </body>
    </html>
  `;

  return this.sendWithRetry({
    to: email,
    subject: 'Background Check Status - HopeCare',
    html,
    user_id: 'volunteer', // This is a placeholder, should be replaced with actual user ID
    email_type: 'background_check_rejected',
  });
}
}

export const emailService = new EmailService();