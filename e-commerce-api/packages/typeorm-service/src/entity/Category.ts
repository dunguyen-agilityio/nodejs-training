import { Column, Entity, OneToMany } from 'typeorm'

import { Base, BaseProps } from './Base'
import { Product } from './Product'

@Entity({ name: 'categories' })
export class Category extends Base {
  @Column({ unique: true })
  name: string

  @Column()
  description: string

  @OneToMany(() => Product, (product) => product.categoryId)
  products?: Product[]

  constructor(category: BaseProps<Category>) {
    super()
    if (category) {
      Object.assign(this, { ...category, products: category.products || [] })
    }
  }
}
