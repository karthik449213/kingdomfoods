#!/usr/bin/env node

/**
 * Quick Database Setup
 * Creates test categories and subcategories
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Category from './models/category.model.js';
import SubCategory from './models/SubCategory.js';

async function populateDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing categories and subcategories...');
    await Category.deleteMany({});
    await SubCategory.deleteMany({});
    console.log('✓ Cleared\n');

    // Create categories
    console.log('📝 Creating sample categories...');
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
    console.log(`✓ Created ${categories.length} categories\n`);

    // Create subcategories
    console.log('📝 Creating sample subcategories...');
    const subCategories = await SubCategory.insertMany([
      {
        name: 'Tropical Juices',
        slug: 'tropical-juices',
        image: 'https://via.placeholder.com/300x200?text=Tropical+Juices',
        category: categories[0]._id,
        hidden: false
      },
      {
        name: 'Citrus Juices',
        slug: 'citrus-juices',
        image: 'https://via.placeholder.com/300x200?text=Citrus+Juices',
        category: categories[0]._id,
        hidden: false
      },
      {
        name: 'Fruit Shakes',
        slug: 'fruit-shakes',
        image: 'https://via.placeholder.com/300x200?text=Fruit+Shakes',
        category: categories[1]._id,
        hidden: false
      },
      {
        name: 'Protein Shakes',
        slug: 'protein-shakes',
        image: 'https://via.placeholder.com/300x200?text=Protein+Shakes',
        category: categories[1]._id,
        hidden: false
      }
    ]);
    console.log(`✓ Created ${subCategories.length} subcategories\n`);

    console.log('✅ Database populated successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Subcategories: ${subCategories.length}`);
    console.log('\n💡 Now refresh your admin page to see the data!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

populateDatabase();
