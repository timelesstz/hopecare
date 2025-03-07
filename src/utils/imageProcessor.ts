import sharp from 'sharp';
// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
import { scanFile } from './security';

interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

interface ProcessedImage {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
}

export class ImageProcessor {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

  static async processProfileImage(
    file: Buffer,
    mimeType: string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> {
    // Validate file
    if (!this.ALLOWED_FORMATS.includes(mimeType)) {
      throw new Error('Unsupported file format');
    }

    if (file.length > this.MAX_FILE_SIZE) {
      throw new Error('File size too large');
    }

    // Scan file for viruses
    const isSafe = await scanFile(file);
    if (!isSafe) {
      throw new Error('File failed security scan');
    }

    // Process image
    const image = sharp(file);
    const metadata = await image.metadata();

    const processedImage = await image
      .resize({
        width: options.width || 400,
        height: options.height || 400,
        fit: 'cover',
        position: 'center'
      })
      .format(options.format || 'jpeg')
      .jpeg({ quality: options.quality || 80 })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: processedImage.data,
      format: processedImage.info.format,
      width: processedImage.info.width,
      height: processedImage.info.height,
      size: processedImage.info.size
    };
  }

  static async uploadProfileImage(
    userId: string,
    file: Buffer,
    mimeType: string
  ): Promise<string> {
    try {
      const processed = await this.processProfileImage(file, mimeType);
      const filename = `profile-${userId}-${Date.now()}.${processed.format}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filename, processed.buffer, {
          contentType: `image/${processed.format}`,
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filename);

      // Update user profile with new avatar URL
      await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      return publicUrl;
    } catch (error) {
      console.error('Profile image upload error:', error);
      throw new Error('Failed to upload profile image');
    }
  }

  static async generateThumbnail(
    file: Buffer,
    mimeType: string,
    size: number = 150
  ): Promise<Buffer> {
    if (!this.ALLOWED_FORMATS.includes(mimeType)) {
      throw new Error('Unsupported file format');
    }

    return sharp(file)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .format('jpeg')
      .jpeg({ quality: 70 })
      .toBuffer();
  }

  static async optimizeImage(
    file: Buffer,
    mimeType: string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> {
    if (!this.ALLOWED_FORMATS.includes(mimeType)) {
      throw new Error('Unsupported file format');
    }

    const image = sharp(file);
    const metadata = await image.metadata();

    // Determine optimal format
    const format = options.format || this.getOptimalFormat(metadata.format);

    // Process image
    const processed = await image
      .resize({
        width: options.width || metadata.width,
        height: options.height,
        fit: 'inside',
        withoutEnlargement: true
      })
      .format(format)
      [format]({ quality: options.quality || 80 })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: processed.data,
      format: processed.info.format,
      width: processed.info.width,
      height: processed.info.height,
      size: processed.info.size
    };
  }

  private static getOptimalFormat(currentFormat: string): 'jpeg' | 'png' | 'webp' {
    // Prefer WebP for better compression while maintaining quality
    return 'webp';
  }
} 