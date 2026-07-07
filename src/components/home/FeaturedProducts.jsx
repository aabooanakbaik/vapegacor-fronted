import { Link } from 'react-router-dom';
import { Star, ShoppingCart, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ProductCard from '@/components/catalog/ProductCard';

export default function FeaturedProducts({ onAddToCart }) {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => base44.entities.Product.filter({ is_featured: true, is_active: true }, '-created_date', 8),
  });

  const flavorTagColors = {
    'Icy': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    'Fruity': 'text-green-400 bg-green-400/10 border-green-400/20',
    'Creamy': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'Tobacco': 'text-amber-600 bg-amber-600/10 border-amber-600/20',
    'Menthol': 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  };

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-px bg-violet-500" />
            <span className="text-violet-400 text-sm font-medium tracking-wider uppercase">Produk Unggulan</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ghost">
            Pilihan <span className="gradient-violet-text">Terbaik</span>
          </h2>
        </div>
        <Link to="/catalog" className="hidden sm:flex items-center gap-1.5 text-violet-400 text-sm hover:text-violet-300 transition-colors group">
          Lihat Semua <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>Belum ada produk unggulan. Tambahkan produk di panel admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}

      <div className="text-center mt-8 sm:hidden">
        <Link to="/catalog" className="inline-flex items-center gap-1.5 text-violet-400 text-sm">
          Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}