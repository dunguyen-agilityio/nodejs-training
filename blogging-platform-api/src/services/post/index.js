import { Repository } from "typeorm";

import { Category, Post } from "#models";

import { PostDTO } from "#dtos/post";

export class PostService {
  /**
   * @param {Repository<Post>} postRepository
   * @param {ICategoryService} categoryService
   * @param {ITagService} tagService
   */
  constructor(postRepository, categoryService, tagService) {
    this.postRepository = postRepository;
    this.categoryService = categoryService;
    this.tagService = tagService;
  }

  /**
   * @param {string} term
   * @returns {Promise<PostDTO[]>}
   */
  async getAll(term = "") {
    const queryLike = `%${term}%`;

    const builder = this.postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.category", "category")
      .leftJoinAndSelect("post.tags", "tags")
      .orderBy("updated_at", "DESC");

    if (!!term) {
      builder
        .where("post.content like :content", { content: queryLike })
        .orWhere("post.title like :title", { title: queryLike })
        .orWhere("category.name like :category", { category: queryLike });
    }

    const data = await builder.getMany();

    return data.map((post) => new PostDTO(post));
  }

  /**
   * @returns {Promise<PostDTO>}
   * @param {number} id
   */
  async get(id) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { category: true, tags: true },
    });

    return post ? new PostDTO(post) : null;
  }

  /**
   * @returns {Promise<boolean>}
   * @param {number} id
   */
  async delete(id) {
    return this.postRepository.delete(id);
  }

  /**
   * @returns {Promise<Post>}
   * @param {{title: string; content: string; category: string; tags: string[];}} params
   */
  async create(params) {
    const { category, content, tags: tagNames, title } = params;
    let tags = [];

    if (tagNames.length > 0) {
      tags = await this.tagService.createIfNotExists(tagNames);
    }

    const post = await this.postRepository.save({
      content,
      title,
      category,
      tags,
    });

    return new PostDTO(post);
  }

  /**
   * @returns {Promise<IPost|null>}
   * @param {string} postId
   * @param {{title: string; content: string; category: Category; tags: string[];}} params
   */
  async update(postId, params) {
    const { category, content, tags: tagNames, title } = params;

    const currentData = await this.postRepository.findOne({
      where: { id: postId },
      relations: { category: true, tags: true },
    });

    if (tagNames.length > 0) {
      currentData.tags = await this.tagService.createIfNotExists(tagNames);
    }

    const result = await this.postRepository.save({
      ...currentData,
      category,
      content,
      title,
    });

    return new PostDTO(result);
  }
}
