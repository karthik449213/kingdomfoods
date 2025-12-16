#!/usr/bin/env node

/**
 * 🌱 Database Seeding Script
 * This script uploads sample data from h.csv to your MongoDB
 * Usage: npm run seed
 */

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const CSV_FILE = path.join(process.cwd(), 'h.csv');

// Parse CSV
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx];
    });
    data.push(row);
  }
  return data;
}

async function seed() {
  try {
    console.log('\n🌱 Starting Database Seed...\n');

    // Step 1: Get or create admin token
    console.log('📝 Checking authentication...');
    let token;
    
    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@kingdom.com',
        password: 'Admin@123'
      });
      token = loginRes.data.token;
      console.log('✓ Admin logged in');
    } catch (loginErr) {
      console.log('Admin not found, creating account...');
      try {
        const registerRes = await axios.post(`${API_URL}/auth/register`, {
          name: 'Admin',
          email: 'admin@kingdom.com',
          password: 'Admin@123'
        });
        token = registerRes.data.token;
        console.log('✓ Admin account created');
      } catch (registerErr) {
        console.error('❌ Failed to create admin:', registerErr.response?.data || registerErr.message);
        console.error('Full error:', registerErr);
        process.exit(1);
      }
    }

    // Step 2: Parse CSV
    console.log('\n📄 Parsing CSV file...');
    if (!fs.existsSync(CSV_FILE)) {
      console.error(`❌ CSV file not found: ${CSV_FILE}`);
      process.exit(1);
    }
    
    const dishes = parseCSV(CSV_FILE);
    console.log(`✓ Found ${dishes.length} dishes in CSV`);

    // Step 3: Get/create categories and subcategories
    console.log('\n🏷️  Creating categories and subcategories...');
    
    const categories = new Map();
    const subcategories = new Map();

    for (const dish of dishes) {
      const catName = dish.category || 'Uncategorized';
      const subName = dish.subcategory || 'General';

      if (!categories.has(catName)) {
        try {
          const catRes = await axios.post(
            `${API_URL}/menu/categories`,
            { 
              name: catName,
              image: 'https://via.placeholder.com/300'
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          categories.set(catName, catRes.data._id);
          console.log(`  ✓ Created category: ${catName}`);
        } catch (err) {
          console.warn(`  ⚠ Category ${catName} might exist:`, err.response?.data?.message);
          // Try to fetch existing category
          try {
            const catListRes = await axios.get(`${API_URL}/menu/categories`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const existing = catListRes.data.find(c => c.name === catName);
            if (existing) {
              categories.set(catName, existing._id);
              console.log(`  ✓ Using existing category: ${catName}`);
            }
          } catch (e) {
            console.error(`  ❌ Failed to find category ${catName}`);
          }
        }
      }

      if (categories.has(catName) && !subcategories.has(subName)) {
        try {
          const subRes = await axios.post(
            `${API_URL}/menu/subcategories`,
            {
              name: subName,
              category: categories.get(catName),
              image: 'https://via.placeholder.com/300'
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          subcategories.set(subName, subRes.data._id);
          console.log(`  ✓ Created subcategory: ${subName}`);
        } catch (err) {
          console.warn(`  ⚠ Subcategory ${subName} might exist:`, err.response?.data?.message);
          // Try to fetch existing subcategory
          try {
            const subListRes = await axios.get(`${API_URL}/menu/subcategories`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const existing = subListRes.data.find(s => s.name === subName);
            if (existing) {
              subcategories.set(subName, existing._id);
              console.log(`  ✓ Using existing subcategory: ${subName}`);
            }
          } catch (e) {
            console.error(`  ❌ Failed to find subcategory ${subName}`);
          }
        }
      }
    }

    // Step 4: Upload dishes
    console.log('\n🍷 Uploading dishes...');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < dishes.length; i++) {
      const dish = dishes[i];
      const catId = categories.get(dish.category);
      const subId = subcategories.get(dish.subcategory);

      if (!catId || !subId) {
        console.warn(`⚠ Skipping "${dish.name}" - missing category/subcategory`);
        errorCount++;
        continue;
      }

      try {
        const form = new FormData();
        form.append('name', dish.name || 'Unknown');
        form.append('price', dish.price || 0);
        form.append('description', dish.description || '');
        form.append('category', catId);
        form.append('subCategory', subId);
        form.append('available', 'true');

        // Add placeholder image if no local file
        const imagePath = dish.image?.trim();
        if (imagePath && fs.existsSync(imagePath)) {
          form.append('image', fs.createReadStream(imagePath));
        } else {
          // Use a placeholder image URL
          const placeholderRes = await axios.get('https://via.placeholder.com/300', { responseType: 'stream' });
          form.append('image', placeholderRes.data);
        }

        await axios.post(
          `${API_URL}/menu/dishes`,
          form,
          { 
            headers: { 
              ...form.getHeaders(),
              Authorization: `Bearer ${token}`
            }
          }
        );

        successCount++;
        if ((i + 1) % 10 === 0) {
          console.log(`  ✓ Uploaded ${i + 1}/${dishes.length} dishes`);
        }
      } catch (err) {
        errorCount++;
        console.error(`  ❌ Failed to upload "${dish.name}":`, err.response?.data?.message || err.message);
      }
    }

    console.log(`\n✅ Seed Complete!`);
    console.log(`  ✓ Successfully uploaded: ${successCount} dishes`);
    if (errorCount > 0) {
      console.log(`  ⚠ Failed: ${errorCount} dishes`);
    }
    console.log(`\n🎉 Your database is now populated! Visit http://localhost:5173/menu\n`);

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
