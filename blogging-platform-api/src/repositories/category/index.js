import { AppDataSource } from "#configs";
import { CategorySchema } from "#entity/CategorySchema";

export const categoryRepository = AppDataSource.getRepository(CategorySchema);
