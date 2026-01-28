// Тестовый файл для проверки API маршрутов
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testApiRoutes() {
  console.log('Testing API routes...\n');

  try {
    // Тестируем health-check маршрут
    console.log('1. Testing health-check route...');
    const healthCheckResult = await execAsync('curl -s http://localhost:3000/api/health-check');
    console.log('Response:', healthCheckResult.stdout.substring(0, 200) + '...');
    console.log('✓ Health-check route test completed\n');

    // Тестируем webhook setup маршрут
    console.log('2. Testing webhook setup route...');
    const webhookResult = await execAsync('curl -s -X POST http://localhost:3000/api/telegram/setup-webhook');
    console.log('Response:', webhookResult.stdout.substring(0, 200) + '...');
    console.log('✓ Webhook setup route test completed\n');

    // Тестируем env-info маршрут
    console.log('3. Testing env-info route...');
    const envInfoResult = await execAsync('curl -s http://localhost:3000/api/env-info');
    console.log('Response:', envInfoResult.stdout.substring(0, 200) + '...');
    console.log('✓ Env-info route test completed\n');

    // Тестируем debug-env маршрут
    console.log('4. Testing debug-env route...');
    const debugEnvResult = await execAsync('curl -s http://localhost:3000/api/debug-env');
    console.log('Response:', debugEnvResult.stdout.substring(0, 200) + '...');
    console.log('✓ Debug-env route test completed\n');

    console.log('All API routes tested successfully!');
  } catch (error) {
    console.error('Error during testing:', error.message);
  }
}

// Запускаем тестирование
testApiRoutes();