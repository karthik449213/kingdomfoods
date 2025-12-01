'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { getDish } from '@/utils/api';
import { useCart } from '@/context/CartContext';

interface Dish {
  _id: string;
  name: string;
  price: number;
  description: string;
  stars?: number;
  image: string;
}

export default function CustomizeDishPage() {
  const router = useRouter();
  const params = useParams();
  const dishId = params?.dishId as string;

  const { addToCart } = useCart();

  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [noSugar, setNoSugar] = useState(false);
  const [addChilli, setAddChilli] = useState(false);
  const [extraToppings, setExtraToppings] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        const data = await getDish(dishId);
        if (!ignore) setDish(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load dish');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    if (dishId) run();
    return () => { ignore = true; };
  }, [dishId]);

  const onConfirm = () => {
    if (!dish) return;
    addToCart({
      id: dish._id,
      name: dish.name,
      image: dish.image,
      price: dish.price,
      quantity: 1,
      customizations: { noSugar, addChilli, extraToppings, notes }
    });
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dish details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-amber-600 hover:text-amber-700 font-semibold underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Dish not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-amber-600 hover:text-amber-700 font-semibold underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2 transition-colors"
        >
          ← Back
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-slideUp">
          {/* Image Section */}
          <div className="relative h-80 bg-gray-100 overflow-hidden">
            <Image
              src={dish.image}
              alt={dish.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <span className="inline-block bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                ⭐ {dish.stars || 4.5}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Title & Price */}
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{dish.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">{dish.description}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-amber-600">₹{dish.price.toFixed(2)}</span>
                <span className="text-sm text-gray-500">for 1 portion</span>
              </div>
            </div>

            <div className="h-px bg-gray-200 my-6"></div>

            {/* Customization Options */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customize Your Order</h3>

              <div className="space-y-3">
                {[
                  { state: noSugar, setState: setNoSugar, label: 'No Sugar', icon: '🍬' },
                  { state: addChilli, setState: setAddChilli, label: 'Add Chilli', icon: '🌶️' },
                  { state: extraToppings, setState: setExtraToppings, label: 'Extra Toppings', icon: '✨' },
                ].map((opt, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all duration-200"
                  >
                    <input
                      type="checkbox"
                      checked={opt.state}
                      onChange={(e) => opt.setState(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-amber-600 cursor-pointer accent-amber-600"
                    />
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="font-semibold text-gray-900">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Special Instructions</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special requests (e.g., extra spicy, no onions, etc.)"
                className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none transition-all"
                rows={4}
              />
            </div>

            {/* Summary Box */}
            <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-8 border-2 border-amber-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Subtotal</span>
                <span className="text-2xl font-bold text-amber-600">₹{dish.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => router.back()}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 px-6 rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-linear-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                ✓ Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
