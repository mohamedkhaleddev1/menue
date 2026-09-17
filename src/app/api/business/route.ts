import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { businessSchema } from "@/lib/validation";
import { devStore } from "@/lib/dev-store";
export async function GET() {
  if (!process.env.MONGODB_URI) return NextResponse.json(devStore.business);
  await connectDB();
  return NextResponse.json(await Business.findOne({ key: "primary" }));
}
export async function PUT(r: Request) {
  if (!(await auth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = businessSchema.safeParse(await r.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  if (!process.env.MONGODB_URI) {
    devStore.business = { ...devStore.business, ...parsed.data };
    return NextResponse.json(devStore.business);
  }
  await connectDB();
  return NextResponse.json(
    await Business.findOneAndUpdate(
      { key: "primary" },
      { $set: parsed.data },
      { new: true, upsert: true },
    ),
  );
}
