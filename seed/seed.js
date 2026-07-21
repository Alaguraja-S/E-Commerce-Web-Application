// Populates the database with an admin user, a demo user, and sample products.
// Run with: npm run seed  (inside the server/ folder, after configuring .env)
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');

const sampleProducts = [
  { name: 'Wireless Headphones', description: 'Over-ear headphones with active noise cancellation.', price: 89.99, category: 'Electronics', stock: 25, imageUrl: '' },
  { name: 'Mechanical Keyboard', description: 'Compact 75% mechanical keyboard with hot-swappable switches.', price: 129.0, category: 'Electronics', stock: 15, imageUrl: '' },
  { name: 'Ceramic Coffee Mug', description: 'Hand-glazed 12oz mug, dishwasher safe.', price: 14.5, category: 'Home', stock: 60, imageUrl: '' },
  { name: 'Canvas Backpack', description: 'Water-resistant 20L daypack with laptop sleeve.', price: 54.0, category: 'Accessories', stock: 30, imageUrl: '' },
  { name: 'Yoga Mat', description: '6mm non-slip mat with carry strap.', price: 24.99, category: 'Fitness', stock: 40, imageUrl: '' },
  { name: 'Desk Lamp', description: 'Dimmable LED lamp with USB charging port.', price: 32.0, category: 'Home', stock: 20, imageUrl: '' }
];

async function run() {
  await connectDB();

  await Promise.all([User.deleteMany({}), Product.deleteMany({})]);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin1234',
    role: 'admin'
  });

  await User.create({
    name: 'Demo User',
    email: 'user@example.com',
    password: 'user1234',
    role: 'user'
  });

  await Product.insertMany(
    sampleProducts.map((p) => ({ ...p, createdBy: admin._id }))
  );

  console.log('Seed complete.');
  console.log('Admin login:  admin@example.com / admin1234');
  console.log('User login:   user@example.com / user1234');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
