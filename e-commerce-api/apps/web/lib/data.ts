import { Product } from "./types";

export const products: Product[] = [
  {
    id: "1",
    name: "Classic White Tee",
    description: "A comfortable, everyday essential made from 100% organic cotton.",
    price: 25,
    image: "/file-text.svg",
    category: "Apparel",
  },
  {
    id: "2",
    name: "Denim Jacket",
    description: "Timeless denim jacket with a modern fit.",
    price: 85,
    image: "/file-text.svg",
    category: "Apparel",
  },
  {
    id: "3",
    name: "Leather Messenger Bag",
    description: "Premium leather bag perfect for your daily commute.",
    price: 120,
    image: "/file-text.svg",
    category: "Accessories",
  },
  {
    id: "4",
    name: "Wireless Headphones",
    description: "High-quality sound with noise-canceling technology.",
    price: 199,
    image: "/file-text.svg",
    category: "Electronics",
  },
  {
    id: "5",
    name: "Running Shoes",
    description: "Lightweight and breathable running shoes for optimal performance.",
    price: 110,
    image: "/file-text.svg",
    category: "Footwear",
  },
  {
    id: "6",
    name: "Smart Watch",
    description: "Track your fitness and stay connected with this stylish smart watch.",
    price: 250,
    image: "/file-text.svg",
    category: "Electronics",
  },
  {
    id: "7",
    name: "Sunglasses",
    description: "UV protection sunglasses with a classic design.",
    price: 45,
    image: "/file-text.svg",
    category: "Accessories",
  },
  {
    id: "8",
    name: "Hoodie",
    description: "Warm and cozy hoodie, perfect for chilly evenings.",
    price: 55,
    image: "/file-text.svg",
    category: "Apparel",
  },
  {
    id: "9",
    name: "Backpack",
    description: "Durable backpack with plenty of storage for all your gear.",
    price: 70,
    image: "/file-text.svg",
    category: "Accessories",
  },
  {
    id: "10",
    name: "Gaming Mouse",
    description: "Precision gaming mouse with customizable RGB lighting.",
    price: 60,
    image: "/file-text.svg",
    category: "Electronics",
  },
];

export interface GetProductsParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export async function getProducts({
  search,
  category,
  page = 1,
  limit = 4,
}: GetProductsParams) {
  let filteredProducts = products;

  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchLower)
    );
  }

  if (category && category !== "All") {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === category
    );
  }

  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    products: paginatedProducts,
    pagination: {
      currentPage: page,
      totalPages,
      total,
      hasMore: page < totalPages,
    },
  };
}

export async function getCategories() {
  const categories = Array.from(new Set(products.map((p) => p.category)));
  return ["All", ...categories];
}
