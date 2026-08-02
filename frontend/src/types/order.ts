export interface OrderItem {
  id?: number;
  productVariantId?: number;
  productName: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: number;
  orderCode: string;
  createdAt?: string;
  status: string;
  totalAmount: number;
  subtotalAmount?: number;
  discountAmount?: number;
  voucherCode?: string;
  phone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  items?: OrderItem[];
}
