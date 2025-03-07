// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';

interface ResendWebhookPayload {
  type: string;
  email_id: string;
  created_at: string;
  data: {
    email_id: string;
    status: 'delivered' | 'bounced' | 'complained' | 'failed';
    to: string;
    error?: string;
  };
}

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  const signature = req.headers['resend-signature'];

  if (!webhookSecret || !signature) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = req.body as ResendWebhookPayload;

    // Update email log with delivery status
    const { error } = await supabase
      .from('email_logs')
      .update({
        status: payload.data.status,
        metadata: {
          ...payload.data,
          webhook_received_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('metadata->message_id', payload.email_id);

    if (error) {
      console.error('Error updating email log:', error);
      return res.status(500).json({ error: 'Failed to update email log' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 