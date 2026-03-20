#!/usr/bin/env node

/**
 * Setup script for Grocery App Environment Variables
 * This script helps users configure their .env file
 */

import { existsSync } from 'fs';
import { join } from 'path';

console.log('=== Grocery App Environment Setup ===\n');

// Check if .env file already exists
const envPath = join(process.cwd(), 'backend', '.env');

if (existsSync(envPath)) {
  console.log('✓ Found existing .env file');
  console.log('  Location:', envPath);
  console.log('\nPlease verify the following required variables are properly configured:\n');
  
  const requiredVars = [
    'MONGO_URL',
    'JWT_SECRET',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
    'EMAIL_FROM'
  ];
  
  console.log('Required Environment Variables:');
  requiredVars.forEach((variable) => {
    console.log(`  - ${variable}`);
  });
  
  console.log('\nFor detailed setup instructions, please check SETUP_INSTRUCTIONS.md');
} else {
  console.log('✗ No .env file found in backend directory');
  console.log('\nPlease follow these steps:');
  console.log('1. Create a .env file in the backend directory');
  console.log('2. Copy the template from SETUP_INSTRUCTIONS.md');
  console.log('3. Replace placeholder values with your actual configuration');
  
  console.log('\nQuick MongoDB Setup Options:');
  console.log('1. MongoDB Atlas (cloud):');
  console.log('   - Visit https://www.mongodb.com/cloud/atlas');
  console.log('   - Sign up for a free account');
  console.log('   - Create a cluster and database user');
  
  console.log('\n2. Local MongoDB:');
  console.log('   - Install MongoDB Community Server');
  console.log('   - Start the MongoDB service');
  
  console.log('\nQuick Email Setup (Ethereal.email):');
  console.log('1. Visit https://ethereal.email');
  console.log('2. Click "Create Ethereal Account"');
  console.log('3. Save the generated credentials for your .env file');
  
  console.log('\nFor complete setup instructions, please check SETUP_INSTRUCTIONS.md');
}

console.log('\n=== End Setup Check ===');