import { demoBusiness, demoCategories, demoItems } from "./demo-data";
import type { Business, Category, MenuItem } from "./types";
type Store = { business: Business; categories: Category[]; items: MenuItem[] };
const root = globalThis as typeof globalThis & { menuDevStore?: Store };
export const devStore: Store =
  root.menuDevStore ??
  (root.menuDevStore = {
    business: structuredClone(demoBusiness),
    categories: structuredClone(demoCategories),
    items: structuredClone(demoItems),
  });
devStore.business = { ...structuredClone(demoBusiness), ...devStore.business };
export function populateItem(item: MenuItem) {
  const categoryId =
    typeof item.category === "string" ? item.category : item.category._id;
  return {
    ...item,
    category:
      devStore.categories.find((c) => c._id === categoryId) || item.category,
  };
}
