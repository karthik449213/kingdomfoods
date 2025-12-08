import mongoose from "mongoose";
import Dish from "./models/Dish.js";
import dotenv from "dotenv";

dotenv.config();

async function deleteAllDishes() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/kingdomfoods");
    console.log("✓ MongoDB connected");

    const result = await Dish.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} dishes`);

    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
}

deleteAllDishes();
