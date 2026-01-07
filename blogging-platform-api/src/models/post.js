import { Category } from "#models/category";
import { Tag } from "#models/tag";

export class Post {
  /**
   *
   * @param {{id: number; title: string; content: string; category: Category; tags: Tag[]; created_at?: string; updated_at?: string;}} param0
   */
  constructor({ id, title, content, created_at, updated_at, category, tags }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.tags = tags;
    this.category = category;
    this.createdAt = new Date(created_at);
    this.updatedAt = new Date(updated_at);
  }
}
