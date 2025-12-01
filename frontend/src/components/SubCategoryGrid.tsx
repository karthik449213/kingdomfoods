import React from 'react';
import SubCategoryCard from './SubCategoryCard';

interface SubCategory {
  name: string;
  image: string;
  slug: string;
}

interface SubCategoryGridProps {
  subcategories: SubCategory[];
  title?: string;
}

export default function SubCategoryGrid({ subcategories, title = 'Subcategories' }: SubCategoryGridProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-extrabold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">Refine your choices</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-stretch">
        {subcategories.map((s) => (
          <SubCategoryCard key={s.slug} name={s.name} image={s.image} categorySlug={''} slug={s.slug} />
        ))}
      </div>
    </section>
  );
}
