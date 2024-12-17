import { Stripe } from 'stripe';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import DonationReceiptEmail from '../emails/DonationReceipt';
import ThankYouEmail from '../emails/ThankYouEmail';

interface DonationData {
  amount: number;
  donationType: 'one-time' | 'monthly' | 'recurring';
  recurringInterval?: 'weekly' | 'biweekly' | 'monthly';
  donorInfo: {
    name: string;
    email: string;
  };
  paymentMethodId: string;
}

class DonationService {
  private stripe: Stripe;
  private emailTransporter: nodemailer.Transporter;
  private organizationInfo = {
    name: 'HopeCare',
    address: '123 Healthcare Ave, Medical District, City, State 12345',
    taxId: '12-3456789',
    website: 'https://hopecare.org',
    socialLinks: {
      twitter: 'https://twitter.com/hopecare',
      facebook: 'https://facebook.com/hopecare',
      instagram: 'https://instagram.com/hopecare',
    },
  };

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private async createStripeCustomer(donorInfo: DonationData['donorInfo']) {
    const customer = await this.stripe.customers.create({
      name: donorInfo.name,
      email: donorInfo.email,
      metadata: {
        source: 'hopecare_website',
      },
    });
    return customer;
  }

  private async setupRecurringPayment(
    customerId: string,
    paymentMethodId: string,
    amount: number,
    interval: 'week' | 'month'
  ) {
    // Attach payment method to customer
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method
    await this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Recurring Donation',
            },
            unit_amount: amount * 100, // Convert to cents
            recurring: {
              interval: interval,
            },
          },
        },
      ],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  }

  private async processOneTimePayment(
    customerId: string,
    paymentMethodId: string,
    amount: number
  ) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
    });

    return paymentIntent;
  }

  private async sendEmails(
    donorInfo: DonationData['donorInfo'],
    amount: number,
    donationType: DonationData['donationType'],
    recurringInterval: DonationData['recurringInterval'],
    transactionId: string
  ) {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Send receipt email
    const receiptHtml = render(
      DonationReceiptEmail({
        donorName: donorInfo.name,
        amount,
        donationType,
        recurringInterval,
        transactionId,
        date,
        taxDeductible: true,
        organizationInfo: this.organizationInfo,
      })
    );

    await this.emailTransporter.sendMail({
      from: \`"\${this.organizationInfo.name}" <donations@\${this.organizationInfo.website}>\`,
      to: donorInfo.email,
      subject: 'Your Donation Receipt',
      html: receiptHtml,
    });

    // Send thank you email
    const thankYouHtml = render(
      ThankYouEmail({
        donorName: donorInfo.name,
        amount,
        donationType,
        recurringInterval,
        impact: {
          description: 'Your donation helps us provide essential healthcare services to those in need.',
          metrics: [
            {
              label: 'People Helped',
              value: '100+',
            },
            {
              label: 'Communities Served',
              value: '10+',
            },
          ],
        },
        organizationInfo: this.organizationInfo,
      })
    );

    await this.emailTransporter.sendMail({
      from: \`"\${this.organizationInfo.name}" <support@\${this.organizationInfo.website}>\`,
      to: donorInfo.email,
      subject: 'Thank You for Your Support!',
      html: thankYouHtml,
    });
  }

  public async processDonation(donationData: DonationData) {
    try {
      // Create or get customer
      const customer = await this.createStripeCustomer(donationData.donorInfo);

      let paymentResult;
      if (donationData.donationType === 'one-time') {
        paymentResult = await this.processOneTimePayment(
          customer.id,
          donationData.paymentMethodId,
          donationData.amount
        );
      } else {
        paymentResult = await this.setupRecurringPayment(
          customer.id,
          donationData.paymentMethodId,
          donationData.amount,
          donationData.donationType === 'monthly' ? 'month' : 'week'
        );
      }

      // Send emails
      await this.sendEmails(
        donationData.donorInfo,
        donationData.amount,
        donationData.donationType,
        donationData.recurringInterval,
        paymentResult.id
      );

      return {
        success: true,
        transactionId: paymentResult.id,
        customerId: customer.id,
      };
    } catch (error) {
      console.error('Error processing donation:', error);
      throw error;
    }
  }

  public async getDonationStats() {
    // Implement donation statistics retrieval
    // This would typically involve database queries
    return {
      totalDonors: 1000,
      monthlyDonors: 250,
      totalRaised: 500000,
      impactMetrics: {
        livesImpacted: 5000,
        communitiesServed: 50,
        monthlyGrowth: 15,
      },
    };
  }

  public async getDonorWall(limit: number = 10) {
    // Implement donor wall data retrieval
    // This would typically involve database queries with proper privacy controls
    return {
      featuredDonors: [
        {
          id: '1',
          name: 'John D.',
          amount: 1000,
          date: '2024-01-01',
          message: 'Supporting healthcare access for all!',
          isRecurring: true,
          badge: 'champion',
        },
        // Add more featured donors
      ],
      recentDonors: [
        {
          id: '2',
          name: 'Sarah M.',
          amount: 500,
          date: '2024-01-02',
          badge: 'new',
        },
        // Add more recent donors
      ],
    };
  }
}

export const donationService = new DonationService();
export default donationService;
