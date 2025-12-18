import mongoose from "mongoose";
import dotenv from "dotenv";
import Dish from "./models/Dish.js";
import SubCategory from "./models/SubCategory.js";

dotenv.config();

async function manuallyLinkDish() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB\n");

    // Find the Sapota + Banana dish - with flexible matching
    const dishVariations = [
      "Sapota + Banana Milkshake",
      "Sapota Banana Milkshake",
      "Sapota+Banana Milkshake",
      "Sapota & Banana Milkshake",
    ];

    let dish = null;
    for (const variation of dishVariations) {
      dish = await Dish.findOne({ name: new RegExp(`^${variation}$`, "i") });
      if (dish) {
        console.log(`✓ Found dish: ${dish.name}`);
        break;
      }
    }

    if (!dish) {
      // Try partial match
      dish = await Dish.findOne({ name: /sapota.*banana/i });
      if (dish) {
        console.log(`✓ Found dish (partial match): ${dish.name}`);
      }
    }

    if (!dish) {
      console.log("✗ Dish not found");
      
      // Show all Sapota dishes
      const saplotaDishes = await Dish.find({ name: /sapota/i });
      console.log("\nAvailable Sapota dishes:");
      saplotaDishes.forEach(d => {
        console.log(`  • ${d.name}`);
      });
      process.exit(1);
    }

    // Get Ice Cream Milk Shakes subcategory
    const subCategory = await SubCategory.findOne({ slug: "ice-cream-milk-shakes" });
    if (!subCategory) {
      console.log("✗ Ice Cream Milk Shakes subcategory not found");
      process.exit(1);
    }

    // Link the dish
    await Dish.findByIdAndUpdate(dish._id, { subCategory: subCategory._id });
    console.log(`✓ Linked "${dish.name}" to "Ice Cream Milk Shakes"`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
}

manuallyLinkDish();
