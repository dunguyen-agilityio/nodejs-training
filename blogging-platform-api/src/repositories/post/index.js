import { AppDataSource } from "#configs";
import { PostSchema } from "#entity/PostSchema";

export const postRepository = AppDataSource.getRepository(PostSchema);
