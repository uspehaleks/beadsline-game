// Простой тест для проверки эндпоинта health-check
const http = require('http');

function testHealthCheck() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health-check',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);

    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        console.log('Response:', JSON.parse(data));
      } catch (e) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.end();
}

testHealthCheck();