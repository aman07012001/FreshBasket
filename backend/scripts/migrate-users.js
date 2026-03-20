#!/usr/bin/env node

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const { env } = require('../config');

async function main() {
  const usersJsonPath = path.join(__dirname, '..', 'data', 'users.json');

  console.log('🚀 Starting user migration');
  console.log('Using Mongo URL:', env.MONGO_URL);

  await mongoose.connect(env.MONGO_URL);

  let raw;
  try {
    raw = fs.readFileSync(usersJsonPath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('No users.json file found, nothing to migrate.');
      await mongoose.disconnect();
      return;
    }
    throw err;
  }

  let users;
  try {
    users = JSON.parse(raw || '[]');
    if (!Array.isArray(users)) {
      console.error('users.json must contain an array of users');
      process.exitCode = 1;
      await mongoose.disconnect();
      return;
    }
  } catch (err) {
    console.error('Failed to parse users.json:', err.message);
    process.exitCode = 1;
    await mongoose.disconnect();
    return;
  }

  let migrated = 0;
  let skipped = 0;
  const conflicts = [];

  for (const entry of users) {
    try {
      if (!entry || !entry.email) {
        skipped += 1;
        continue;
      }

      const email = String(entry.email).trim().toLowerCase();
      if (!email) {
        skipped += 1;
        continue;
      }

      const existing = await User.findOne({ email });
      if (existing) {
        conflicts.push({ email, reason: 'User already exists in Mongo' });
        continue;
      }

      const now = new Date();

      const doc = new User({
        name: entry.name || email.split('@')[0],
        email,
        passwordHash: entry.password || entry.passwordHash || '',
        role: entry.role === 'admin' ? 'admin' : 'user',
        emailVerified: Boolean(entry.emailVerified),
        failedLoginCount: Number(entry.failedLoginCount || 0),
        lockUntil: entry.lockUntil ? new Date(entry.lockUntil) : undefined,
        createdAt: entry.createdAt ? new Date(entry.createdAt) : now,
        updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : now,
      });

      await doc.save();
      migrated += 1;
    } catch (err) {
      console.error('Failed to migrate user entry:', entry && entry.email, err.message);
      skipped += 1;
    }
  }

  console.log(`✅ Migration complete. Migrated: ${migrated}, skipped: ${skipped}`);
  if (conflicts.length > 0) {
    console.log('Conflicts (users already present in MongoDB):');
    for (const c of conflicts) {
      console.log(` - ${c.email}: ${c.reason}`);
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed with error:', err);
  process.exitCode = 1;
});
