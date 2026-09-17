import mongoose, { Schema } from "mongoose";
const appearance = {
  primaryColor: { type: String, default: "#1f3025" },
  secondaryColor: { type: String, default: "#e8b86a" },
  backgroundColor: { type: String, default: "#f7f5f0" },
  textColor: { type: String, default: "#1e2b22" },
  buttonStyle: { type: String, default: "pill" },
  cardStyle: { type: String, default: "soft" },
  theme: { type: String, default: "light" },
};
const schema = new Schema(
  {
    key: { type: String, default: "primary", unique: true },
    name: String,
    nameAr: String,
    heroEyebrow: String,
    heroTitle: String,
    heroEmphasis: String,
    description: String,
    descriptionAr: String,
    logo: String,
    coverImage: String,
    address: String,
    mapUrl: String,
    phone: String,
    whatsapp: String,
    instagram: String,
    facebook: String,
    tiktok: String,
    openingHours: String,
    currency: { type: String, default: "EGP" },
    deliveryInfo: String,
    hideUnavailable: { type: Boolean, default: false },
    defaultLanguage: { type: String, default: "en" },
    appearance,
  },
  { timestamps: true },
);
export default mongoose.models.Business || mongoose.model("Business", schema);
