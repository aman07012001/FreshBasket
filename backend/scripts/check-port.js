#!/usr/bin/env node

const { exec } = require('child_process');
const process = require('process');

const PORT = process.argv[2] || process.env.PORT || '5000';

console.log(`🔍 Checking for processes using port ${PORT}...\n`);

const command = process.platform === 'win32' 
  ? `netstat -ano | findstr :${PORT}`
  : `lsof -i :${PORT}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Failed to check port usage: ${error.message}`);
    process.exit(1);
  }

  if (stdout) {
    console.log(`✅ Found processes using port ${PORT}:`);
    console.log(stdout);

    if (process.platform === 'win32') {
      const lines = stdout.trim().split('\n');
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[4];
          console.log(`\n🔍 Getting details for PID ${pid}:`);

          exec(`tasklist /FI "PID eq ${pid}"`, (err, taskOutput) => {
            if (err) {
              console.log(`Could not get details for PID ${pid}`);
              return;
            }
            console.log(taskOutput);

            console.log(`\n💡 To kill this process, run: taskkill /PID ${pid} /F`);
          });
        }
      });
    } else {
      console.log('💡 To kill a process, run: kill -9 <PID>');
    }
  } else {
    console.log(`✅ No processes found using port ${PORT}`);
    console.log('💡 Port is available for use');
  }
});