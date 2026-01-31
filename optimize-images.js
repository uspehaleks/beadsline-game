// Скрипт для оптимизации изображений
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  const imagePath = './server/uploads/characters/female_default.png';
  const outputPathWebp = './server/uploads/characters/female_default_optimized.webp';
  const outputPathPng = './server/uploads/characters/female_default_optimized.png';

  try {
    console.log('Оптимизация изображения...');
    
    // Получаем информацию о файле
    const stats = fs.statSync(imagePath);
    console.log(`Исходный размер: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Оптимизация в WebP
    await sharp(imagePath)
      .webp({ quality: 80 })
      .toFile(outputPathWebp);
      
    // Оптимизация в PNG
    await sharp(imagePath)
      .png({ quality: 80 })
      .toFile(outputPathPng);
    
    // Проверяем размеры новых файлов
    const webpStats = fs.statSync(outputPathWebp);
    const pngStats = fs.statSync(outputPathPng);
    
    console.log(`Размер WebP: ${(webpStats.size / 1024).toFixed(2)} KB`);
    console.log(`Размер оптимизированного PNG: ${(pngStats.size / 1024).toFixed(2)} KB`);
    
    // Рассчитываем экономию
    const originalSize = stats.size;
    const webpSize = webpStats.size;
    const pngSize = pngStats.size;
    
    console.log(`Экономия с WebP: ${Math.round((1 - webpSize / originalSize) * 100)}%`);
    console.log(`Экономия с PNG: ${Math.round((1 - pngSize / originalSize) * 100)}%`);
    
    // Удаляем исходный файл и переименовываем оптимизированный
    fs.unlinkSync(imagePath);
    fs.renameSync(outputPathPng, imagePath);
    
    console.log('Оптимизация завершена!');
  } catch (error) {
    console.error('Ошибка при оптимизации изображения:', error);
  }
}

optimizeImages();