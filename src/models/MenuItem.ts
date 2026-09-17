import mongoose, { Schema } from "mongoose";
const option = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);
const schema = new Schema(
  {
    name: { type: String, required: true, index: true },
    nameAr: String,
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: String,
    description: { type: String, required: true },
    descriptionAr: String,
    image: { type: String, required: true },
    images: [String],
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    available: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false, index: true },
    isNew: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    customBadges: [{ type: String, trim: true }],
    sizes: [option],
    extras: [option],
    order: { type: Number, default: 0 },
  },
  { timestamps: true, suppressReservedKeysWarning: true },
);
export default mongoose.models.MenuItem || mongoose.model("MenuItem", schema);
