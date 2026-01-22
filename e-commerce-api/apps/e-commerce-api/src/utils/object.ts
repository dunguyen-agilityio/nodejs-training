import { uncapitalize } from "./string";

type Target = Record<string, unknown>;
type StringKey<T> = Extract<keyof T, string>;

export const create = <
  O extends Target = Target,
  K extends string = string,
  D extends string = string,
>(
  t: K,
  d = "" as D,
): [StringKey<O>, Uncapitalize<StringKey<O>>] => {
  return [
    `${t}${d}` as StringKey<O>,
    `${uncapitalize(t)}${d}` as Uncapitalize<StringKey<O>>,
  ];
};

export const hasProperty = <K extends string, V = unknown>(
  key: K,
  obj: object,
): obj is Record<K, V> => {
  return key in obj;
};
