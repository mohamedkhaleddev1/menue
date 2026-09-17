import mongoose from "mongoose";
import bcrypt from "bcryptjs";

if (!process.env.MONGODB_URI) {
  throw new Error("Set MONGODB_URI before seeding");
}

await mongoose.connect(process.env.MONGODB_URI);

const optionSchema = new mongoose.Schema(
  { name: { type: String, required: true }, price: { type: Number, required: true, min: 0 } },
  { _id: false },
);
const categorySchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  order: Number,
  active: Boolean,
});
const menuItemSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  image: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  price: Number,
  discountPrice: Number,
  available: Boolean,
  featured: Boolean,
  isNew: Boolean,
  bestSeller: Boolean,
  customBadges: [String],
  sizes: [optionSchema],
  extras: [optionSchema],
  order: Number,
}, { suppressReservedKeysWarning: true });
const businessSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  name: String,
  heroEyebrow: String,
  heroTitle: String,
  heroEmphasis: String,
  description: String,
  logo: String,
  coverImage: String,
  address: String,
  phone: String,
  whatsapp: String,
  instagram: String,
  facebook: String,
  openingHours: String,
  currency: String,
  hideUnavailable: Boolean,
});
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: String,
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);
const Business = mongoose.models.Business || mongoose.model("Business", businessSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);

const categorySeeds = [
  ["Breakfast", "breakfast", "A bright start"],
  ["Burgers", "burgers", "Hand-smashed favorites"],
  ["Main Courses", "mains", "From our kitchen"],
  ["Desserts", "desserts", "Save room"],
  ["Drinks", "drinks", "Hot and cold"],
];

const categories = {};
for (const [index, [name, slug, description]] of categorySeeds.entries()) {
  categories[slug] = await Category.findOneAndUpdate(
    { slug },
    { $set: { name, slug, description, order: index + 1, active: true } },
    { upsert: true, returnDocument: "after" },
  );
}

const image = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;
const menuItems = [
  {
    name: "Turkish Eggs",
    slug: "turkish-eggs",
    description: "Garlic labneh, soft eggs, Aleppo butter, dill and toasted sourdough.",
    price: 165,
    image: image("photo-1525351484163-7529414344d8"),
    category: categories.breakfast._id,
    available: true,
    featured: true,
    isNew: false,
    bestSeller: true,
    sizes: [],
    extras: [{ name: "Extra sourdough", price: 20 }, { name: "Avocado", price: 45 }],
    order: 1,
  },
  {
    name: "Honey Ricotta Toast",
    slug: "honey-ricotta",
    description: "Whipped ricotta, local honey, roasted figs, pistachio and sea salt.",
    price: 145,
    image: image("photo-1484723091739-30a097e8f929"),
    category: categories.breakfast._id,
    available: true,
    featured: false,
    isNew: true,
    bestSeller: false,
    sizes: [],
    extras: [],
    order: 2,
  },
  {
    name: "The Savor Burger",
    slug: "savor-burger",
    description: "Double smashed beef, aged cheddar, caramelized onions, pickles and house sauce.",
    price: 250,
    discountPrice: 199,
    image: image("photo-1568901346375-23c9450c58cd"),
    category: categories.burgers._id,
    available: true,
    featured: true,
    isNew: false,
    bestSeller: true,
    sizes: [],
    extras: [{ name: "Extra cheese", price: 20 }, { name: "Beef patty", price: 70 }, { name: "Truffle sauce", price: 25 }],
    order: 1,
  },
  {
    name: "Hot Honey Chicken",
    slug: "hot-honey-chicken",
    description: "Crispy chicken, cabbage slaw, pickles and spiced honey on brioche.",
    price: 210,
    image: image("photo-1615297928064-24977384d0da"),
    category: categories.burgers._id,
    available: false,
    featured: false,
    isNew: true,
    bestSeller: false,
    sizes: [],
    extras: [],
    order: 2,
  },
  {
    name: "Miso Glazed Salmon",
    slug: "miso-salmon",
    description: "Roasted salmon, sesame greens, jasmine rice and ginger scallion dressing.",
    price: 390,
    image: image("photo-1467003909585-2f8a72700288"),
    category: categories.mains._id,
    available: true,
    featured: true,
    isNew: false,
    bestSeller: false,
    sizes: [],
    extras: [],
    order: 1,
  },
  {
    name: "Truffle Mushroom Pasta",
    slug: "truffle-pasta",
    description: "Fresh tagliatelle, wild mushrooms, parmesan, herbs and truffle cream.",
    price: 285,
    image: image("photo-1473093295043-cdd812d0e601"),
    category: categories.mains._id,
    available: true,
    featured: false,
    isNew: false,
    bestSeller: true,
    sizes: [{ name: "Regular", price: 285 }, { name: "Large", price: 340 }],
    extras: [{ name: "Grilled chicken", price: 65 }],
    order: 2,
  },
  {
    name: "Burnt Basque Cheesecake",
    slug: "basque-cheesecake",
    description: "Caramelized top, silky center and seasonal berry compote.",
    price: 135,
    image: image("photo-1578985545062-69928b1d9587"),
    category: categories.desserts._id,
    available: true,
    featured: false,
    isNew: false,
    bestSeller: true,
    sizes: [],
    extras: [],
    order: 1,
  },
  {
    name: "Spanish Latte",
    slug: "spanish-latte",
    description: "Double espresso, textured milk and our signature condensed milk blend.",
    price: 95,
    image: image("photo-1509042239860-f550ce710b93"),
    category: categories.drinks._id,
    available: true,
    featured: false,
    isNew: false,
    bestSeller: false,
    sizes: [{ name: "Small", price: 80 }, { name: "Medium", price: 95 }, { name: "Large", price: 115 }],
    extras: [{ name: "Extra shot", price: 20 }, { name: "Oat milk", price: 25 }],
    order: 1,
  },
];

for (const item of menuItems) {
  await MenuItem.updateOne({ slug: item.slug }, { $set: item }, { upsert: true });
}

await Business.updateOne(
  { key: "primary" },
  {
    $set: {
      name: "Savor & Co.",
      heroEyebrow: "Welcome to the table",
      heroTitle: "Good food.",
      heroEmphasis: "Beautifully simple.",
      description: "Season-led comfort food, crafted with soul.",
      logo: "SC",
      coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=85",
      address: "12 Zamalek Avenue, Cairo",
      phone: "+20 100 555 0142",
      whatsapp: "201005550142",
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      openingHours: "Open daily · 8:00 AM — 11:30 PM",
      currency: "EGP",
      hideUnavailable: false,
    },
  },
  { upsert: true },
);

const email = process.env.ADMIN_EMAIL || "owner@example.com";
const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
await User.updateOne(
  { email },
  {
    $set: {
      name: "Restaurant Owner",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
    },
  },
  { upsert: true },
);

console.log(`Seed complete: ${categorySeeds.length} categories and ${menuItems.length} menu items.`);
await mongoose.disconnect();
