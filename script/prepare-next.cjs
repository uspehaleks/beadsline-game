const fs = require('fs');
const path = require('path');

// Скрипт подготовки проекта для Next.js
// Копирует файлы из client/src в корень перед сборкой

const clientSrcDir = path.join(__dirname, '..', 'client', 'src');
const pagesDir = path.join(__dirname, '..', 'pages');
const componentsDir = path.join(__dirname, '..', 'components');
const appFile = path.join(__dirname, '..', 'App.tsx');
const mainFile = path.join(__dirname, '..', 'main.tsx');
const indexCssFile = path.join(__dirname, '..', 'index.css');

// Удаляем старые файлы, если они есть
if (fs.existsSync(pagesDir)) {
  fs.rmSync(pagesDir, { recursive: true, force: true });
}

if (fs.existsSync(appFile)) {
  fs.unlinkSync(appFile);
}

if (fs.existsSync(mainFile)) {
  fs.unlinkSync(mainFile);
}

if (fs.existsSync(indexCssFile)) {
  fs.unlinkSync(indexCssFile);
}

// Копируем pages
if (fs.existsSync(path.join(clientSrcDir, 'pages'))) {
  fs.cpSync(path.join(clientSrcDir, 'pages'), pagesDir, { recursive: true });
}

// Копируем App.tsx
if (fs.existsSync(path.join(clientSrcDir, 'App.tsx'))) {
  fs.copyFileSync(path.join(clientSrcDir, 'App.tsx'), appFile);
}

// Копируем main.tsx
if (fs.existsSync(path.join(clientSrcDir, 'main.tsx'))) {
  fs.copyFileSync(path.join(clientSrcDir, 'main.tsx'), mainFile);
}

// Копируем index.css
if (fs.existsSync(path.join(clientSrcDir, 'index.css'))) {
  fs.copyFileSync(path.join(clientSrcDir, 'index.css'), indexCssFile);
}

// Копируем components
if (fs.existsSync(path.join(clientSrcDir, 'components'))) {
  fs.cpSync(path.join(clientSrcDir, 'components'), componentsDir, { recursive: true });
} else if (fs.existsSync(path.join(clientSrcDir, '..', 'components'))) {
  fs.cpSync(path.join(clientSrcDir, '..', 'components'), componentsDir, { recursive: true });
}

console.log('Project preparation completed.');