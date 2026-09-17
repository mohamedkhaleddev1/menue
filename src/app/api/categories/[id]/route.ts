import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import MenuItem from "@/models/MenuItem";
import { categorySchema } from "@/lib/validation";
import { apiError } from "@/lib/api";
import { devStore } from "@/lib/dev-store";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await auth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!process.env.MONGODB_URI)
    return NextResponse.json(
      devStore.categories.find((c) => c._id === id) || null,
    );
  await connectDB();
  return NextResponse.json(await Category.findById((await params).id));
}
export async function PATCH(
  r: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await auth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = categorySchema.partial().parse(await r.json());
    const { id } = await params;
    if (!process.env.MONGODB_URI) {
      const index = devStore.categories.findIndex((c) => c._id === id);
      if (index < 0)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      devStore.categories[index] = { ...devStore.categories[index], ...data };
      return NextResponse.json(devStore.categories[index]);
    }
    await connectDB();
    return NextResponse.json(
      await Category.findByIdAndUpdate((await params).id, data, {
        new: true,
        runValidators: true,
      }),
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(
  r: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await auth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.MONGODB_URI) {
    const id = (await params).id;
    const count = devStore.items.filter(
      (item) =>
        (typeof item.category === "string"
          ? item.category
          : item.category._id) === id,
    ).length;
    if (count)
      return NextResponse.json(
        {
          error: `This category contains ${count} product(s). Move or delete them first.`,
        },
        { status: 409 },
      );
    devStore.categories = devStore.categories.filter((c) => c._id !== id);
    return NextResponse.json({ ok: true });
  }
  await connectDB();
  const id = (await params).id,
    count = await MenuItem.countDocuments({ category: id });
  if (count && !new URL(r.url).searchParams.has("force"))
    return NextResponse.json(
      {
        error: `This category contains ${count} product(s). Move or delete them before deleting the category.`,
        productCount: count,
      },
      { status: 409 },
    );
  if (count) await MenuItem.deleteMany({ category: id });
  await Category.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
