"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { API_BASE } from "@/utils/api";
import SubCategoryCard from "../../../components/SubCategoryCard";

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  console.log(categorySlug)
  // Load subcategories for the category
  const loadSubcategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/categories/${categorySlug}/subcategories`);
      setSubcategories(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (categorySlug) {
      loadSubcategories();
    }
  }, [categorySlug]);

  if (loading) return <p>Loading subcategories...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Subcategories</h1>

      {subcategories.length === 0 ? (
        <p>No subcategories available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategories.map((subcategory) => (
            <SubCategoryCard
              key={subcategory._id}
              name={subcategory.name}
              image={subcategory.image || "/placeholder.jpg"}
              categorySlug={categorySlug}
              slug={subcategory.slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
