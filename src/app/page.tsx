import MenuApp from "@/components/menu-app";
import { demoBusiness, demoCategories, demoItems } from "@/lib/demo-data";
import { getMenuData } from "@/lib/data";
export const dynamic="force-dynamic";
export default async function Home(){const data=await getMenuData().catch(()=>null);return <MenuApp business={data?.business||demoBusiness} categories={data?.categories||demoCategories} items={data?.items||demoItems}/>}
