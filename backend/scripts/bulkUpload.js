import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CSV to Dishes JSON Converter
 * Converts CSV file to JSON format for bulk upload
 */

function parseCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const lines = fileContent.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error("CSV file must have header and at least one data row");
  }

  // Parse header
  const header = lines[0]
    .split(",")
    .map((col) => col.trim())
    .filter((col) => col);

  const dishes = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((val) => val.trim());

    if (values.length === 0 || (values.length === 1 && values[0] === "")) continue;

    const dish = {};
    header.forEach((col, idx) => {
      dish[col] = values[idx] || "";
    });

    dishes.push(dish);
  }

  return dishes;
}

/**
 * Upload dishes to backend bulk upload endpoint
 */
async function uploadDishes(dishes, apiUrl, token) {
  try {
    console.log(`\n📤 Uploading ${dishes.length} dishes to ${apiUrl}...`);
    console.log("━".repeat(60));

    const response = await axios.post(apiUrl, { dishes }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: 300000, // 5 minute timeout
    });

    const { results } = response.data;

    console.log(`\n✅ Upload Complete!`);
    console.log(`✓ Success: ${results.success.length}`);
    console.log(`✗ Failed: ${results.failed.length}`);

    if (results.failed.length > 0) {
      console.log("\n⚠️  Failed Dishes:");
      results.failed.forEach((item) => {
        console.log(`  • ${item.dish}: ${item.error}`);
      });
    }

    if (results.success.length > 0) {
      console.log("\n📋 Successfully Uploaded:");
      results.success.slice(0, 10).forEach((item) => {
        console.log(`  ✓ ${item.dish}`);
      });
      if (results.success.length > 10) {
        console.log(`  ... and ${results.success.length - 10} more`);
      }
    }

    return results;
  } catch (error) {
    if (error.response) {
      console.error("❌ Server Error:", error.response.data);
    } else if (error.request) {
      console.error("❌ Network Error: No response from server");
      console.error("Make sure the backend is running!");
    } else {
      console.error("❌ Error:", error.message);
    }
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Configuration
    const CSV_FILE = process.argv[2] || "d:\\kin\\kkk.csv.csv";
    const API_URL = process.argv[3] || "http://localhost:5000/menu/bulk/upload";
    const TOKEN = process.argv[4] || "your-jwt-token-here";

    console.log("🚀 CSV Bulk Upload Tool");
    console.log("━".repeat(60));
    console.log(`CSV File: ${CSV_FILE}`);
    console.log(`API URL: ${API_URL}`);
    console.log("━".repeat(60));

    // Check if file exists
    if (!fs.existsSync(CSV_FILE)) {
      throw new Error(`CSV file not found: ${CSV_FILE}`);
    }

    // Parse CSV
    console.log("\n📖 Parsing CSV file...");
    const dishes = parseCSV(CSV_FILE);
    console.log(`✓ Found ${dishes.length} dishes`);

    // Display first few items
    console.log("\n📋 Sample dishes:");
    dishes.slice(0, 3).forEach((dish, idx) => {
      console.log(`  ${idx + 1}. ${dish.name || "N/A"} - ${dish.category || "N/A"}`);
    });

    // Upload
    await uploadDishes(dishes, API_URL, TOKEN);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
