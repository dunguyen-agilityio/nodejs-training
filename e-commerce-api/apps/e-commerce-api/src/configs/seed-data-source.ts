import { createDataSource } from './data-source'

export const SeedDataSource = createDataSource({
  migrations: ['src/seeds/*{.js,.ts}'],
})
