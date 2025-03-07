import sharp from 'sharp';
// Supabase client import removed - using Firebase instead
import { db, auth, storage } from '../lib/firebase';
import { scanFile } from './security';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

      const storageRef = ref(storage, `avatars/${filename}`);
      
      // Upload the file
      await uploadBytes(storageRef, processed.buffer);
      
      // Get the public URL
      const publicUrl = await getDownloadURL(storageRef);

      // Update user profile with new avatar URL
      await db.collection('users').doc(userId).update({ avatar_url: publicUrl });

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

/**
 * Processes and optimizes an image for upload
 * @param file The image file to process
 * @param options Processing options
 * @returns Processed image data
 */
export async function processImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'jpeg',
  } = options;

  return new Promise<{
    file: File;
    width: number;
    height: number;
    originalSize: number;
    optimizedSize: number;
  }>((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to desired format
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not create image blob'));
            return;
          }

          const optimizedFile = new File(
            [blob],
            `${file.name.split('.')[0]}.${format}`,
            {
              type: `image/${format}`,
              lastModified: Date.now(),
            }
          );

          resolve({
            file: optimizedFile,
            width,
            height,
            originalSize: file.size,
            optimizedSize: blob.size,
          });
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image to Firebase Storage
 * @param file The image file to upload
 * @param path The storage path
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(file: File, path: string = 'images') {
  try {
    const filename = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `${path}/${filename}`);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the public URL
    const publicUrl = await getDownloadURL(storageRef);
    
    return {
      url: publicUrl,
      path: `${path}/${filename}`,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Processes and uploads an image
 * @param file The image file to process and upload
 * @param options Processing options
 * @returns The processed image data and public URL
 */
export async function processAndUploadImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    path?: string;
  } = {}
) {
  const { path = 'images', ...processOptions } = options;
  
  // Process the image
  const processedImage = await processImage(file, processOptions);
  
  // Upload the processed image
  const uploadResult = await uploadImage(processedImage.file, path);
  
  return {
    ...processedImage,
    url: uploadResult.url,
    path: uploadResult.path,
  };
} 