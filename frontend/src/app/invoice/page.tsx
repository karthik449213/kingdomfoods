"use client";

import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useState } from "react";

export default function InvoicePage() {
  const { items, getTotal } = useCart();
  const PHONE = "917075543886";
  const [copied, setCopied] = useState(false);

  const formatCustomizations = (customizations: { noSugar?: boolean; addChilli?: boolean; extraToppings?: boolean; notes?: string }) => {
    const parts = [];
    if (customizations.noSugar) parts.push("No sugar");
    if (customizations.addChilli) parts.push("Add chilli");
    if (customizations.extraToppings) parts.push("Extra toppings");
    if (customizations.notes) parts.push(customizations.notes);
    return parts.length > 0 ? parts.join(", ") : "None";
  };

  const generateMessage = () => {
    let message = "Hello, I want to place this order:\n";
    items.forEach((item) => {
      const custom = formatCustomizations(item.customizations);
      message += `• ${item.name} (Qty: ${item.quantity}`;
      if (custom !== "None") message += `, ${custom}`;
      message += ")\n";
    });
    message += `\nTotal: ₹${getTotal()}`;
    return message;
  };

  const handleWhatsAppOrder = () => {
    const message = encodeURIComponent(generateMessage());
    window.location.href = `https://wa.me/${PHONE}?text=${message}`;
  };

  const handleCall = () => {
    window.location.href = `tel:+91${PHONE}`;
  };

  const handleCopyOrder = () => {
    navigator.clipboard.writeText(generateMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-orange-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-block bg-linear-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-3">
            Order Invoice
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Order Summary</h1>
          <p className="text-gray-600">Review your order before confirming</p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-gray-600 text-lg">Your cart is empty</p>
            <Link href="/menu" className="mt-4 inline-block bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Order Items */}
            <div className="space-y-3 mb-8">
              {items.map((item, idx) => (
                <div
                  key={`${item.id}-${JSON.stringify(item.customizations)}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-gray-100 animate-slideUp"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Qty: <span className="font-semibold">{item.quantity}</span></p>
                    </div>
                    <span className="text-xl font-bold text-amber-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {formatCustomizations(item.customizations) !== "None" && (
                    <div className="bg-amber-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                      <span className="font-semibold">Customizations:</span> {formatCustomizations(item.customizations)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border-2 border-amber-200 animate-slideUp" style={{ animationDelay: '150ms' }}>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="h-px bg-gray-200"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total Amount</span>
                <span className="text-3xl font-extrabold bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">₹{getTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <button
                onClick={handleWhatsAppOrder}
                className="w-full bg-linear-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>📱</span>
                <span>WhatsApp Order</span>
              </button>
              <button
                onClick={handleCall}
                className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>☎️</span>
                <span>Call Restaurant</span>
              </button>
            </div>

            {/* Secondary Action */}
            <button
              onClick={handleCopyOrder}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              {copied ? "✓ Order copied to clipboard" : "Copy Order Details"}
            </button>
          </>
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
