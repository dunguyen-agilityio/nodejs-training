import { Product } from "./product";

export interface Price {
  id: string;
  object: "price";
  active: boolean;
  created: number;
  currency: string;
  deleted?: void;
  nickname: string | null;
  product: string | Product | DeletedProduct;
  unit_amount: number | null;
}

interface DeletedProduct {
  id: string;
  object: "product";
  deleted: true;
}
