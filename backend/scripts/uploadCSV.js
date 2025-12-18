#!/usr/bin/env node

/**
 * 🚀 QUICK START: CSV to Database Uploader
 * This script reads your CSV and uploads all dishes directly
 * 
 * Usage:
 *   npm run upload-csv -- <csv-file> <jwt-token> [api-url]
 * 
 * Example:
 *   npm run upload-csv -- "d:\kin\kkk.csv.csv" "eyJhbGciOiJIUzI1NiIs..." http://localhost:5000
 */

import fs from "fs";
import axios from "axios";

// Parse arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("\n❌ Usage: node uploadCSV.js <csv-file> <jwt-token> [api-url]\n");
  console.error("Example:");
  console.error('  node uploadCSV.js "d:\\kin\\kkk.csv.csv" "your-token" http://localhost:5000\n');
  process.exit(1);
}

const CSV_FILE = args[0];
const JWT_TOKEN = args[1];
const API_URL = (args[2] || "http://localhost:5000") + "/menu/bulk/upload";

console.log("\n🚀 CSV Bulk Upload Tool");
console.log("═".repeat(70));
console.log(`📄 CSV File: ${CSV_FILE}`);
console.log(`🔗 API URL: ${API_URL}`);
console.log("═".repeat(70));

// Step 1: Read and parse CSV
function parseCSV(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error("CSV must have at least a header and one data row");
    }

    // Parse header (handle extra spaces)
    const header = lines[0]
      .split(",")
      .map((h) => h.trim())
      .filter((h) => h);

    const dishes = [];

    // Parse rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (!values[0]) continue; // Skip empty rows

      const dish = {};
      header.forEach((col, idx) => {
        dish[col] = values[idx] || "";
      });

      if (dish.name && dish.price) {
        dishes.push(dish);
      }
    }

    return dishes;
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error.message}`);
  }
}

// Step 2: Upload to API
async function uploadToAPI(dishes) {
  try {
    console.log(`\n📤 Uploading ${dishes.length} dishes...`);
    console.log("⏳ This may take a few minutes depending on image sizes...\n");

    const response = await axios.post(API_URL, { dishes }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWT_TOKEN}`,
      },
      timeout: 600000, // 10 minute timeout
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("❌ Unauthorized! JWT token is invalid or expired");
    }
    if (error.response?.data) {
      throw new Error(`Server error: ${error.response.data.message}`);
    }
    throw error;
  }
}

// Step 3: Display results
function displayResults(results) {
  const { success, failed, totalProcessed } = results.results || results;

  console.log("\n✅ Upload Complete!");
  console.log("═".repeat(70));
  console.log(`📊 Total Processed: ${totalProcessed}`);
  console.log(`✓ Successful: ${success?.length || 0}`);
  console.log(`✗ Failed: ${failed?.length || 0}`);

  if (success && success.length > 0) {
    console.log("\n📋 Sample Uploaded Dishes:");
    success.slice(0, 5).forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.dish}`);
    });
    if (success.length > 5) {
      console.log(`  ... and ${success.length - 5} more`);
    }
  }

  if (failed && failed.length > 0) {
    console.log("\n⚠️  Failed Dishes:");
    failed.slice(0, 5).forEach((item) => {
      console.log(`  ✗ ${item.dish || "Unknown"}: ${item.error}`);
    });
    if (failed.length > 5) {
      console.log(`  ... and ${failed.length - 5} more errors`);
    }
  }

  console.log("\n" + "═".repeat(70));
}

// Main execution
async function main() {
  try {
    // Verify file exists
    if (!fs.existsSync(CSV_FILE)) {
      throw new Error(`File not found: ${CSV_FILE}`);
    }

    // Parse CSV
    console.log("\n📖 Parsing CSV file...");
    const dishes = parseCSV(CSV_FILE);
    console.log(`✓ Found ${dishes.length} valid dishes\n`);

    if (dishes.length === 0) {
      throw new Error("No valid dishes found in CSV (need name + price)");
    }

    // Show preview
    console.log("Preview of first 3 dishes:");
    dishes.slice(0, 3).forEach((d, idx) => {
      console.log(`  ${idx + 1}. ${d.name} - ₹${d.price}`);
    });
    console.log("");

    // Upload
    const response = await uploadToAPI(dishes);
    displayResults(response);

    console.log("🎉 All done! Check your database 🚀\n");
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Run
main();
