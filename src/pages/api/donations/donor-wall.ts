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
    const { featured = 'false', limit = '10' } = req.query;
    const donors = await donationService.getDonorWall({
      featured: featured === 'true',
      limit: parseInt(limit as string),
    });
    return res.status(200).json(donors);
  } catch (error) {
    console.error('Error fetching donor wall:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch donor wall',
    });
  }
}
