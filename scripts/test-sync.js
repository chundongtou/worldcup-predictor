/**
 * Test script for the sync pipeline
 * Run: node scripts/test-sync.js
 */

const https = require('https');

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const AGENT_KEY = process.env.AGENT_SECRET_KEY || '';

async function testEndpoint(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, APP_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AGENT_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('🧪 Testing Sync Pipeline\n');
  console.log(`APP_URL: ${APP_URL}\n`);

  // Test 1: Sync status
  console.log('1️⃣ Testing GET /api/sync (status)...');
  try {
    const res = await testEndpoint('/api/sync');
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(res.data, null, 2)}\n`);
  } catch (e) {
    console.log(`   Error: ${e.message}\n`);
  }

  // Test 2: Manual sync
  console.log('2️⃣ Testing POST /api/sync (manual trigger)...');
  try {
    const res = await testEndpoint('/api/sync', 'POST');
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(res.data, null, 2)}\n`);
  } catch (e) {
    console.log(`   Error: ${e.message}\n`);
  }

  // Test 3: Full pipeline
  console.log('3️⃣ Testing GET /api/sync/full-pipeline...');
  try {
    const res = await testEndpoint('/api/sync/full-pipeline');
    console.log(`   Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(res.data, null, 2)}\n`);
  } catch (e) {
    console.log(`   Error: ${e.message}\n`);
  }

  console.log('✅ Tests complete');
}

main().catch(console.error);
