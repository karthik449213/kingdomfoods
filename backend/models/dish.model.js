import mongoose from "mongoose";

const DishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    stars: { type: Number, default: 5, min: 0, max: 5 },
    image: { type: String, required: false, default: null }, // Cloudinary URL - now optional
    imagePublicId: { type: String },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: false, default: null },
    // Optional category reference for standalone dishes (no subCategory)
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: false, default: null },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// PERFORMANCE: Add indexes for frequently queried fields
DishSchema.index({ subCategory: 1 });
DishSchema.index({ createdAt: -1 });

const Dish = mongoose.model("Dish", DishSchema);
export default Dish;
