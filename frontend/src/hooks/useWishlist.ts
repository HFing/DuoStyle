import { useState, useEffect, useCallback } from 'react';
import {
  fetchWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
  WishlistItem,
} from '../services/wishlistService';

export function useWishlist(
  user: any,
  showToast?: (message: string, type?: 'success' | 'error') => void
) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [userWishlistIds, setUserWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const reloadWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setUserWishlistIds([]);
      return;
    }
    setLoading(true);
    try {
      const items = await fetchWishlistApi();
      setWishlistItems(items);
      setUserWishlistIds(items.map((item) => item.id));
    } catch {
      setWishlistItems([]);
      setUserWishlistIds([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reloadWishlist();
  }, [reloadWishlist]);

  const toggleWishlist = async (productId: number, productName?: string): Promise<boolean> => {
    if (!user) {
      if (showToast) showToast('Vui lòng đăng nhập để lưu sản phẩm yêu thích.', 'error');
      return false;
    }

    const isFav = userWishlistIds.includes(productId);
    if (isFav) {
      const ok = await removeFromWishlistApi(productId);
      if (ok) {
        setUserWishlistIds((prev) => prev.filter((id) => id !== productId));
        setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
        if (showToast) showToast(`Đã xóa "${productName || 'Sản phẩm'}" khỏi danh mục yêu thích!`, 'success');
        return true;
      }
    } else {
      const ok = await addToWishlistApi(productId);
      if (ok) {
        setUserWishlistIds((prev) => [...prev, productId]);
        await reloadWishlist();
        if (showToast) showToast(`Đã thêm "${productName || 'Sản phẩm'}" vào danh mục yêu thích!`, 'success');
        return true;
      }
    }
    if (showToast) showToast('Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.', 'error');
    return false;
  };

  return {
    wishlistItems,
    userWishlistIds,
    loading,
    reloadWishlist,
    toggleWishlist,
  };
}
