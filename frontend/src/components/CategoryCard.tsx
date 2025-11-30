import Image from 'next/image';
import Link from 'next/link';

interface CategoryCardProps {
  name: string;
  image: string;
  slug: string;
}

export default function CategoryCard({ name, image, slug }: CategoryCardProps) {
  return (
    <Link href={`/menu/${slug}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="relative h-48">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
        </div>
      </div>
    </Link>
  );
}
