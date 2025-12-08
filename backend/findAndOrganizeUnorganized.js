import mongoose from "mongoose";
import dotenv from "dotenv";
import Dish from "./models/Dish.js";
import SubCategory from "./models/SubCategory.js";
import Category from "./models/category.model.js";

dotenv.config();

async function findUnorganizedDishes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Get all unorganized dishes
    const unorganized = await Dish.find({ subCategory: null });
    console.log(`\n📊 Found ${unorganized.length} unorganized dishes\n`);
    
    if (unorganized.length > 0) {
      console.log("Unorganized dishes:");
      unorganized.forEach((dish, index) => {
        console.log(`${index + 1}. ${dish.name} - ₹${dish.price}`);
      });
    }

    // Get existing categories and subcategories
    const freshJuices = await Category.findOne({ name: "Fresh Juices" });
    const milkShakes = await Category.findOne({ name: "Milk Shakes" });
    
    const singleFruit = await SubCategory.findOne({ slug: "single-fruit-juices" });
    const mixFruit = await SubCategory.findOne({ slug: "mix-fruit-blends" });
    const milkShakesSub = await SubCategory.findOne({ slug: "fruit-milk-shakes" });

    console.log("\n✓ Existing categories and subcategories found");

    // Keywords for automatic categorization
    const singleFruitKeywords = ["juice", "mango", "apple", "orange", "mosambi", "grape", "watermelon", "muskmelon", 
                                  "papaya", "pomegranate", "pineapple", "kiwi", "dragon", "strawberry", "carrot", "beet", "abc", "ginger"];
    const mixFruitKeywords = ["blend", "mix", "detox", "immunity", "refreshing", "tropical", "cooler", "sunrise", "harmony", "breeze", "maramari", "vegetable"];
    const milkShakeKeywords = ["milkshake", "milk shake", "shake", "avocado", "sithaphal", "sapota", "banana", "coconut", "tender"];

    let singleFruitCount = 0;
    let mixFruitCount = 0;
    let milkShakeCount = 0;

    // Organize unorganized dishes based on keywords
    for (const dish of unorganized) {
      const nameLower = dish.name.toLowerCase();
      let organized = false;

      if (singleFruitKeywords.some(keyword => nameLower.includes(keyword))) {
        await Dish.findByIdAndUpdate(dish._id, { subCategory: singleFruit._id });
        singleFruitCount++;
        organized = true;
      } else if (mixFruitKeywords.some(keyword => nameLower.includes(keyword))) {
        await Dish.findByIdAndUpdate(dish._id, { subCategory: mixFruit._id });
        mixFruitCount++;
        organized = true;
      } else if (milkShakeKeywords.some(keyword => nameLower.includes(keyword))) {
        await Dish.findByIdAndUpdate(dish._id, { subCategory: milkShakesSub._id });
        milkShakeCount++;
        organized = true;
      }
    }

    // Verify results
    const stats = await Promise.all([
      Dish.countDocuments({ subCategory: singleFruit._id }),
      Dish.countDocuments({ subCategory: mixFruit._id }),
      Dish.countDocuments({ subCategory: milkShakesSub._id }),
      Dish.countDocuments({ subCategory: null })
    ]);

    console.log("\n✓ Organization complete!");
    console.log(`  Single Fruit Juices: ${stats[0]} dishes (newly organized: ${singleFruitCount})`);
    console.log(`  Mix Fruit Blends: ${stats[1]} dishes (newly organized: ${mixFruitCount})`);
    console.log(`  Fruit Milk Shakes: ${stats[2]} dishes (newly organized: ${milkShakeCount})`);
    console.log(`  Still Unorganized: ${stats[3]} dishes`);
    console.log(`  ─────────────────────`);
    console.log(`  Total: ${stats[0] + stats[1] + stats[2] + stats[3]} dishes`);

    // Show remaining unorganized dishes if any
    if (stats[3] > 0) {
      const remaining = await Dish.find({ subCategory: null });
      console.log(`\n⚠️  Remaining unorganized dishes:`);
      remaining.forEach((dish, index) => {
        console.log(`${index + 1}. ${dish.name}`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
}

findUnorganizedDishes();
