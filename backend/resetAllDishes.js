import mongoose from "mongoose";
import dotenv from "dotenv";
import Dish from "./models/Dish.js";
import SubCategory from "./models/SubCategory.js";

dotenv.config();

async function resetAllDishes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Remove all subcategories from all dishes
    const result = await Dish.updateMany({}, { subCategory: null });
    console.log(`✓ Reset ${result.modifiedCount} dishes - removed all subcategories`);

    // Delete all subcategories
    const subCatResult = await SubCategory.deleteMany({});
    console.log(`✓ Deleted ${subCatResult.deletedCount} subcategories`);

    // Verify all dishes are now standalone
    const totalDishes = await Dish.countDocuments();
    const withoutSubcat = await Dish.countDocuments({ subCategory: null });

    console.log("\n✓ Reset complete!");
    console.log(`  Total dishes: ${totalDishes}`);
    console.log(`  Dishes without subcategories: ${withoutSubcat}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
}

resetAllDishes();
