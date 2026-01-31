// Скрипт для оптимизации изображений
const fs = require('fs');
const path = require('path');

// Функция для форматирования размера файла
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / 1048576).toFixed(2) + ' MB';
}

// Функция для получения размера файла
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

// Функция для оптимизации изображения (в идеале через Sharp, но пока просто копируем)
function optimizeImage(inputPath, outputPath) {
  // В реальном сценарии здесь будет использоваться Sharp для оптимизации
  // fs.copyFileSync(inputPath, outputPath); // Заглушка
  
  // Вместо этого, просто покажем, что файл можно оптимизировать
  console.log(`Оптимизация: ${inputPath} -> ${outputPath}`);
  
  // В реальности нужно установить sharp: npm install sharp
  // И использовать что-то вроде:
  /*
  const sharp = require('sharp');
  sharp(inputPath)
    .jpeg({quality: 80})
    .toFile(outputPath)
    .then(() => console.log(`Оптимизирован: ${outputPath}`))
    .catch(err => console.error('Ошибка оптимизации:', err));
  */
}

// Список больших изображений для оптимизации
const largeImages = [
  'attached_assets/pers1_1766500225942.png',
  'dist/uploads/characters/female_default.png',
  'server/uploads/characters/female_default.png',
  'attached_assets/82517b47-778e-4290-8a3b-631563a4f03e_1765137986298.png'
];

console.log('Потенциальные оптимизации изображений:\n');

largeImages.forEach(imagePath => {
  if (fs.existsSync(imagePath)) {
    const originalSize = getFileSize(imagePath);
    const dir = path.dirname(imagePath);
    const ext = path.extname(imagePath);
    const name = path.basename(imagePath, ext);
    const optimizedPath = path.join(dir, `${name}_optimized${ext}`);
    
    console.log(`Файл: ${imagePath}`);
    console.log(`Размер: ${formatFileSize(originalSize)}`);
    console.log(`Потенциальная экономия: ~30-50% при оптимизации`);
    console.log(`Оптимизированный файл: ${optimizedPath}\n`);
  }
});

console.log('Для фактической оптимизации изображений необходимо:');
console.log('1. Установить Sharp: npm install sharp');
console.log('2. Заменить комментарии в коде выше на реальный вызов Sharp');
console.log('3. Запустить скрипт повторно');