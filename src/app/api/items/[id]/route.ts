import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import MenuItem from "@/models/MenuItem";
import "@/models/Category";
import { itemPatchSchema } from "@/lib/validation";
import { apiError } from "@/lib/api";
import { devStore, populateItem } from "@/lib/dev-store";
import type { MenuItem as MenuItemType } from "@/lib/types";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await auth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!process.env.MONGODB_URI) {
    const item = devStore.items.find((i) => i._id === id);
    return item
      ? NextResponse.json(populateItem(item))
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await connectDB();
  const item = await MenuItem.findById((await params).id).populate("category");
  return item
    ? NextResponse.json(item)
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}
export async function PATCH(
  r: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await auth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = itemPatchSchema.parse(await r.json());
    const { id } = await params;
    if (!process.env.MONGODB_URI) {
      const index = devStore.items.findIndex((i) => i._id === id);
      if (index < 0)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      devStore.items[index] = {
        ...devStore.items[index],
        ...data,
      } as MenuItemType;
      return NextResponse.json(populateItem(devStore.items[index]));
    }
    await connectDB();
    return NextResponse.json(
      await MenuItem.findByIdAndUpdate((await params).id, data, {
        new: true,
        runValidators: true,
      }),
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await auth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.MONGODB_URI) {
    const id = (await params).id;
    devStore.items = devStore.items.filter((i) => i._id !== id);
    return NextResponse.json({ ok: true });
  }
  await connectDB();
  await MenuItem.findByIdAndDelete((await params).id);
  return NextResponse.json({ ok: true });
}
