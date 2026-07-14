import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ShoppingCart, ArrowLeft, Check, Star, Package, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';

const flavorTagColors = {
  'Icy': 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  'Fruity': 'text-green-400 bg-green-400/10 border-green-400/30',
  'Creamy': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  'Tobacco': 'text-amber-500 bg-amber-500/10 border-amber-500/30',
  'Menthol': 'text-teal-400 bg-teal-400/10 border-teal-400/30',
};

export default function ProductDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [selectedMg, setSelectedMg] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  // Reset state & scroll to top when ID changes (user clicks different product)
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedFlavor(null);
    setSelectedMg(null);
    setQty(1);
    setActiveImg(0);
  }, [id]);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => base44.entities.Product.filter({ id }),
    select: data => data[0],
  });

  const { data: variants = [] } = useQuery({
    queryKey: ['variants', id],
    queryFn: () => base44.entities.ProductVariant.filter({ product_id: id }),
    enabled: !!id,
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => user ? base44.entities.CartItem.filter({ user_id: user.id }) : [],
    enabled: !!user,
  });

  const createCartMutation = useMutation({
    mutationFn: (data) => base44.entities.CartItem.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const availableVariants = variants.filter(v => v.is_available);
  const uniqueFlavors = [...new Set(availableVariants.map(v => v.flavor).filter(Boolean))];
  const uniqueMg = [...new Set(availableVariants.map(v => v.nicotine_mg).filter(Boolean))];

  const selectedVariant = availableVariants.find(v => {
    const flavorMatch = !selectedFlavor || v.flavor === selectedFlavor;
    const mgMatch = !selectedMg || v.nicotine_mg === selectedMg;
    return flavorMatch && mgMatch;
  }) || (availableVariants.length > 0 ? availableVariants[0] : null);

  const price = ((product?.base_price || 0) + (selectedVariant?.additional_price || 0)) * qty;

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu!', {
        style: { background: '#0D0D12', border: '1px solid rgba(239,68,68,0.3)', color: '#F9FAFB' }
      });
      return;
    }
    const unitPrice = (product?.base_price || 0) + (selectedVariant?.additional_price || 0);
    const variantLabel = selectedVariant ? `${selectedVariant.flavor || ''} ${selectedVariant.nicotine_mg || ''}`.trim() : 'Standard';
    const existing = cartItems.find(c => c.product_id === id && c.variant_id === (selectedVariant?.id || ''));
    if (existing) {
      await base44.entities.CartItem.update(existing.id, { quantity: existing.quantity + qty });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } else {
      await createCartMutation.mutateAsync({
        user_id: user.id,
        product_id: id,
        variant_id: selectedVariant?.id || '',
        product_name: product?.name,
        variant_label: variantLabel,
        product_image: product?.images?.[0] || '',
        price: unitPrice,
        quantity: qty,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toast.success(`${product?.name} ditambahkan ke keranjang!`, {
      style: { background: '#0D0D12', border: '1px solid rgba(139,92,246,0.3)', color: '#F9FAFB' }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-500">
        Produk tidak ditemukan
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [null];

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar cartCount={cartItems.length} />
      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link to="/catalog" className="inline-flex items-center gap-2 text-gray-500 hover:text-violet-400 text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
          </Link>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: Images */}
            <div className="space-y-3">
              {/* Main image */}
              <div className="aspect-square glass-card rounded-2xl overflow-hidden border border-violet-500/10">
                {images[activeImg] ? (
                  <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-950/20 to-black">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-3">
                        <Package className="w-12 h-12 text-violet-500/30" />
                      </div>
                      <p className="text-gray-600 text-sm">No image</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImg === i ? 'border-violet-500 glow-violet-sm' : 'border-white/10 hover:border-violet-500/40'
                      }`}
                    >
                      {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-violet-500/10" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product info (sticky) */}
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs">{product.brand}</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-500 text-xs capitalize">{product.category}</span>
                </div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ghost leading-tight mb-3">{product.name}</h1>
                
                {/* Flavor tags */}
                {product.flavor_tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {product.flavor_tags.map(tag => (
                      <span key={tag} className={`px-2.5 py-1 rounded-full border text-xs font-medium ${flavorTagColors[tag] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="font-heading font-bold text-3xl gradient-violet-text">
                  Rp {((product.base_price || 0) + (selectedVariant?.additional_price || 0)).toLocaleString('id-ID')}
                </p>
              </div>

              {/* Flavor selector */}
              {uniqueFlavors.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-2">Rasa:</p>
                  <div className="flex gap-2 flex-wrap">
                    {uniqueFlavors.map(flavor => (
                      <button
                        key={flavor}
                        onClick={() => setSelectedFlavor(selectedFlavor === flavor ? null : flavor)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          selectedFlavor === flavor
                            ? 'border-violet-500/60 text-violet-300 bg-violet-500/15 glow-violet-sm'
                            : 'border-white/10 text-gray-400 hover:border-violet-500/30 hover:text-ghost'
                        }`}
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mg selector */}
              {uniqueMg.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-2">Kadar Nikotin:</p>
                  <div className="flex gap-2 flex-wrap">
                    {uniqueMg.map(mg => (
                      <button
                        key={mg}
                        onClick={() => setSelectedMg(selectedMg === mg ? null : mg)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                          selectedMg === mg
                            ? 'border-pink-500/60 text-pink-300 bg-pink-500/15'
                            : 'border-white/10 text-gray-400 hover:border-pink-500/30 hover:text-ghost'
                        }`}
                      >
                        {mg}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock info */}
              {selectedVariant && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedVariant.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className={selectedVariant.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                    {selectedVariant.stock > 0 ? `Stok: ${selectedVariant.stock}` : 'Stok Habis'}
                  </span>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <p className="text-gray-400 text-sm">Jumlah:</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 rounded-lg border border-white/10 text-gray-400 hover:border-violet-500/40 hover:text-ghost transition-all flex items-center justify-center text-lg"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-ghost font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(selectedVariant?.stock || 99, qty + 1))}
                    className="w-8 h-8 rounded-lg border border-white/10 text-gray-400 hover:border-violet-500/40 hover:text-ghost transition-all flex items-center justify-center text-lg"
                  >
                    +
                  </button>
                </div>
                <p className="text-gray-500 text-sm">
                  Total: <span className="text-ghost font-semibold">Rp {price.toLocaleString('id-ID')}</span>
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={handleAddToCart}
                disabled={selectedVariant?.stock === 0}
                className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 ${
                  added
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                    : selectedVariant?.stock === 0
                    ? 'bg-white/5 border border-white/10 text-gray-600 cursor-not-allowed'
                    : 'gradient-violet text-white glow-pulse-animation hover:scale-[1.02]'
                }`}
              >
                {added ? (
                  <><Check className="w-5 h-5" /> Ditambahkan!</>
                ) : selectedVariant?.stock === 0 ? (
                  'Stok Habis'
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Tambah ke Keranjang</>
                )}
              </button>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, text: '100% Original', color: 'text-violet-400' },
                  { icon: Zap, text: 'Fast Delivery', color: 'text-cyan-400' },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-2 glass-card rounded-xl p-3 border border-white/5">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-gray-400 text-xs">{text}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="font-heading font-semibold text-ghost mb-2">Deskripsi</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}