import { connectDB } from "./db";
import Category from "@/models/Category";
import MenuItem from "@/models/MenuItem";
import Business from "@/models/Business";
import { devStore } from "./dev-store";
export async function getMenuData() {
  if (!process.env.MONGODB_URI) return structuredClone(devStore);
  await connectDB();
  const [business, categories, items] = await Promise.all([
    Business.findOne({ key: "primary" }).lean(),
    Category.find({ active: true }).sort({ order: 1 }).lean(),
    MenuItem.find().populate("category").sort({ order: 1 }).lean(),
  ]);
  return JSON.parse(JSON.stringify({ business, categories, items }));
}
