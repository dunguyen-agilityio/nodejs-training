import { get } from "./api";
import { ApiResponse, Category } from "./types";

export const fetchCategories = async () => {
    const response = await get<ApiResponse<Category[]>>("/categories");
    return (response.data);
};