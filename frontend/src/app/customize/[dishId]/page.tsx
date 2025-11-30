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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!dish) return <div className="p-6">Dish not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-60 w-full">
          <Image src={dish.image} alt={dish.name} fill className="object-cover" />
        </div>
        <div className="p-4">
          <h1 className="text-2xl font-semibold text-gray-800">{dish.name}</h1>
          <p className="text-gray-600 mt-2">{dish.description}</p>
          <p className="text-xl font-bold text-blue-600 mt-2">${dish.price.toFixed(2)}</p>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={noSugar} onChange={(e) => setNoSugar(e.target.checked)} />
              <span>No Sugar</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={addChilli} onChange={(e) => setAddChilli(e.target.checked)} />
              <span>Add Chilli</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={extraToppings} onChange={(e) => setExtraToppings(e.target.checked)} />
              <span>Extra Toppings</span>
            </label>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes (e.g., No sugar, Extra spicy)"
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Confirm Customization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
