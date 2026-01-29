type Target = Record<string, unknown>;
type StringKey<T> = Extract<keyof T, string>;

export const create = <
  O extends Target = Target,
  K extends string = string,
  D extends string = string,
>(
  key: K,
  { nameMapping, type }: { type?: D; nameMapping?: Record<K, string> },
): [StringKey<O>, StringKey<O> | string] => {
  return [
    `${key}${type || ""}` as StringKey<O>,
    nameMapping
      ? nameMapping[key]
      : (`${key}${type || ""}` as Uncapitalize<StringKey<O>>),
  ];
};

export const hasProperty = <K extends string, V = unknown>(
  key: K,
  obj: object,
): obj is Record<K, V> => {
  return key in obj;
};
