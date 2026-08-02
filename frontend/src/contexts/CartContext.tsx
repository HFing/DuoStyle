import React, { createContext, useContext, useState } from 'react';

export interface CartItem {
  id?: number;
  productVariantId: number;
  productName: string;
  variantDetails?: string;
  price: number;
  quantity: number;
  image?: string | null;
  [key: string]: any;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, cartCount, setCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
