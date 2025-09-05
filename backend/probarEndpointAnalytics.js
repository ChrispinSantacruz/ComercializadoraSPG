const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjY0YWI2NTY3NmUxY2U1YzUwNmJhZSIsImVtYWlsIjoiYWRtaW5AY29tZXJjaWFudGUuY29tIiwicm9sIjoiY29tZXJjaWFudGUiLCJpYXQiOjE3NTY5NTI2MDAsImV4cCI6MTc1NzAzOTAwMH0.1PGLnsKlcD3y67pYqLN0aDHCdISwPjU-XH3AIGbX-ko';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/analytics/merchant',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse body:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
