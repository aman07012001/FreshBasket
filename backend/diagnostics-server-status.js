#!/usr/bin/env node

const http = require('http');
const { exec } = require('child_process');
const { env } = require('./config');

const PORT = env.PORT || 5000;
const API_BASE_URL = `http://localhost:${PORT}`;

console.log('🔍 Server Status Diagnostic Tool');
console.log('================================');
console.log(`Target Port: ${PORT}`);
console.log(`Target URL: ${API_BASE_URL}`);
console.log('');

function checkPort() {
  return new Promise((resolve) => {
    const client = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/health',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    client.on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
        code: err.code
      });
    });

    client.on('timeout', () => {
      client.destroy();
      resolve({
        success: false,
        error: 'Request timed out',
        code: 'TIMEOUT'
      });
    });

    client.end();
  });
}

function checkPortUsage() {
  return new Promise((resolve) => {
    const command = process.platform === 'win32' 
      ? `netstat -ano | findstr :${PORT}`
      : `lsof -i :${PORT}`;

    exec(command, (error, stdout, stderr) => {
      if (error && error.code !== 1) {
        resolve({ error: error.message });
        return;
      }

      resolve({
        output: stdout || stderr || 'No processes found',
        hasProcesses: (stdout + stderr).trim().length > 0
      });
    });
  });
}

function checkMongoDB() {
  return new Promise((resolve) => {
    const mongoose = require('mongoose');

    const options = {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 3000
    };

    mongoose.connect(env.MONGO_URL, options)
      .then(() => {
        console.log('✅ MongoDB connection successful');
        mongoose.connection.close();
        resolve({ success: true });
      })
      .catch((err) => {
        console.log('❌ MongoDB connection failed:', err.message);
        resolve({ success: false, error: err.message });
      });
  });
}

async function runDiagnostics() {
  console.log('Test 1: Checking if server is responding...');
  const portResult = await checkPort();

  if (portResult.success) {
    console.log('✅ Server is responding!');
    console.log(`   Status: ${portResult.status}`);
    console.log(`   Response: ${portResult.data.substring(0, 200)}...`);
  } else {
    console.log('❌ Server is not responding');
    console.log(`   Error: ${portResult.error}`);
    console.log(`   Code: ${portResult.code}`);

    console.log('');
    console.log('Test 2: Checking what\'s using port...');
    const portUsage = await checkPortUsage();

    if (portUsage.error) {
      console.log('❌ Could not check port usage:', portUsage.error);
    } else if (portUsage.hasProcesses) {
      console.log('⚠️  Port is in use by:');
      console.log(portUsage.output);
    } else {
      console.log('✅ Port is available (no processes found)');
      console.log('💡 This suggests the server is not running');
    }
  }

  console.log('');
  console.log('Test 3: Checking MongoDB connection...');
  const mongoResult = await checkMongoDB();

  if (mongoResult.success) {
    console.log('✅ MongoDB is accessible');
  } else {
    console.log('❌ MongoDB connection failed');
    console.log(`   Error: ${mongoResult.error}`);
  }

  console.log('');
  console.log('Summary:');
  console.log('========');

  if (portResult.success) {
    console.log('✅ Server is running and responding');
    console.log('💡 The issue is likely in the application logic, not connectivity');
  } else {
    console.log('❌ Server is not running or not responding');
    console.log('💡 Start the backend server with: npm run dev (backend)');
    console.log('💡 Or check if another process is using port 5000');
  }

  if (!mongoResult.success) {
    console.log('❌ MongoDB connection issues detected');
    console.log('💡 Check your MongoDB connection string and network');
  }

  console.log('');
  console.log('Next Steps:');
  console.log('- If server is not running: npm run dev (in backend directory)');
  console.log('- If port is in use: kill the process or change PORT in .env');
  console.log('- If MongoDB fails: check MONGO_URL and network connectivity');
}

runDiagnostics().catch(console.error);