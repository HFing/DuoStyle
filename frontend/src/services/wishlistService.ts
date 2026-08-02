import api from '../api/axios';
import { resolveProductImage } from '../utils/product-image';

export interface WishlistItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
}

export async function fetchWishlistApi(): Promise<WishlistItem[]> {
  try {
    const response = await api.get('/wishlist');
    const rawData = response.data?.data || response.data;
    if (Array.isArray(rawData)) {
      return rawData.map((p: any) => ({
        id: Number(p.id),
        name: p.name || 'Sản phẩm',
        category: p.categoryName || p.category || 'Thời Trang',
        price: Number(p.basePrice || p.price) || 0,
        image: resolveProductImage(p.thumbnailUrl || p.image),
      }));
    }
  } catch {}
  return [];
}

export async function addToWishlistApi(productId: number | string): Promise<boolean> {
  try {
    await api.post(`/wishlist/${productId}`);
    return true;
  } catch {
    return false;
  }
}

export async function removeFromWishlistApi(productId: number | string): Promise<boolean> {
  try {
    await api.delete(`/wishlist/${productId}`);
    return true;
  } catch {
    return false;
  }
}
