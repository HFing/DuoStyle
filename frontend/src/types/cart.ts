export interface CartItem {
  id: number;
  productVariantId: number;
  productName: string;
  variantDetails?: string;
  price: number;
  quantity: number;
  image?: string;
  stockQuantity?: number;
}
