const fs = require('fs');
const path = require('path');

// Функция для получения размера файла
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

// Функция для форматирования размера файла
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / 1048576).toFixed(2) + ' MB';
}

// Сканируем директорию с изображениями
function scanLargeImages(dir) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];
  const largeImages = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else {
        const ext = path.extname(fullPath).toLowerCase();
        if (imageExtensions.includes(ext)) {
          const size = stat.size;
          if (size > 1024 * 1024) { // Больше 1 МБ
            largeImages.push({
              path: fullPath,
              size: size,
              formattedSize: formatFileSize(size)
            });
          }
        }
      }
    }
  }
  
  scanDirectory(dir);
  return largeImages;
}

// Сканируем все изображения в проекте
console.log('Сканирование больших изображений в проекте...\n');

const largeImages = scanLargeImages('.');
largeImages.sort((a, b) => b.size - a.size);

if (largeImages.length > 0) {
  console.log('Найдены изображения больше 1 МБ:');
  largeImages.forEach(img => {
    console.log(`${img.formattedSize}\t${img.path}`);
  });
  
  console.log(`\nВсего найдено ${largeImages.length} изображений больше 1 МБ`);
} else {
  console.log('Не найдено изображений больше 1 МБ');
}

// Также проверим размеры ключевых файлов
const keyFiles = [
  './package-lock.json',
  './server/storage.ts',
  './server/routes.ts',
  './server/repositories/GameRepository.ts',
  './server/repositories/GameLogicRepository.ts',
  './server/repositories/GameStatsRepository.ts'
];

console.log('\nРазмеры ключевых файлов:');
keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const size = getFileSize(file);
    console.log(`${formatFileSize(size)}\t${file}`);
  }
});