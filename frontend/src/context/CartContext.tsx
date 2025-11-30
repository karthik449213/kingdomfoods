'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  customizations: {
    noSugar: boolean;
    addChilli: boolean;
    extraToppings: boolean;
    notes: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity: number }) => void;
  removeFromCart: (id: string, customizations?: CartItem['customizations']) => void;
  updateQuantity: (id: string, quantity: number, customizations?: CartItem['customizations']) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const sameCustomization = (a: CartItem['customizations'] | undefined, b: CartItem['customizations'] | undefined) => {
    if (!a || !b) return false;
    return a.noSugar === b.noSugar &&
      a.addChilli === b.addChilli &&
      a.extraToppings === b.extraToppings &&
      a.notes === b.notes;
  };

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity: number }) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && sameCustomization(i.customizations, item.customizations));
      if (existing) {
        return prev.map(i =>
          i.id === item.id && sameCustomization(i.customizations, item.customizations)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item as CartItem];
    });
  };

  const removeFromCart = (id: string, customizations?: CartItem['customizations']) => {
    setItems(prev => prev.filter(item => {
      if (item.id !== id) return true;
      if (!customizations) return false;
      return !sameCustomization(item.customizations, customizations);
    }));
  };

  const updateQuantity = (id: string, quantity: number, customizations?: CartItem['customizations']) => {
    if (quantity <= 0) {
      removeFromCart(id, customizations);
      return;
    }
    setItems(prev => prev.map(item =>
      item.id === id && (!customizations || sameCustomization(item.customizations, customizations))
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
