import fs from 'fs/promises';
import path from 'path';
import { optimizeImage } from './imageOptimizer';

async function optimizeExistingImage() {
  try {
    const imagePath = path.join(process.cwd(), 'server', 'uploads', 'characters', 'female_default.png');
    
    // Проверяем, существует ли файл
    try {
      await fs.access(imagePath);
    } catch (error) {
      console.error('Файл не найден:', imagePath);
      return;
    }
    
    // Читаем файл
    const imageBuffer = await fs.readFile(imagePath);
    console.log(`Оригинальный размер: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Оптимизируем изображение
    const optimizedBuffer = await optimizeImage(imageBuffer, {
      maxWidth: 512,
      maxHeight: 512,
      quality: 80
    });
    
    console.log(`Оптимизированный размер: ${(optimizedBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Сохраняем оптимизированное изображение как WebP
    const webpPath = imagePath.replace('.png', '.webp');
    await fs.writeFile(webpPath, optimizedBuffer);
    console.log(`Оптимизированное изображение сохранено: ${webpPath}`);
    
    // Удаляем оригинальный PNG файл, если нужно
    // await fs.unlink(imagePath);
    // console.log('Оригинальный PNG файл удален');
    
  } catch (error) {
    console.error('Ошибка при оптимизации изображения:', error);
  }
}

// Запускаем оптимизацию
optimizeExistingImage();