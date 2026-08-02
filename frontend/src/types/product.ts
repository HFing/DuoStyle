export interface ProductVariant {
  id: number;
  size: string;
  color?: string;
  sku?: string;
  price?: number;
  stockQuantity: number;
}

export interface Product {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  basePrice: number;
  price?: number;
  thumbnailUrl?: string;
  image?: string;
  images?: (string | { imageUrl: string })[];
  genderTarget?: string;
  categoryName?: string;
  categoryId?: number;
  color?: string;
  sku?: string;
  material?: string;
  variants?: ProductVariant[];
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  genderTarget?: string;
  parentId?: number | null;
  parentName?: string;
  children?: Category[];
}
