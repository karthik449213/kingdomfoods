import mongoose from "mongoose";

const SubcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    image: { type: String, required: true }, // Cloudinary URL
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

// Helpful virtual population for dishes
SubcategorySchema.virtual("dishes", {
  ref: "Dish",
  localField: "_id",
  foreignField: "subcategory",
});

SubcategorySchema.set("toJSON", { virtuals: true });
SubcategorySchema.set("toObject", { virtuals: true });

const Subcategory = mongoose.model("Subcategory", SubcategorySchema);
export default Subcategory;
