import mongoose from "mongoose";
import dotenv from "dotenv";
import Dish from "../models/Dish.js";
import SubCategory from "../models/SubCategory.js";
import Category from "../models/category.model.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

const updateDishesWithSubcategories = async () => {
  try {
    await connectDB();

    // Get all categories
    const categories = await Category.find();
    console.log(`Found ${categories.length} categories`);

    // Get all subcategories with their parent categories
    const subCategories = await SubCategory.find().populate("category");
    console.log(`Found ${subCategories.length} subcategories`);

    // Get all dishes
    const dishes = await Dish.find();
    console.log(`Found ${dishes.length} dishes\n`);

    let updated = 0;
    let skipped = 0;

    // For each dish, try to find and assign its subcategory
    for (const dish of dishes) {
      // If dish already has a subcategory, skip
      if (dish.subCategory) {
        console.log(`✓ Skipping "${dish.name}" - already has subcategory`);
        skipped++;
        continue;
      }

      // If dish has a category but no subcategory, try to find a matching subcategory
      if (dish.category) {
        const category = await Category.findById(dish.category);
        if (!category) {
          console.log(`✗ Skipping "${dish.name}" - category not found`);
          skipped++;
          continue;
        }

        // Find the first subcategory for this category
        const subCategory = await SubCategory.findOne({ category: dish.category });
        
        if (subCategory) {
          dish.subCategory = subCategory._id;
          await dish.save();
          console.log(
            `✓ Updated "${dish.name}" - assigned to subcategory "${subCategory.name}"`
          );
          updated++;
        } else {
          console.log(
            `✗ Skipping "${dish.name}" - no subcategory found for category "${category.name}"`
          );
          skipped++;
        }
      } else {
        console.log(`✗ Skipping "${dish.name}" - no category assigned`);
        skipped++;
      }
    }

    console.log(`\n--- Update Summary ---`);
    console.log(`Total dishes: ${dishes.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error updating dishes:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

updateDishesWithSubcategories();
