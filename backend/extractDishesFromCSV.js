import fs from "fs";
import path from "path";
import readline from "readline";
import { parse } from "csv-parse/sync";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function extractDishesFromCSV() {
  try {
    // Read CSV file
    const csvPath = "./h.csv";
    if (!fs.existsSync(csvPath)) {
      console.log("✗ h.csv file not found in current directory");
      process.exit(1);
    }

    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`✓ Read ${records.length} dishes from h.csv\n`);

    // Group by category
    const byCategory = {};
    const categories = new Set();

    records.forEach((record) => {
      const category = record.category?.trim();
      const subcategory = record.subcategory?.trim();
      const name = record.name?.trim();

      if (category && subcategory && name) {
        categories.add(category);

        if (!byCategory[category]) {
          byCategory[category] = {};
        }
        if (!byCategory[category][subcategory]) {
          byCategory[category][subcategory] = [];
        }
        byCategory[category][subcategory].push(name);
      }
    });

    const categoryList = Array.from(categories).sort();

    console.log("📁 Available Categories:\n");
    categoryList.forEach((cat, i) => {
      const subCount = Object.keys(byCategory[cat]).length;
      const dishCount = Object.values(byCategory[cat]).reduce(
        (sum, dishes) => sum + dishes.length,
        0
      );
      console.log(
        `  ${i + 1}. ${cat} (${subCount} subcategories, ${dishCount} dishes)`
      );
    });

    // Select category
    console.log("\n");
    const catIndex = await question(
      `Enter category number (1-${categoryList.length}): `
    );

    const selectedCategory = categoryList[parseInt(catIndex) - 1];
    if (!selectedCategory) {
      console.log("✗ Invalid category selection");
      process.exit(1);
    }

    console.log(`\n✓ Selected: ${selectedCategory}\n`);

    // Show subcategories
    const subcategoryList = Object.keys(byCategory[selectedCategory]).sort();

    console.log("📂 Available Subcategories:\n");
    subcategoryList.forEach((subcat, i) => {
      const dishCount = byCategory[selectedCategory][subcat].length;
      console.log(`  ${i + 1}. ${subcat} (${dishCount} dishes)`);
    });

    // Select subcategory
    console.log("\n");
    const subIndex = await question(
      `Enter subcategory number (1-${subcategoryList.length}): `
    );

    const selectedSubcategory = subcategoryList[parseInt(subIndex) - 1];
    if (!selectedSubcategory) {
      console.log("✗ Invalid subcategory selection");
      process.exit(1);
    }

    console.log(`\n✓ Selected: ${selectedSubcategory}\n`);

    // Get dishes
    const dishes =
      byCategory[selectedCategory][selectedSubcategory] || [];

    console.log("📋 Dishes:\n");
    dishes.forEach((dish, i) => {
      console.log(`  ${i + 1}. ${dish}`);
    });

    // Output as comma-separated
    console.log("\n" + "=".repeat(80));
    console.log("📝 COMMA-SEPARATED DISH NAMES (Ready to copy-paste):\n");
    const commaList = dishes.join(", ");
    console.log(commaList);
    console.log("\n" + "=".repeat(80));

    // Save to file
    const outputFile = `${selectedCategory}_${selectedSubcategory}.txt`;
    fs.writeFileSync(outputFile, commaList);
    console.log(`\n✓ Saved to file: ${outputFile}`);

    // Summary
    console.log("\n✓ Summary:");
    console.log(`  Category: ${selectedCategory}`);
    console.log(`  Subcategory: ${selectedSubcategory}`);
    console.log(`  Total dishes: ${dishes.length}`);
    console.log(`\nNow you can copy the comma-separated list above and paste it`);
    console.log(`into the interactive linking script: node interactiveLinkDishes.js`);

    rl.close();
  } catch (error) {
    console.error("✗ Error:", error.message);
    rl.close();
    process.exit(1);
  }
}

extractDishesFromCSV();
