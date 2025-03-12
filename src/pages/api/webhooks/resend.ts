// Supabase client import removed - using Firebase instead
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

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

    // Find the email log with the matching message ID
    const emailLogsCollection = collection(db, 'email_logs');
    const emailQuery = query(
      emailLogsCollection,
      where('metadata.message_id', '==', payload.email_id)
    );
    
    const querySnapshot = await getDocs(emailQuery);
    
    if (querySnapshot.empty) {
      console.error('Email log not found for message ID:', payload.email_id);
      return res.status(404).json({ error: 'Email log not found' });
    }
    
    // Update the email log with delivery status
    const emailLogDoc = querySnapshot.docs[0];
    const emailLogRef = doc(db, 'email_logs', emailLogDoc.id);
    
    await updateDoc(emailLogRef, {
      status: payload.data.status,
      metadata: {
        ...emailLogDoc.data().metadata,
        ...payload.data,
        webhook_received_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 