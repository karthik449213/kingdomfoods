"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import DishCard from "../../../../components/DishCard";

export default function SubcategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const subcategorySlug = params.subcategory as string;
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dishes for the subcategory
  const loadDishes = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/categories/${categorySlug}/subcategories/${subcategorySlug}/dishes`);
      setDishes(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (categorySlug && subcategorySlug) {
      loadDishes();
    }
  }, [categorySlug, subcategorySlug]);

  if (loading) return <p>Loading dishes...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Dishes</h1>

      {dishes.length === 0 ? (
        <p>No dishes available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <DishCard
              key={dish._id}
              id={dish._id}
              name={dish.name}
              description={dish.description}
              price={dish.price}
              image={dish.image || "/placeholder.jpg"}
              rating={dish.rating || 4.5}
            />
          ))}
        </div>
      )}
    </div>
  );
}
