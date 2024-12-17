import { NextApiRequest, NextApiResponse } from 'next';
import { donationService } from '../../../services/donationService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stats = await donationService.getDonationStats();
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch donation stats',
    });
  }
}
