import { getCategories, getProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { SearchInput } from "@/components/search-input";
import { CategoryFilter } from "@/components/category-filter";
import { PaginationControls } from "@/components/pagination-controls";

interface HomeProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { search, category, page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 4;

  const { products, pagination } = await getProducts({
    search,
    category,
    page: currentPage,
    limit,
  });

  const categories = await getCategories();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Featured Products
          </h1>
          <p className="text-base text-muted-foreground">
            Check out our latest collection of high-quality products.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <CategoryFilter categories={categories} />
          <SearchInput />
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground">
              No products found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <PaginationControls
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
          />
        )}
      </div>
    </main>
  );
}
