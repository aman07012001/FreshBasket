

'use strict';

require('dotenv').config({ path: '../.env' }); 

const mongoose = require('mongoose');
const Product  = require('../models/Product');

const STATIC_PRODUCTS = [
  {
    category: 'Meat',
    items: [
      { name: 'Chicken Meat', price: 8.99,  unit: 'kg', reviews: 4.2, reviewCount: 18, stock: 80 },
      { name: 'Crab Meat',    price: 14.99, unit: 'kg', reviews: 4.6, reviewCount: 20, stock: 35 },
      { name: 'Lamb Meat',    price: 12.99, unit: 'kg', reviews: 4.8, reviewCount: 32, stock: 30 },
    ],
  },
  {
    category: 'Vegetables',
    items: [
      { name: 'Tomato',   price: 2.99, unit: 'kg', reviews: 4.6, reviewCount: 22, stock: 120 },
      { name: 'Carrot',   price: 1.99, unit: 'kg', reviews: 4.3, reviewCount: 17, stock: 150 },
      { name: 'Spinach',  price: 3.99, unit: 'kg', reviews: 4.7, reviewCount: 28, stock: 90  },
      { name: 'Broccoli', price: 2.49, unit: 'kg', reviews: 4.4, reviewCount: 20, stock: 70  },
    ],
  },
  {
    category: 'Fruits',
    items: [
      { name: 'Apple',  price: 1.49, unit: 'kg', reviews: 4.2, reviewCount: 16, stock: 200 },
      { name: 'Banana', price: 0.99, unit: 'kg', reviews: 4.1, reviewCount: 14, stock: 250 },
      { name: 'Orange', price: 1.79, unit: 'kg', reviews: 4.3, reviewCount: 18, stock: 180 },
      { name: 'Grapes', price: 3.99, unit: 'kg', reviews: 4.5, reviewCount: 24, stock: 100 },
    ],
  },
  {
    category: 'Dairy',
    items: [
      { name: 'Milk',   price: 2.99, unit: 'ltr', reviews: 4.4, reviewCount: 19, stock: 300 },
      { name: 'Cheese', price: 4.99, unit: 'kg',  reviews: 4.8, reviewCount: 32, stock: 60  },
      { name: 'Yogurt', price: 1.99, unit: 'kg',  reviews: 4.2, reviewCount: 15, stock: 120 },
      { name: 'Butter', price: 3.49, unit: 'kg',  reviews: 4.6, reviewCount: 27, stock: 80  },
    ],
  },
  {
    category: 'Grains',
    items: [
      { name: 'Rice',   price: 4.99, unit: 'kg', reviews: 4.7, reviewCount: 23, stock: 200 },
      { name: 'Wheat',  price: 3.99, unit: 'kg', reviews: 4.5, reviewCount: 21, stock: 180 },
      { name: 'Oats',   price: 2.99, unit: 'kg', reviews: 4.3, reviewCount: 17, stock: 150 },
      { name: 'Barley', price: 3.49, unit: 'kg', reviews: 4.4, reviewCount: 19, stock: 130 },
    ],
  },
];

function buildProductDocs() {
  const docs = [];
  for (const group of STATIC_PRODUCTS) {
    for (const item of group.items) {
      docs.push({
        name:        item.name,
        price:       item.price,
        category:    group.category,
        stock:       item.stock,
        unit:        item.unit        || 'kg',
        reviews:     item.reviews     || 0,
        reviewCount: item.reviewCount || 0,
        img:         item.img         || '',
      });
    }
  }
  return docs;
}

async function seed() {
  const MONGO_URL = process.env.MONGO_URL;

  if (!MONGO_URL) {
    console.error('❌  MONGO_URL is not set in .env — aborting.');
    process.exit(1);
  }

  const forceWipe = process.argv.includes('--force');

  console.log('🌱  FreshBasket — Product Seeder');
  console.log('   Connecting to MongoDB…');

  await mongoose.connect(MONGO_URL, {
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  });

  console.log('✅  Connected to MongoDB');

  if (forceWipe) {
    const deleted = await Product.deleteMany({});
    console.log(`🗑   --force: deleted ${deleted.deletedCount} existing product(s).`);
  }

  const docs    = buildProductDocs();
  let inserted  = 0;
  let skipped   = 0;

  for (const doc of docs) {
    const exists = await Product.findOne({ name: doc.name, category: doc.category });

    if (exists) {
      console.log(`  ⏭   Skipped   [${doc.category}] ${doc.name}  (already exists)`);
      skipped++;
    } else {
      await Product.create(doc);
      console.log(`  ✅  Inserted  [${doc.category}] ${doc.name}  @ $${doc.price}`);
      inserted++;
    }
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`🌱  Seed complete!`);
  console.log(`    Inserted : ${inserted}`);
  console.log(`    Skipped  : ${skipped}`);
  console.log(`    Total    : ${docs.length}`);
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seeder failed:', err.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
