import sharp from 'sharp';

/**
 * Оптимизирует изображение аватара
 * @param buffer - буфер изображения
 * @returns оптимизированный буфер в формате WebP
 */
export async function optimizeAvatar(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize(512, 512, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({
      quality: 80,
      lossless: false
    })
    .toBuffer();
}

/**
 * Оптимизирует изображение с возможностью настройки параметров
 * @param buffer - буфер изображения
 * @param options - параметры оптимизации
 * @returns оптимизированный буфер в формате WebP
 */
export async function optimizeImage(
  buffer: Buffer, 
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<Buffer> {
  const { maxWidth = 512, maxHeight = 512, quality = 80 } = options;
  
  return await sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({
      quality,
      lossless: false
    })
    .toBuffer();
}

/**
 * Проверяет, является ли буфер изображением
 * @param buffer - буфер для проверки
 * @returns true, если буфер является изображением
 */
export async function isValidImage(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(buffer).metadata();
    return metadata.width !== undefined && metadata.height !== undefined;
  } catch (error) {
    return false;
  }
}