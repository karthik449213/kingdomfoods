import React from 'react';
import CategoryCard from './CategoryCard';

interface Category {
  name: string;
  image: string;
  slug: string;
}

interface CategoryGridProps {
  categories: Category[];
  title?: string;
}

export default function CategoryGrid({ categories, title = 'Menu Categories' }: CategoryGridProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">Hand-picked categories for every taste</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-stretch">
        {categories.map((c) => (
          <CategoryCard key={c.slug} name={c.name} image={c.image} slug={c.slug} />
        ))}
      </div>
    </section>
  );
}
