import { TagSchema } from "#entity/TagSchema";
import { AppDataSource } from "#configs";
import { Tag } from "#models/tag";

export const tagRepository = AppDataSource.getRepository(TagSchema).extend({
  /**
   *
   * @param {string[]} tagNames
   * @returns {Promise<Tag[]>}
   */
  async getTagsByNames(tagNames) {
    return this.createQueryBuilder("tag")
      .where("tag.name IN (:...names)", { names: tagNames })
      .getMany();
  },

  /**
   *
   * @param {number[]} ids
   * @returns {Promise<Tag[]>}
   */
  async getTagsByIds(ids) {
    return this.createQueryBuilder("tag")
      .where("tag.id IN (:...ids)", { ids })
      .getMany();
  },

  /**
   *
   * @param {string[]} tagNames
   * @returns {Promise<Tag[]>}
   */
  async createMany(tagNames) {
    const result = await this.createQueryBuilder()
      .insert()
      .into(TagSchema)
      .values(tagNames.map((name) => ({ name })))
      .execute();

    const newTags = await this.getTagsByIds(
      result.identifiers.map(({ id }) => id)
    );

    return newTags;
  },
});
