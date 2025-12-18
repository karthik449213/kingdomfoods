import mongoose from "mongoose";
import dotenv from "dotenv";
import Dish from "./models/Dish.js";

dotenv.config();

async function findSimilarDishes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB\n");

    // Search for dishes with "Sapota" and "Banana" in the name
    const pattern = /sapota.*banana|banana.*sapota/i;
    const dishes = await Dish.find({ name: pattern });

    if (dishes.length > 0) {
      console.log("🔍 Found similar dishes:\n");
      dishes.forEach(dish => {
        console.log(`  • ${dish.name} (ID: ${dish._id})`);
      });
    } else {
      console.log("✗ No dishes found with 'Sapota' and 'Banana'");
      
      // Show all dishes with Sapota
      console.log("\n📍 Dishes with 'Sapota':");
      const saplotaDishes = await Dish.find({ name: /sapota/i });
      saplotaDishes.forEach(dish => {
        console.log(`  • ${dish.name}`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
}

findSimilarDishes();
