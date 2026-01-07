import { Post } from "#models/post";

export class PostDTO {
  /**
   *
   * @param {Post} post
   */
  constructor(post) {
    Object.assign(this, post);
    this.category = post.category.name;
    this.tags = post.tags.map((tag) => tag.name);
  }
}
