import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { categorySchema } from "@/lib/validation";
import { apiError } from "@/lib/api";
import { devStore } from "@/lib/dev-store";
export async function GET() {
  if (!process.env.MONGODB_URI) return NextResponse.json(devStore.categories);
  await connectDB();
  return NextResponse.json(await Category.find().sort({ order: 1 }).lean());
}
export async function POST(r: Request) {
  if (!(await auth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = categorySchema.parse(await r.json());
    if (!process.env.MONGODB_URI) {
      const category = { ...data, _id: crypto.randomUUID() };
      devStore.categories.push(category);
      return NextResponse.json(category, { status: 201 });
    }
    await connectDB();
    return NextResponse.json(await Category.create(data), { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
