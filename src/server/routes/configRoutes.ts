import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { validateConfig } from '../middleware/validation';
import { requireAdmin } from '../middleware/auth';
import * as configService from '../services/configService';

interface Config {
  id: string;
  key: string;
  value: any;
  description?: string;
  created_at: string;
  updated_at: string;
  is_sensitive?: boolean;
  type?: string;
  category?: string;
}

const router: Router = Router();

// Get all configs (admin only)
router.get('/configs', requireAdmin, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const configs = await configService.getConfigs(category);
    
    // Mask sensitive values
    const maskedConfigs = configs.map(config => ({
      ...config,
      value: config.is_sensitive ? '********' : config.value
    }));
    
    res.json({ success: true, data: maskedConfigs });
  } catch (error) {
    console.error('Error fetching configs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch configurations' });
  }
});

// Get single config (admin only)
router.get(
  '/configs/:key',
  requireAdmin,
  param('key').trim().notEmpty(),
  async (req: Request, res: Response) => {
    try {
      const config = await configService.getConfigByKey(req.params.key);
      if (!config) {
        return res.status(404).json({ success: false, error: 'Configuration not found' });
      }
      
      // Mask sensitive value
      if (config.is_sensitive) {
        config.value = '********';
      }
      
      res.json({ success: true, data: config });
    } catch (error) {
      console.error('Error fetching config:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch configuration' });
    }
  }
);

// Create new config (admin only)
router.post(
  '/configs',
  requireAdmin,
  [
    body('key').isString().trim().notEmpty().withMessage('Key is required'),
    body('value').exists().withMessage('Value is required'),
    body('description').optional().isString(),
    body('is_sensitive').optional().isBoolean(),
    body('type').optional().isString(),
    body('category').optional().isString()
  ],
  validateConfig,
  async (req: Request, res: Response) => {
    try {
      const existingConfig = await configService.getConfigByKey(req.body.key);
      if (existingConfig) {
        return res.status(400).json({ success: false, error: 'Configuration key already exists' });
      }
      
      const config: Partial<Config> = req.body;
      const newConfig = await configService.createConfig(config);
      res.status(201).json({ success: true, data: newConfig });
    } catch (error) {
      console.error('Error creating config:', error);
      res.status(500).json({ success: false, error: 'Failed to create configuration' });
    }
  }
);

// Update config (admin only)
router.put(
  '/configs/:key',
  requireAdmin,
  [
    param('key').trim().notEmpty(),
    body('value').exists().withMessage('Value is required'),
    body('description').optional().isString(),
    body('is_sensitive').optional().isBoolean(),
    body('type').optional().isString(),
    body('category').optional().isString()
  ],
  validateConfig,
  async (req: Request, res: Response) => {
    try {
      const existingConfig = await configService.getConfigByKey(req.params.key);
      if (!existingConfig) {
        return res.status(404).json({ success: false, error: 'Configuration not found' });
      }
      
      const updates: Partial<Config> = req.body;
      const updatedConfig = await configService.updateConfig(req.params.key, updates);
      res.json({ success: true, data: updatedConfig });
    } catch (error) {
      console.error('Error updating config:', error);
      res.status(500).json({ success: false, error: 'Failed to update configuration' });
    }
  }
);

// Delete config (admin only)
router.delete(
  '/configs/:key',
  requireAdmin,
  param('key').trim().notEmpty(),
  async (req: Request, res: Response) => {
    try {
      const existingConfig = await configService.getConfigByKey(req.params.key);
      if (!existingConfig) {
        return res.status(404).json({ success: false, error: 'Configuration not found' });
      }
      
      await configService.deleteConfig(req.params.key);
      res.json({ success: true, message: `Config ${req.params.key} deleted successfully` });
    } catch (error) {
      console.error('Error deleting config:', error);
      res.status(500).json({ success: false, error: 'Failed to delete configuration' });
    }
  }
);

export default router;
