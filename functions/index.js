const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { getAuth } = require('firebase-admin/auth');
const cors = require('cors')({ origin: true });
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin SDK
const app = initializeApp();

// Get service instances
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

/**
 * Sends a donation receipt email
 */
exports.sendDonationReceipt = functions.firestore
  .document('donations/{donationId}')
  .onCreate(async (snapshot, context) => {
    const donationData = snapshot.data();
    const donationId = context.params.donationId;
    
    try {
      // Get donor information
      const donorId = donationData.donor_id;
      if (!donorId) {
        console.log('No donor ID associated with donation');
        return null;
      }
      
      const donorSnapshot = await db.collection('users').doc(donorId).get();
      if (!donorSnapshot.exists) {
        console.log('Donor not found');
        return null;
      }
      
      const donorData = donorSnapshot.data();
      const donorEmail = donorData.email;
      
      if (!donorEmail) {
        console.log('Donor email not found');
        return null;
      }
      
      // Create email transporter
      const transporter = nodemailer.createTransport({
        host: functions.config().email.host,
        port: functions.config().email.port,
        secure: functions.config().email.secure === 'true',
        auth: {
          user: functions.config().email.user,
          pass: functions.config().email.password
        }
      });
      
      // Format donation amount
      const amount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: donationData.currency || 'USD'
      }).format(donationData.amount);
      
      // Generate receipt ID
      const receiptId = `REC-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Send email
      await transporter.sendMail({
        from: `"HopeCare" <${functions.config().email.from}>`,
        to: donorEmail,
        subject: 'Thank You for Your Donation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
              <h1 style="color: #4a5568;">Thank You for Your Donation</h1>
            </div>
            <div style="padding: 20px;">
              <p>Dear ${donorData.name || 'Valued Donor'},</p>
              <p>Thank you for your generous donation to HopeCare. Your support helps us continue our mission to make a positive impact in our community.</p>
              <div style="background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; margin: 20px 0;">
                <h2 style="margin-top: 0; color: #4a5568;">Donation Receipt</h2>
                <p><strong>Receipt ID:</strong> ${receiptId}</p>
                <p><strong>Date:</strong> ${new Date(donationData.created_at).toLocaleDateString()}</p>
                <p><strong>Amount:</strong> ${amount}</p>
                <p><strong>Payment Method:</strong> ${donationData.payment_method || 'Card'}</p>
                <p><strong>Type:</strong> ${donationData.type || 'One-time donation'}</p>
              </div>
              <p>This donation may be tax-deductible. Please keep this receipt for your records.</p>
              <p>If you have any questions about your donation, please contact us at support@hopecare.org.</p>
              <p>With gratitude,<br>The HopeCare Team</p>
            </div>
            <div style="background-color: #4a5568; color: white; padding: 15px; text-align: center;">
              <p>&copy; ${new Date().getFullYear()} HopeCare. All rights reserved.</p>
            </div>
          </div>
        `
      });
      
      // Update donation with receipt information
      await snapshot.ref.update({
        receipt_id: receiptId,
        receipt_sent: true,
        receipt_sent_at: FieldValue.serverTimestamp()
      });
      
      return null;
    } catch (error) {
      console.error('Error sending donation receipt:', error);
      return null;
    }
  });

/**
 * Creates a user profile when a new user is created
 */
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    const { uid, email, displayName, photoURL } = user;
    
    // Default role is DONOR
    const role = 'DONOR';
    
    // Create user profile in Firestore
    await db.collection('users').doc(uid).set({
      id: uid,
      email,
      name: displayName || email.split('@')[0],
      role,
      photo_url: photoURL || null,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
      status: 'ACTIVE'
    });
    
    // Create donor profile
    await db.collection('donor_profiles').doc(uid).set({
      user_id: uid,
      preferences: {
        email_notifications: true,
        donation_privacy: 'private'
      },
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp()
    });
    
    // Log user creation
    await db.collection('audit_logs').add({
      user_id: uid,
      action: 'USER_CREATED',
      details: {
        method: 'firebase_auth',
        role
      },
      timestamp: FieldValue.serverTimestamp()
    });
    
    return null;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
});

/**
 * API endpoint to process donations
 */
exports.processDonation = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Check if request method is POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
      const { amount, currency, payment_method, donor_id, project_id } = req.body;
      
      // Validate required fields
      if (!amount || !payment_method) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Create donation record
      const donationRef = db.collection('donations').doc();
      await donationRef.set({
        amount: Number(amount),
        currency: currency || 'USD',
        payment_method,
        donor_id,
        project_id,
        status: 'completed',
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
        transaction_id: `TXN-${uuidv4().substring(0, 8).toUpperCase()}`
      });
      
      // Return success response
      return res.status(200).json({
        success: true,
        donation_id: donationRef.id,
        message: 'Donation processed successfully'
      });
    } catch (error) {
      console.error('Error processing donation:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});

/**
 * Scheduled function to generate monthly donation reports
 */
exports.generateMonthlyDonationReport = functions.pubsub
  .schedule('0 0 1 * *') // Run at midnight on the 1st of every month
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      
      // Query donations from last month
      const donationsSnapshot = await db.collection('donations')
        .where('created_at', '>=', lastMonth)
        .where('created_at', '<=', lastMonthEnd)
        .get();
      
      // Calculate totals
      let totalAmount = 0;
      let donorCount = new Set();
      const donationsByProject = {};
      
      donationsSnapshot.forEach(doc => {
        const donation = doc.data();
        totalAmount += donation.amount;
        
        if (donation.donor_id) {
          donorCount.add(donation.donor_id);
        }
        
        if (donation.project_id) {
          donationsByProject[donation.project_id] = (donationsByProject[donation.project_id] || 0) + donation.amount;
        }
      });
      
      // Generate report
      const reportRef = db.collection('reports').doc();
      await reportRef.set({
        type: 'monthly_donations',
        period: {
          start: lastMonth,
          end: lastMonthEnd
        },
        metrics: {
          total_amount: totalAmount,
          donation_count: donationsSnapshot.size,
          donor_count: donorCount.size,
          donations_by_project: donationsByProject
        },
        created_at: FieldValue.serverTimestamp()
      });
      
      return null;
    } catch (error) {
      console.error('Error generating monthly donation report:', error);
      return null;
    }
  }); 