import mongoose from "mongoose";

const DishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    stars: { type: Number, default: 0, min: 0, max: 5 },
    image: { type: String, required: true }, // Cloudinary URL
    imagePublicId: { type: String },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true },
  },
  { timestamps: true }
);

const Dish = mongoose.model("Dish", DishSchema);
export default Dish;
