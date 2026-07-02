export type ProductCategory = "scanners" | "maquinas" | "manometros" | "equipamentos";

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  category: ProductCategory;
  brand?: string;
  description: string;
  detail?: string;
  price: number | null;
  oldPrice: number | null;
  imageUrl: string;
  images?: string[];
  youtubeUrl?: string;
  active: boolean;
  featured: boolean;
  mostViewed?: boolean;
  stockStatus: string;
  paymentNote?: string;
  paymentInfo?: string;
  tags?: string[];
  useTags?: string[];
  specs?: Record<string, string>;
};

export type ProductInput = Omit<Product, "id" | "slug"> & {
  id?: string;
  slug?: string;
};

export type CartItem = Product & {
  quantity: number;
};
