import { MetadataParam } from "./common";
import { Price } from "./price";

export interface ProductCreateParams {
  name: string;
  active?: boolean;
  default_price_data?: DefaultPriceData;
  description?: string;
  id?: string;
  images?: Array<string>;
  url?: string;
  metadata?: MetadataParam;
}

interface DefaultPriceData {
  currency: string;
  unit_amount?: number;
}

export interface Product {
  id: string;
  object: "product";
  active: boolean;
  created: number;
  default_price?: string | Price | null;
  deleted?: void;
  description: string | null;
  images: Array<string>;
  name: string;
  updated: number;
  url: string | null;
  metadata?: MetadataParam;
}
