import { NextApiRequest, NextApiResponse } from 'next';
import { donationService } from '../../../services/donationService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === 'POST') {
    try {
      const {
        amount,
        donationType,
        recurringInterval,
        donorInfo,
        paymentMethodId,
      } = req.body;

      const result = await donationService.processDonation({
        amount,
        donationType,
        recurringInterval,
        donorInfo,
        paymentMethodId,
        userId: session?.user?.id,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error processing donation:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to process donation',
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '10', filter } = req.query;
      const donations = await donationService.getDonations({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filter: filter as string,
        userId: session?.user?.id,
      });

      return res.status(200).json(donations);
    } catch (error) {
      console.error('Error fetching donations:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch donations',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
