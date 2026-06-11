/**
 * Configuration checker for World Cup Predictor
 * Run: node scripts/check-config.js
 */

const https = require('https');

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const AGENT_KEY = process.env.AGENT_SECRET_KEY || '';

async function checkEndpoint(path, name) {
  return new Promise((resolve) => {
    const url = new URL(path, APP_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AGENT_KEY}`,
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          name,
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          data: data.substring(0, 200),
        });
      });
    });

    req.on('error', (e) => {
      resolve({ name, status: 0, ok: false, error: e.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ name, status: 0, ok: false, error: 'Timeout' });
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Configuration Checker\n');
  console.log(`APP_URL: ${APP_URL}\n`);

  const checks = [
    { path: '/api/sync', name: 'Sync Status' },
    { path: '/api/sync/full-pipeline', name: 'Full Pipeline' },
    { path: '/api/agent/accuracy-report', name: 'Accuracy Report' },
  ];

  let allOk = true;

  for (const check of checks) {
    console.log(`Checking ${check.name}...`);
    const result = await checkEndpoint(check.path, check.name);
    
    if (result.ok) {
      console.log(`  ✅ ${check.name}: ${result.status}`);
    } else {
      console.log(`  ❌ ${check.name}: ${result.status} ${result.error || ''}`);
      allOk = false;
    }
  }

  console.log('');
  if (allOk) {
    console.log('✅ All checks passed!');
  } else {
    console.log('⚠️  Some checks failed. Check the configuration.');
  }
}

main().catch(console.error);
