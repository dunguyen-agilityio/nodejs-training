import { get } from './api'
import { fetchCategories } from './category'
import { ApiPagination, ApiResponse, CartItem, Product } from './types'

export const products: Product[] = [
  // ... existing mock products ...
  {
    id: '1',
    name: 'Classic White Tee',
    description:
      'A comfortable, everyday essential made from 100% organic cotton.',
    price: 25,
    images: ['/file-text.svg'],
    category: 'Apparel',
    stock: 50,
  },
  {
    id: '2',
    name: 'Denim Jacket',
    description: 'Timeless denim jacket with a modern fit.',
    price: 85,
    images: ['/file-text.svg'],
    category: 'Apparel',
    stock: 20,
  },
  {
    id: '3',
    name: 'Leather Messenger Bag',
    description: 'Premium leather bag perfect for your daily commute.',
    price: 120,
    images: ['/file-text.svg'],
    category: 'Accessories',
    stock: 15,
  },
  {
    id: '4',
    name: 'Wireless Headphones',
    description: 'High-quality sound with noise-canceling technology.',
    price: 199,
    images: ['/file-text.svg'],
    category: 'Electronics',
    stock: 30,
  },
  {
    id: '5',
    name: 'Running Shoes',
    description:
      'Lightweight and breathable running shoes for optimal performance.',
    price: 110,
    images: ['/file-text.svg'],
    category: 'Footwear',
    stock: 45,
  },
  {
    id: '6',
    name: 'Smart Watch',
    description:
      'Track your fitness and stay connected with this stylish smart watch.',
    price: 250,
    images: ['/file-text.svg'],
    category: 'Electronics',
    stock: 10,
  },
  {
    id: '7',
    name: 'Sunglasses',
    description: 'UV protection sunglasses with a classic design.',
    price: 45,
    images: ['/file-text.svg'],
    category: 'Accessories',
    stock: 60,
  },
  {
    id: '8',
    name: 'Hoodie',
    description: 'Warm and cozy hoodie, perfect for chilly evenings.',
    price: 55,
    images: ['/file-text.svg'],
    category: 'Apparel',
    stock: 40,
  },
  {
    id: '9',
    name: 'Backpack',
    description: 'Durable backpack with plenty of storage for all your gear.',
    price: 70,
    images: ['/file-text.svg'],
    category: 'Accessories',
    stock: 25,
  },
  {
    id: '10',
    name: 'Gaming Mouse',
    description: 'Precision gaming mouse with customizable RGB lighting.',
    price: 60,
    images: ['/file-text.svg'],
    category: 'Electronics',
    stock: 35,
  },
  {
    id: '11',
    name: 'Yoga Mat',
    description: 'Eco-friendly yoga mat for your daily practice.',
    price: 35,
    images: ['/file-text.svg'],
    category: 'Fitness',
    stock: 20,
  },
  {
    id: '12',
    name: 'Dumbbell Set',
    description: 'Adjustable dumbbell set for home workouts.',
    price: 150,
    images: ['/file-text.svg'],
    category: 'Fitness',
    stock: 10,
  },
  {
    id: '13',
    name: 'Water Bottle',
    description: 'Insulated water bottle to keep your drinks cold.',
    price: 20,
    images: ['/file-text.svg'],
    category: 'Accessories',
    stock: 100,
  },
  {
    id: '14',
    name: "Chef's Knife",
    description: "Professional grade chef's knife for all your cooking needs.",
    price: 80,
    images: ['/file-text.svg'],
    category: 'Kitchen',
    stock: 15,
  },
  {
    id: '15',
    name: 'Cast Iron Skillet',
    description: 'Durable cast iron skillet for perfect searing.',
    price: 40,
    images: ['/file-text.svg'],
    category: 'Kitchen',
    stock: 25,
  },
  {
    id: '16',
    name: 'Coffee Maker',
    description: 'Automatic coffee maker for a perfect morning brew.',
    price: 120,
    images: ['/file-text.svg'],
    category: 'Kitchen',
    stock: 12,
  },
  {
    id: '17',
    name: 'Bluetooth Speaker',
    description: 'Portable bluetooth speaker with rich sound.',
    price: 90,
    images: ['/file-text.svg'],
    category: 'Electronics',
    stock: 40,
  },
  {
    id: '18',
    name: 'Canvas Wall Art',
    description: 'Beautiful canvas wall art for your home decor.',
    price: 65,
    images: ['/file-text.svg'],
    category: 'Home',
    stock: 8,
  },
  {
    id: '19',
    name: 'Throw Blanket',
    description: 'Soft and cozy throw blanket for your sofa.',
    price: 30,
    images: ['/file-text.svg'],
    category: 'Home',
    stock: 50,
  },
  {
    id: '20',
    name: 'Desk Lamp',
    description: 'Adjustable desk lamp with eye-protection LED.',
    price: 45,
    images: ['/file-text.svg'],
    category: 'Home',
    stock: 20,
  },
  {
    id: '21',
    name: 'Beanie',
    description: 'Knitted beanie to keep you warm in style.',
    price: 15,
    images: ['/file-text.svg'],
    category: 'Apparel',
    stock: 80,
  },
  {
    id: '22',
    name: 'Belt',
    description: 'Genuine leather belt with a classic buckle.',
    price: 35,
    images: ['/file-text.svg'],
    category: 'Accessories',
    stock: 45,
  },
  {
    id: '23',
    name: 'Socks (3-Pack)',
    description: 'Comfortable cotton socks for daily wear.',
    price: 12,
    images: ['/file-text.svg'],
    category: 'Apparel',
    stock: 150,
  },
  {
    id: '24',
    name: 'Umbrella',
    description: 'Compact and sturdy umbrella for rainy days.',
    price: 25,
    images: ['/file-text.svg'],
    category: 'Accessories',
    stock: 30,
  },
  {
    id: '25',
    name: 'External Hard Drive',
    description: '2TB external hard drive for all your backups.',
    price: 110,
    images: ['/file-text.svg'],
    category: 'Electronics',
    stock: 18,
  },
  {
    id: '26',
    name: 'Power Bank',
    description: 'High-capacity power bank for your mobile devices.',
    price: 50,
    images: ['/file-text.svg'],
    category: 'Electronics',
    stock: 25,
  },
  {
    id: '27',
    name: 'Journal',
    description: 'Premium leather-bound journal for your thoughts.',
    price: 25,
    images: ['/file-text.svg'],
    category: 'Stationery',
    stock: 60,
  },
  {
    id: '28',
    name: 'Fountain Pen',
    description: 'Elegant fountain pen for a smooth writing experience.',
    price: 45,
    images: ['/file-text.svg'],
    category: 'Stationery',
    stock: 12,
  },
  {
    id: '29',
    name: 'Laptop Stand',
    description: 'Ergonomic laptop stand for better posture.',
    price: 40,
    images: ['/file-text.svg'],
    category: 'Electronics',
    stock: 22,
  },
  {
    id: '30',
    name: 'Monitor Stand',
    description: 'Sturdy monitor stand with built-in storage.',
    price: 55,
    images: ['/file-text.svg'],
    category: 'Electronics',
    stock: 15,
  },
]

export interface GetProductsParams {
  search?: string
  category?: string
  sort?: string
  page?: number
  limit?: number
}

export async function getProducts({
  search,
  category,
  sort,
  page = 1,
  limit = 10,
}: GetProductsParams) {
  const params = new URLSearchParams()
  if (search) params.append('query', search)
  if (category && category !== 'All') params.append('category', category)
  if (sort) params.append('sort', sort)
  if (page) params.append('page', page.toString())
  if (limit) params.append('pageSize', limit.toString())

  const response = await get<
    ApiResponse<
      Product[],
      {
        meta: {
          pagination: ApiPagination
        }
      }
    >
  >(`/products?${params.toString()}`)

  const { currentPage, totalItems, totalPages } = response.meta.pagination

  return {
    products: response.data,
    pagination: {
      currentPage: page,
      totalPages,
      total: totalItems,
      hasMore: currentPage < totalPages,
    },
  }
}

export async function getProductById(id: string) {
  return get<ApiResponse<Product>>(`/products/${id}`)
}

export async function getCart(headers: HeadersInit = {}) {
  return get<ApiResponse<CartItem[]>>(`/cart`, headers)
}

export async function getCategories() {
  const categories = await fetchCategories()
  return ['All', ...Array.from(new Set(categories.map((p) => p.name)))]
}
