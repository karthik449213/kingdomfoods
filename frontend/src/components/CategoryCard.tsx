// ...existing code...
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface CategoryCardProps {
  name: string;
  image: string;
  slug: string;
}

export default function CategoryCard({ name, image, slug }: CategoryCardProps) {
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
    <Link href={`/menu/${slug}`} aria-label={`View ${name} category`} className="group block">
      <article
        ref={ref}
        className={
          `bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-700 ease-out ` +
          `focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ` +
          `${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`
        }
        role="region"
        aria-labelledby={`cat-${slug}`}
      >
        <div className="relative h-56 sm:h-64 md:h-52 lg:h-56 bg-gray-100">
          {!loaded && (
            <div className="absolute inset-0 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          )}

          <Image
            src={image}
            alt={name}
            fill
            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            onLoadingComplete={() => setLoaded(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />

          <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute left-4 bottom-4">
            <h3 id={`cat-${slug}`} className="text-white text-xl sm:text-2xl font-extrabold leading-tight drop-shadow-lg">
              {name}
            </h3>
            <p className="text-white/90 text-sm mt-1">Seasonal favorites & chef picks</p>
          </div>

          <div className="absolute -top-4 -right-4 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-amber-400 to-rose-400 opacity-90 blur-xl transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Curated dishes</div>

          <span className="inline-flex items-center gap-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-semibold shadow-md transition-transform duration-200 transform group-hover:translate-x-1">
            See menu →
          </span>
        </div>
      </article>
    </Link>
  );
}
// ...existing code...