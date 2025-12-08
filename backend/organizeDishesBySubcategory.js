import mongoose from "mongoose";
import dotenv from "dotenv";
import Dish from "./models/Dish.js";
import SubCategory from "./models/SubCategory.js";
import Category from "./models/category.model.js";

dotenv.config();

async function organizeDishesWithSubcategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Step 1: Get or create categories
    let freshJuices = await Category.findOne({ name: "Fresh Juices" });
    if (!freshJuices) {
      freshJuices = await Category.create({
        name: "Fresh Juices",
        slug: "fresh-juices",
        image: "https://via.placeholder.com/300?text=Fresh+Juices"
      });
      console.log("✓ Created Fresh Juices category");
    }

    let milkShakes = await Category.findOne({ name: "Milk Shakes" });
    if (!milkShakes) {
      milkShakes = await Category.create({
        name: "Milk Shakes",
        slug: "milk-shakes",
        image: "https://via.placeholder.com/300?text=Milk+Shakes"
      });
      console.log("✓ Created Milk Shakes category");
    }

    // Step 2: Create subcategories
    await SubCategory.deleteMany({}); // Clear old ones
    const subCategories = await SubCategory.insertMany([
      {
        name: "Single Fruit Juices",
        slug: "single-fruit-juices",
        category: freshJuices._id,
        image: "https://via.placeholder.com/300?text=Single+Fruit"
      },
      {
        name: "Mix Fruit Blends",
        slug: "mix-fruit-blends",
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
    console.log("✓ Created 3 subcategories");

    // Step 3: Define which dishes go into which subcategory
    const singleFruitDishes = [
      "Mango Juice", "Apple Juice", "Orange Juice", "Mosambi Juice",
      "Grape Juice", "Watermelon Juice", "Muskmelon Juice", "Papaya Juice",
      "Pomegranate Juice", "Pineapple Juice", "Kiwi Juice", "Dragon Fruit Juice",
      "Strawberry Juice", "Carrot Juice", "Beet root Juice", "ABC Juice",
      "ABC with Ginger", "Cocktail Special"
    ];

    const mixFruitDishes = [
      "Anarkali", "Kiwi Cooler", "Watermelon Sunrise", "Detox Blend",
      "Immunity Booster", "Maramari", "Vegetable Juice", "Refreshing Harmony",
      "Island Breeze", "Vitamin C", "Ganga Jamuna Saraswathi", "Ganga Jamuna",
      "Tropical Trio", "Pineapple Coconut Refresher", "Citrus Coconut Refresher",
      "Zero Size Drink", "CarrOnge"
    ];

    const milkShakeDishes = [
      "Apple Milkshake", "Avocado Milkshake", "Kiwi Milkshake", "Sithaphal Milkshake",
      "Mango Milkshake", "Kannur Cocktail Milkshake", "Dragon Fruit Milk shake",
      "Strawberry Milkshake", "Cocktail Milkshake", "Tender coconut milkshake",
      "Sapota Milkshake", "Muskmelon Milkshake", "Banana Milkshake", "Carrot Milkshake"
    ];

    // Step 4: Update dishes with subcategories
    await Dish.updateMany(
      { name: { $in: singleFruitDishes } },
      { subCategory: subCategories[0]._id }
    );
    console.log(`✓ Linked ${singleFruitDishes.length} dishes to Single Fruit Juices`);

    await Dish.updateMany(
      { name: { $in: mixFruitDishes } },
      { subCategory: subCategories[1]._id }
    );
    console.log(`✓ Linked ${mixFruitDishes.length} dishes to Mix Fruit Blends`);

    await Dish.updateMany(
      { name: { $in: milkShakeDishes } },
      { subCategory: subCategories[2]._id }
    );
    console.log(`✓ Linked ${milkShakeDishes.length} dishes to Fruit Milk Shakes`);

    // Step 5: Verify
    const stats = await Promise.all([
      Dish.countDocuments({ subCategory: subCategories[0]._id }),
      Dish.countDocuments({ subCategory: subCategories[1]._id }),
      Dish.countDocuments({ subCategory: subCategories[2]._id }),
      Dish.countDocuments({ subCategory: null })
    ]);

    console.log("\n✓ Organization complete!");
    console.log(`  Single Fruit Juices: ${stats[0]} dishes`);
    console.log(`  Mix Fruit Blends: ${stats[1]} dishes`);
    console.log(`  Fruit Milk Shakes: ${stats[2]} dishes`);
    console.log(`  Unorganized: ${stats[3]} dishes`);
    console.log(`  Total: ${stats[0] + stats[1] + stats[2] + stats[3]} dishes`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
}

organizeDishesWithSubcategories();
