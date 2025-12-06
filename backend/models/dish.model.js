import mongoose from "mongoose";

const DishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    stars: { type: Number, default: 0, min: 0, max: 5 },
    image: { type: String, required: true }, // Cloudinary URL
    imagePublicId: { type: String },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: false, default: null },
  },
  { timestamps: true }
);

// PERFORMANCE: Add indexes for frequently queried fields
DishSchema.index({ subCategory: 1 });
DishSchema.index({ createdAt: -1 });

const Dish = mongoose.model("Dish", DishSchema);
export default Dish;
