"use client";

import { useCart } from "../../context/CartContext";
import CartItem from "../../components/CartItem";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, getTotal } = useCart();
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <CartItem key={`${item.id}-${JSON.stringify(item.customizations)}`} item={item} />
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold">Total:</span>
            <span className="text-xl font-bold text-blue-600">${getTotal().toFixed(2)}</span>
          </div>
          <button
            onClick={() => router.push('/invoice')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Proceed to Invoice
          </button>
        </div>
      )}
    </div>
  );
}
