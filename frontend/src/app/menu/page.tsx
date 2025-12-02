"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import CategoryCard from "../../components/CategoryCard";
import Link from "next/link";
import { API_BASE } from "@/utils/api";
interface Category {
  _id: string;
  name: string;
  image?: string;
  slug: string;
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center animate-fadeIn">
          <div className="inline-block bg-linear-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
            🍽️ Explore Our Menu
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3">
            Choose Your Favorite Category
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Browse through our curated selection of delicious dishes prepared fresh with the finest ingredients
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No categories available</h2>
            <p className="text-gray-600 mb-6">Check back soon for our menu updates!</p>
            <Link
              href="/"
              className="inline-block bg-linear-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Go Home
            </Link>
          </div>
        ) : (
          <>
            {/* Categories Grid */}
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-12">
              {categories.map((category, idx) => {
                const slug = category.slug || category.name?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
                return (
                  <div
                    key={category._id}
                    className="animate-slideUp"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <CategoryCard
                      name={category.name}
                      image={category.image || "/placeholder.jpg"}
                      slug={slug}
                    />
                  </div>
                );
              })}
            </div>

            {/* CTA Section */}
            <div className="bg-linear-to-r from-amber-500 to-orange-500 rounded-3xl p-12 text-center text-white shadow-lg">
              <h2 className="text-3xl font-bold mb-3">Special Offer!</h2>
              <p className="text-lg text-white/90 mb-6">Order now and enjoy free delivery on your first purchase</p>
              <Link
                href="/"
                className="inline-block bg-white text-amber-600 font-bold px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Back to Home
              </Link>
            </div>
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
