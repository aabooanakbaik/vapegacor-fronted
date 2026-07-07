import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const flavorTagColors = {
  'Icy': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  'Fruity': 'text-green-400 bg-green-400/10 border-green-400/20',
  'Creamy': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  'Tobacco': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  'Menthol': 'text-teal-400 bg-teal-400/10 border-teal-400/20',
};

const categoryLabels = {
  device: 'Device',
  liquid: 'Liquid',
  accessories: 'Aksesoris',
  pod: 'Pod System',
  coil: 'Coil',
};

export default function ProductCard({ product, onAddToCart }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adding, setAdding] = useState(false);

  const { data: variants = [] } = useQuery({
    queryKey: ['variants', product.id],
    queryFn: () => base44.entities.ProductVariant.filter({ product_id: product.id }),
    staleTime: 60000,
  });

  const availableVariants = variants.filter(v => v.is_available && v.stock > 0);
  const activeVariant = selectedVariant || (availableVariants.length > 0 ? availableVariants[0] : null);
  const price = (product.base_price || 0) + (activeVariant?.additional_price || 0);
  const image = product.images?.[0];

  console.log(product.images);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await onAddToCart?.(product, activeVariant);
    setTimeout(() => setAdding(false), 1000);
  };

  const uniqueFlavors = [...new Set(availableVariants.map(v => v.flavor).filter(Boolean))].slice(0, 3);
  const uniqueMg = [...new Set(availableVariants.map(v => v.nicotine_mg).filter(Boolean))].slice(0, 3);

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div className="glass-card glass-card-hover rounded-2xl overflow-hidden h-full flex flex-col">
        {/* Image area */}
        <div className="relative aspect-square bg-gradient-to-br from-violet-950/40 to-black/60 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-2">
                  <ShoppingCart className="w-7 h-7 text-violet-500/40" />
                </div>
              </div>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-gray-400 text-xs">
              {categoryLabels[product.category] || product.category}
            </span>
          </div>

          {/* Flavor tags */}
          {product.flavor_tags?.length > 0 && (
            <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
              {product.flavor_tags.slice(0, 2).map(tag => (
                <span key={tag} className={`px-1.5 py-0.5 rounded-md border text-xs ${flavorTagColors[tag] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-violet-400 text-xs font-medium mb-1">{product.brand}</p>
          <h3 className="font-heading font-semibold text-ghost text-sm leading-snug mb-2 line-clamp-2 group-hover:text-violet-200 transition-colors">
            {product.name}
          </h3>

          {/* Quick variant selector */}
          {uniqueFlavors.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-2">
              {uniqueFlavors.map(flavor => (
                <button
                  key={flavor}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const variant = availableVariants.find(v => v.flavor === flavor);
                    setSelectedVariant(variant || null);
                  }}
                  className={`px-2 py-0.5 rounded-md text-xs border transition-all ${
                    (activeVariant?.flavor === flavor)
                      ? 'border-violet-500/60 text-violet-400 bg-violet-500/10'
                      : 'border-white/10 text-gray-500 hover:border-violet-500/30 hover:text-gray-300'
                  }`}
                >
                  {flavor.length > 10 ? flavor.substring(0, 10) + '…' : flavor}
                </button>
              ))}
            </div>
          )}

          {uniqueMg.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-3">
              {uniqueMg.map(mg => (
                <button
                  key={mg}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const variant = availableVariants.find(v => v.nicotine_mg === mg && (!selectedVariant?.flavor || v.flavor === selectedVariant?.flavor));
                    setSelectedVariant(variant || null);
                  }}
                  className={`px-2 py-0.5 rounded-md text-xs border transition-all ${
                    (activeVariant?.nicotine_mg === mg)
                      ? 'border-pink-500/60 text-pink-400 bg-pink-500/10'
                      : 'border-white/10 text-gray-500 hover:border-pink-500/30 hover:text-gray-300'
                  }`}
                >
                  {mg}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-auto">
            <div>
              <p className="font-heading font-bold text-ghost text-base">
                Rp {price.toLocaleString('id-ID')}
              </p>
              {activeVariant && (
                <p className="text-gray-600 text-xs">
                  Stok: {activeVariant.stock}
                </p>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                adding
                  ? 'gradient-violet glow-violet-sm'
                  : 'border border-violet-500/30 text-violet-400 hover:gradient-violet hover:text-white hover:border-transparent hover:glow-violet-sm'
              }`}
            >
              {adding ? (
                <Plus className="w-4 h-4 text-white" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}