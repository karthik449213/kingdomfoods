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
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    addToCart({ id, name, image, price, quantity: 1, customizations: { noSugar: false, addChilli: false, extraToppings: false, notes } });
    setShowModal(false);
    setNotes('');
    router.push('/cart');
  };

  const handleQuickAdd = () => {
    addToCart({ id, name, image, price, quantity: 1, customizations: { noSugar: false, addChilli: false, extraToppings: false, notes: '' } });
    router.push('/cart');
  };

  return (
    <>
      {/* Dish Card */}
      <div className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-400 overflow-hidden h-full flex flex-col animate-slideUp hover:scale-105">
        {/* Image Container */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          )}
          <Image
            src={image}
            alt={name}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoadingComplete={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 100vw, 33vw"
          />

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
            <span className="text-yellow-400 text-lg">★</span>
            <span className="text-sm font-bold text-gray-800">{rating}</span>
          </div>

          {/* Quick Add Button (visible on hover) */}
          <button
            onClick={handleQuickAdd}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <span className="bg-white text-amber-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-amber-50 transition-colors">
              Quick Add →
            </span>
          </button>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
            {name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 grow">
            {description}
          </p>

          {/* Price */}
          <div className="mb-4">
            <span className="text-3xl font-extrabold text-amber-600">₹{price.toFixed(2)}</span>
            <span className="text-xs text-gray-500 ml-2">per item</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-3 rounded-lg text-sm transition-all duration-300 transform hover:scale-105"
            >
              🎨 Customize
            </button>
            <button
              onClick={handleQuickAdd}
              className="flex-1 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              🛒 Add
            </button>
          </div>
        </div>
      </div>

      {/* Modal Backdrop & Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-amber-500 to-orange-500 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Customize Order</h3>
              <p className="text-white/90 text-sm mt-1">{name}</p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Dish Image Preview */}
              <div className="relative h-32 rounded-xl overflow-hidden mb-6 bg-gray-100">
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
              </div>

              {/* Notes Section */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., No sugar, Extra spicy, No onions..."
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none transition-all"
                  rows={4}
                />
              </div>

              {/* Price Display */}
              <div className="bg-amber-50 rounded-lg p-3 mb-6 border-2 border-amber-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Price</span>
                  <span className="text-2xl font-bold text-amber-600">₹{price.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  ✓ Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
