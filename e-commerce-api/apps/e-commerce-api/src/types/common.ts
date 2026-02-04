export type Nullable<T> = T | null

export type Emptyable<T> = null | '' | T
export interface MetadataParam {
  [name: string]: string | number | null
}
