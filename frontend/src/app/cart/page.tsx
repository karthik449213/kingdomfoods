"use client";

import { useCart } from "../../context/CartContext";
import CartItem from "../../components/CartItem";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const { items, getTotal } = useCart();
  const router = useRouter();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Shopping Cart</h1>
              <p className="text-gray-600">{itemCount} items in your cart</p>
            </div>
            <Link href="/menu" className="text-amber-600 hover:text-amber-700 font-semibold underline">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start adding delicious dishes to your order!</p>
            <Link
              href="/menu"
              className="inline-block bg-linear-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Explore Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div
                    key={`${item.id}-${JSON.stringify(item.customizations)}`}
                    className="animate-slideUp"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <CartItem item={item} />
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-6 sticky top-20 border-2 border-blue-100 animate-slideUp" style={{ animationDelay: '100ms' }}>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="h-px bg-gray-200"></div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-extrabold bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">₹{getTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => router.push("/invoice")}
                  className="w-full bg-linear-to-r from-amber-500 to-orange-500 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 mb-3"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => router.push("/menu")}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
                  <p className="mb-2">✓ <strong>Free delivery</strong> on all orders</p>
                  <p>✓ <strong>Fresh ingredients</strong> guarantee</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
