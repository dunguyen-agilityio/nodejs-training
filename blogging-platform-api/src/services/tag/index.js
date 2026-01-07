export class TagService {
  /**
   * @param {ITagRepository} repository
   */
  constructor(repository) {
    this.tagRepository = repository;
  }

  /**
   * @returns {Promise<ITag[]>}
   * @param {string []} tagNames
   */
  async createIfNotExists(tagNames) {
    const availableTags = await this.tagRepository.getTagsByNames(tagNames);

    let allTags = [...availableTags];
    const availableTagNames = availableTags.map((item) => item.name);

    const newTagNames = tagNames.filter(
      (item) => !availableTagNames.includes(item)
    );

    if (newTagNames.length > 0) {
      const newTags = await this.tagRepository.createMany(newTagNames);
      allTags = [...allTags, ...newTags];
    }

    return allTags;
  }
}
