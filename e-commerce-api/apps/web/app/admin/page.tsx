import { products } from "@/lib/data";
import Link from "next/link";

export default function AdminDashboard() {
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, curr) => acc + curr.stock, 0);
  const totalValue = products.reduce((acc, curr) => acc + curr.price * curr.stock, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Total Products</h3>
          </div>
          <div className="p-0 pt-4">
            <div className="text-2xl font-bold">{totalProducts}</div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Total Inventory</h3>
          </div>
          <div className="p-0 pt-4">
            <div className="text-2xl font-bold">{totalStock}</div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-col space-y-1.5">
            <h3 className="font-semibold leading-none tracking-tight">Total Value</h3>
          </div>
          <div className="p-0 pt-4">
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
         <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
         <Link href="/admin/products" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
            Manage Products
         </Link>
      </div>
    </div>
  );
}
