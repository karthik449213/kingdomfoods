import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface SubCategoryCardProps {
  name: string;
  image: string;
  categorySlug: string;
  slug: string;
}

export default function SubCategoryCard({ name, image, categorySlug, slug }: SubCategoryCardProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Link href={`/menu/${categorySlug}/${slug}`} aria-label={`View ${name} subcategory`} className="group block">
      <article
        ref={ref}
        className={`bg-white rounded-2xl shadow-md overflow-hidden transform transition-all duration-600 ease-out focus:outline-none ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
        aria-labelledby={`subcat-${slug}`}
      >
        <div className="relative h-44 sm:h-48 bg-gray-100">
          {!loaded && <div className="absolute inset-0 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />}

          <Image src={image} alt={name} fill className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`} onLoadingComplete={() => setLoaded(true)} sizes="(max-width: 640px) 100vw, 33vw" />

          <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

          <div className="absolute left-4 bottom-4">
            <h4 id={`subcat-${slug}`} className="text-white text-lg font-bold drop-shadow-sm">{name}</h4>
            <p className="text-white/90 text-xs mt-1">Popular picks</p>
          </div>
        </div>

        <div className="p-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">{/* optional subtitle */}</span>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500 text-white rounded-md text-sm font-medium shadow-sm transition-transform duration-200 transform group-hover:translate-x-1">
            View →
          </span>
        </div>
      </article>
    </Link>
  );
}
