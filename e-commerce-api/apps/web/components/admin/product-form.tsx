"use client";

import { get, post, put } from "@/lib/api";
import { productSchema, type ProductFormInput } from "@/lib/schema";
import { Product, ApiResponse } from "@/lib/types";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { faker } from "@faker-js/faker";

type Category = { id: number; name: string };

interface ProductFormProps {
  initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const { id } = initialData || {};

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await get<ApiResponse<Category[]>>("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
        name: initialData.name,
        description: initialData.description,
        price: initialData.price,
        stock: initialData.stock,
        category: initialData.category,
        image: initialData.images?.[0] || "/file-text.svg",
      }
      : {
        image: "/file-text.svg",
      },
  });

  const generateMockData = () => {
    const randomCategory =
      categories.length > 0
        ? categories[Math.floor(Math.random() * categories.length)]?.name ||
        "Electronics"
        : "Electronics";

    setValue("name", faker.commerce.productName());
    setValue("description", faker.commerce.productDescription());
    setValue("price", faker.commerce.price({ min: 10, max: 500 }));
    setValue("stock", faker.number.int({ min: 0, max: 100 }).toString());
    setValue("category", randomCategory);
    setValue("image", faker.image.url({ width: 800, height: 600 }));

    toast.success("Mock data generated!");
  };

  const onSubmit = async ({ image, ...data }: ProductFormInput) => {
    try {
      const token = await getToken({ leewayInSeconds: 3 });

      if (!id) {
        await post(
          "/products",
          {
            ...data,
            images: image ? [image] : [],
          },
          { Authorization: `Bearer ${token}` },
        );
      } else {
        await put(`/products/${id}`, data, {
          Authorization: `Bearer ${token}`,
        });
      }

      toast.success(
        isEditing
          ? "Product updated successfully."
          : "Product created successfully.",
      );
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      console.error("Product save error:", error);
      toast.error(error?.message || "Failed to save product.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            {...register("name")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            {...register("description")}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <label htmlFor="image" className="text-sm font-medium">
            Image URL
          </label>
          <input
            id="image"
            type="url"
            placeholder="https://example.com/image.jpg"
            {...register("image")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.image && (
            <p className="text-sm text-destructive">{errors.image.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label htmlFor="price" className="text-sm font-medium">
              Price
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              {...register("price")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <label htmlFor="stock" className="text-sm font-medium">
              Stock
            </label>
            <input
              id="stock"
              type="number"
              {...register("stock")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.stock && (
              <p className="text-sm text-destructive">{errors.stock.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          {isLoadingCategories ? (
            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          ) : (
            <select
              id="category"
              {...register("category")}
              disabled={isLoadingCategories}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {isLoadingCategories ? "Loading..." : "Select a category"}
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          )}

          {errors.category && (
            <p className="text-sm text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        {process.env.NODE_ENV === "development" && !isEditing && (
          <button
            type="button"
            onClick={generateMockData}
            disabled={isLoadingCategories}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 disabled:opacity-50"
          >
            🎲 Generate Mock Data
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || (isEditing && !isDirty)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Update Product"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
}
