"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import CategoryCard from "../components/CategoryCard";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load categories
  const loadCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading) return <p>Loading categories...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Menu Categories</h1>

      {categories.length === 0 ? (
        <p>No categories available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category._id}
              name={category.name}
              image={category.image || "/placeholder.jpg"}
              slug={category.slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
