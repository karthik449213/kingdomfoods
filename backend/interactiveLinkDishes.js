import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import Dish from "./models/Dish.js";
import SubCategory from "./models/SubCategory.js";
import Category from "./models/category.model.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function interactiveLinkDishes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB\n");

    // Step 1: Get all categories
    const categories = await Category.find();
    if (categories.length === 0) {
      console.log("✗ No categories found. Please create categories first.");
      process.exit(1);
    }

    console.log("📁 Available Categories:");
    categories.forEach((cat, i) => {
      console.log(`  ${i + 1}. ${cat.name} (ID: ${cat._id})`);
    });

    // Step 2: Get or create subcategories
    console.log("\n📂 Fetching subcategories...");
    const subcategories = await SubCategory.find().populate("category");
    
    if (subcategories.length === 0) {
      console.log("⚠️  No subcategories found. Creating them now...\n");
      
      // Create default subcategories
      const freshJuices = categories.find(c => c.name === "Fresh Juices");
      const milkShakes = categories.find(c => c.name === "Milk Shakes");

      if (!freshJuices || !milkShakes) {
        console.log("✗ Please create 'Fresh Juices' and 'Milk Shakes' categories first.");
        process.exit(1);
      }

      const newSubcats = await SubCategory.insertMany([
        {
          name: "Juices",
          slug: "juices",
          category: freshJuices._id,
          image: "https://via.placeholder.com/300?text=Juices"
        },
        {
          name: "Mix Fruit Blend",
          slug: "mix-fruit-blend",
          category: freshJuices._id,
          image: "https://via.placeholder.com/300?text=Mix+Fruit"
        },
        {
          name: "Fruit Milk Shakes",
          slug: "fruit-milk-shakes",
          category: milkShakes._id,
          image: "https://via.placeholder.com/300?text=Milk+Shakes"
        }
      ]);

      console.log("✓ Created 3 subcategories\n");
      subcategories.push(...newSubcats);
    }

    console.log("📂 Available Subcategories:\n");
    subcategories.forEach((sub, i) => {
      const category = sub.category?.name || "Unknown";
      console.log(`  ${i + 1}. ${sub.name} (under ${category})`);
      console.log(`     ID: ${sub._id}\n`);
    });

    // Step 3: Interactive linking
    let continueLoop = true;
    
    while (continueLoop) {
      console.log("\n" + "=".repeat(60));
      console.log("LINK DISHES TO SUBCATEGORY");
      console.log("=".repeat(60));

      const subIndex = await question(
        "\nEnter subcategory number (1-" + subcategories.length + ") or 'q' to quit: "
      );

      if (subIndex.toLowerCase() === "q") {
        continueLoop = false;
        break;
      }

      const idx = parseInt(subIndex) - 1;
      if (idx < 0 || idx >= subcategories.length) {
        console.log("✗ Invalid selection");
        continue;
      }

      const selectedSubcategory = subcategories[idx];
      console.log(
        `\n✓ Selected: ${selectedSubcategory.name} (${selectedSubcategory._id})`
      );

      // Show current dishes in this subcategory
      const currentDishes = await Dish.find({ subCategory: selectedSubcategory._id }).select("name price");
      if (currentDishes.length > 0) {
        console.log(`\n📊 Current dishes in this subcategory (${currentDishes.length}):`);
        currentDishes.slice(0, 5).forEach((d) => {
          console.log(`   • ${d.name} - ₹${d.price}`);
        });
        if (currentDishes.length > 5) {
          console.log(`   ... and ${currentDishes.length - 5} more`);
        }
      }

      // Get dish names from user
      console.log("\n📝 Enter dish names to link to this subcategory.");
      console.log("   (Separate multiple dishes with commas or press Enter one by one)");
      console.log("   Example: Mango Juice, Apple Juice, Orange Juice");
      console.log("   or just: Mango Juice\n");

      const dishInput = await question("Enter dish names: ");
      
      if (!dishInput.trim()) {
        console.log("⊘ No dishes entered, skipping...");
        continue;
      }

      // Parse dish names
      const dishNames = dishInput
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      console.log(`\n🔍 Searching for ${dishNames.length} dishes...`);

      // Link dishes
      let linkedCount = 0;
      const results = [];

      for (const dishName of dishNames) {
        // Try exact match first (case-insensitive)
        let dish = await Dish.findOne({ name: new RegExp(`^${dishName}$`, "i") });
        
        // If no exact match, try fuzzy match
        if (!dish) {
          // Remove special characters and extra spaces for fuzzy matching
          const cleanName = dishName.replace(/[^\w\s]/g, "").trim();
          dish = await Dish.findOne({
            name: new RegExp(cleanName.split(/\s+/).join(".*"), "i")
          });
        }

        if (dish) {
          await Dish.findByIdAndUpdate(dish._id, {
            subCategory: selectedSubcategory._id,
          });
          linkedCount++;
          results.push({ name: dishName, status: "✓ Linked", actual: dish.name });
        } else {
          results.push({ name: dishName, status: "✗ Not found" });
        }
      }

      // Show results
      console.log("\n📋 Results:");
      results.forEach((r) => {
        if (r.status.includes("✓")) {
          // Show actual dish name if fuzzy matched
          if (r.actual && r.actual !== r.name) {
            console.log(`   ${r.status}: "${r.name}" → "${r.actual}"`);
          } else {
            console.log(`   ${r.status}: ${r.name}`);
          }
        } else {
          console.log(`   ${r.status}: ${r.name}`);
        }
      });

      console.log(`\n✓ Successfully linked ${linkedCount}/${dishNames.length} dishes`);

      // Ask if continue
      const continueAnswer = await question("\nLink more dishes to subcategories? (y/n): ");
      if (continueAnswer.toLowerCase() !== "y") {
        continueLoop = false;
      }
    }

    // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("FINAL SUMMARY");
    console.log("=".repeat(60) + "\n");

    for (const sub of subcategories) {
      const count = await Dish.countDocuments({ subCategory: sub._id });
      console.log(`${sub.name}: ${count} dishes`);
    }

    const totalWithSub = await Dish.countDocuments({ subCategory: { $ne: null } });
    const totalWithoutSub = await Dish.countDocuments({ subCategory: null });
    const totalDishes = await Dish.countDocuments();

    console.log(`\n📊 Overall Statistics:`);
    console.log(`  Total dishes: ${totalDishes}`);
    console.log(`  Linked to subcategories: ${totalWithSub}`);
    console.log(`  Not linked: ${totalWithoutSub}`);

    await mongoose.disconnect();
    rl.close();
  } catch (error) {
    console.error("✗ Error:", error.message);
    rl.close();
    process.exit(1);
  }
}

interactiveLinkDishes();
