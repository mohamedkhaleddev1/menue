import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import MenuItem from "@/models/MenuItem";
import { itemSchema } from "@/lib/validation";
import { apiError } from "@/lib/api";
import { devStore, populateItem } from "@/lib/dev-store";
import type { MenuItem as MenuItemType } from "@/lib/types";
export async function GET(r: Request) {
  if (!process.env.MONGODB_URI)
    return NextResponse.json({
      items: devStore.items.map(populateItem),
      total: devStore.items.length,
      page: 1,
      pages: 1,
    });
  await connectDB();
  const u = new URL(r.url),
    q = u.searchParams.get("q"),
    category = u.searchParams.get("category"),
    available = u.searchParams.get("available"),
    featured = u.searchParams.get("featured"),
    page = Math.max(1, Number(u.searchParams.get("page")) || 1),
    limit = Math.min(50, Number(u.searchParams.get("limit")) || 20);
  const filter: Record<string, unknown> = {};
  if (q)
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { nameAr: { $regex: q, $options: "i" } },
    ];
  if (category) filter.category = category;
  if (available) filter.available = available === "true";
  if (featured) filter.featured = featured === "true";
  const [items, total] = await Promise.all([
    MenuItem.find(filter)
      .populate("category")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    MenuItem.countDocuments(filter),
  ]);
  return NextResponse.json({
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
export async function POST(r: Request) {
  if (!(await auth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = itemSchema.parse(await r.json());
    if (!process.env.MONGODB_URI) {
      const item = populateItem({
        ...data,
        _id: crypto.randomUUID(),
      } as MenuItemType);
      devStore.items.unshift(item);
      return NextResponse.json(item, { status: 201 });
    }
    await connectDB();
    return NextResponse.json(await MenuItem.create(data), { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
