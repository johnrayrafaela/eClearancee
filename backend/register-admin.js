// Helper script: registers an admin via the existing /api/admins/register endpoint.
// Usage: node register-admin.js [email] [password] [firstname] [lastname]
// Defaults to: admin@cctc.com 123 admin 1

require('dotenv').config();
const http = require('http');

const email = process.argv[2] || 'admin@cctc.com';
const password = process.argv[3] || '123';
const firstname = process.argv[4] || 'admin';
const lastname = process.argv[5] || '1';

const PORT = process.env.PORT || 5000;

function register() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ firstname, lastname, email, password });

    const opts = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/admins/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(opts, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body || '{}');
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('\n✅ Admin registered successfully');
            console.log(json);
            resolve(json);
          } else {
            console.error(`\n⚠️  Failed (status ${res.statusCode})`);
            console.error(json);
            resolve(json);
          }
        } catch (e) {
          console.error('Parse error:', e.message, body);
          reject(e);
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(data);
    req.end();
  });
}

(async () => {
  console.log(`Attempting to register admin: ${email}`);
  try {
    await register();
  } catch (e) {
    console.error('Registration error:', e.message);
  }
})();
