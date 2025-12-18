#!/usr/bin/env node

/**
 * Quick Setup Script
 * Creates test admin and sample categories
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import Category from './models/category.model.js';
import SubCategory from './models/SubCategory.js';
import bcrypt from 'bcryptjs';

async function setupDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Check if admin exists
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      console.log('\n📝 Creating test admin account...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        username: 'admin',
        password: hashedPassword
      });
      console.log('✓ Admin created - username: admin, password: admin123');
    } else {
      console.log('✓ Admin account already exists');
    }

    // Check if categories exist
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('\n📝 Creating sample categories...');
      const categories = await Category.insertMany([
        {
          name: 'Fresh Juices',
          slug: 'fresh-juices',
          image: 'https://via.placeholder.com/300x200?text=Fresh+Juices',
          hidden: false
        },
        {
          name: 'Shakes',
          slug: 'shakes',
          image: 'https://via.placeholder.com/300x200?text=Shakes',
          hidden: false
        },
        {
          name: 'Smoothies',
          slug: 'smoothies',
          image: 'https://via.placeholder.com/300x200?text=Smoothies',
          hidden: false
        }
      ]);
      console.log(`✓ Created ${categories.length} sample categories`);

      // Create sample subcategories
      console.log('\n📝 Creating sample subcategories...');
      const freshJuicesCat = categories[0];
      const subCategories = await SubCategory.insertMany([
        {
          name: 'Fruit Juices',
          slug: 'fruit-juices',
          image: 'https://via.placeholder.com/300x200?text=Fruit+Juices',
          category: freshJuicesCat._id,
          hidden: false
        },
        {
          name: 'Mix Fruit Blend',
          slug: 'mix-fruit-blend',
          image: 'https://via.placeholder.com/300x200?text=Mix+Fruit+Blend',
          category: freshJuicesCat._id,
          hidden: false
        }
      ]);
      console.log(`✓ Created ${subCategories.length} sample subcategories`);
    } else {
      console.log(`✓ Database already has ${categoryCount} categories`);
    }

    console.log('\n✅ Setup complete!');
    console.log('\n📌 Next steps:');
    console.log('1. Login to admin panel at http://localhost:5173/admin/login');
    console.log('2. Use credentials: admin / admin123');
    console.log('3. Add, edit, or delete categories and subcategories');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

setupDatabase();
