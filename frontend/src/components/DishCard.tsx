import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

interface DishCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  description: string;
}

export default function DishCard({ id, name, image, price, rating, description }: DishCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    addToCart({ id, name, image, price, quantity: 1, customizations: { noSugar: false, addChilli: false, extraToppings: false, notes } });
    setShowModal(false);
    setNotes('');
    router.push('/cart');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-40">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <div className="flex items-center mt-2">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-600 ml-1">{rating}</span>
          </div>
          <p className="text-lg font-bold text-blue-600 mt-2">${price.toFixed(2)}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-3 rounded-md text-sm hover:bg-gray-300 transition-colors"
            >
              Customize
            </button>
            <button
              onClick={() => { addToCart({ id, name, image, price, quantity: 1, customizations: { noSugar: false, addChilli: false, extraToppings: false, notes: '' } }); router.push('/cart'); }}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Customize {name}</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes (e.g., No sugar, Extra spicy)"
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
