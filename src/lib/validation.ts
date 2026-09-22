import { z } from "zod";
const option = z.object({
  name: z.string().min(1),
  price: z.coerce.number().min(0),
});
const optionalUrl = z.union([z.literal(""), z.string().url()]).optional();
const imageUrl = z
  .string()
  .refine(
    (value) =>
      z.string().url().safeParse(value).success ||
      value.startsWith("data:image/"),
    "Enter a valid image URL",
  );
const optionalImageUrl = z.union([z.literal(""), imageUrl]).optional();
export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  nameAr: z.string().max(80).optional().default(""),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(240).optional().default(""),
  image: optionalImageUrl,
  icon: z.string().max(40).optional().default(""),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
const itemObjectSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional().default(""),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  shortDescription: z.string().max(180).optional().default(""),
  description: z.string().min(5),
  descriptionAr: z.string().optional().default(""),
  price: z.coerce.number().min(0),
  discountPrice: z.coerce.number().min(0).optional().nullable(),
  image: imageUrl,
  images: z.array(imageUrl).max(8).default([]),
  category: z.string().min(1),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  customBadges: z.array(z.string().min(1).max(30)).max(8).default([]),
  sizes: z.array(option).default([]),
  extras: z.array(option).default([]),
  order: z.coerce.number().int().min(0).default(0),
});
export const itemSchema = itemObjectSchema.refine(
  (v) => v.discountPrice == null || v.discountPrice < v.price,
  {
    message: "Discount price must be lower than the regular price",
    path: ["discountPrice"],
  },
);
export const itemPatchSchema = itemObjectSchema
  .partial()
  .refine(
    (v) =>
      v.discountPrice == null || v.price == null || v.discountPrice < v.price,
    {
      message: "Discount price must be lower than the regular price",
      path: ["discountPrice"],
    },
  );
export const businessSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional(),
  heroEyebrow: z.string().max(80).optional(),
  heroTitle: z.string().max(100).optional(),
  heroEmphasis: z.string().max(100).optional(),
  description: z.string(),
  descriptionAr: z.string().optional(),
  logo: z.string(),
  coverImage: imageUrl,
  address: z.string(),
  mapUrl: optionalUrl,
  phone: z.string(),
  whatsapp: z.string(),
  instagram: optionalUrl,
  facebook: optionalUrl,
  tiktok: optionalUrl,
  openingHours: z.string(),
  currency: z.string().min(2).max(5),
  deliveryInfo: z.string().optional(),
  hideUnavailable: z.boolean(),
  defaultLanguage: z.enum(["en", "ar"]).optional(),
  appearance: z
    .object({
      primaryColor: z.string(),
      secondaryColor: z.string(),
      backgroundColor: z.string(),
      textColor: z.string(),
      buttonStyle: z.enum(["rounded", "square", "pill"]),
      cardStyle: z.enum(["soft", "bordered", "flat"]),
      theme: z.enum(["light", "dark"]),
    })
    .optional(),
});
