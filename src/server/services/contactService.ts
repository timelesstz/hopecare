import { db } from '../db';
import { sendEmail } from '../utils/email';
import { ContactFormData } from '../../types/contact';

export const saveContactMessage = async (data: ContactFormData) => {
  try {
    const result = await db.query(
      `INSERT INTO contact_messages (name, email, message, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [data.name, data.email, data.message]
    );

    // Send notification email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'hopecare.tz@gmail.com',
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${data.name} (${data.email})</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `
    });

    // Send confirmation email to user
    await sendEmail({
      to: data.email,
      subject: 'Thank you for contacting HopeCare Tanzania',
      html: `
        <h2>Thank you for contacting HopeCare Tanzania</h2>
        <p>Dear ${data.name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Your message:</p>
        <blockquote>${data.message}</blockquote>
        <p>Best regards,<br>HopeCare Tanzania Team</p>
      `
    });

    return result.rows[0];
  } catch (error) {
    console.error('Error saving contact message:', error);
    throw error;
  }
};
