import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import DonationReceipt from '@/emails/DonationReceipt';

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface DonationReceiptData {
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  date: string;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annually';
  projectName?: string;
  transactionId: string;
  taxDeductible: boolean;
}

export const sendDonationReceipt = async (data: DonationReceiptData) => {
  const emailHtml = render(DonationReceipt(data));

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: data.donorEmail,
    subject: 'Thank You for Your Donation to HopeCare',
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Donation receipt sent to ${data.donorEmail}`);
  } catch (error) {
    console.error('Error sending donation receipt:', error);
    throw error;
  }
};
