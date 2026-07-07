import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/catalog/ProductCard';
import CategoryFilter from '@/components/catalog/CategoryFilter';
import { toast } from 'sonner';
import { SlidersHorizontal } from 'lucide-react';

export default function Catalog() {
  const [user, setUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    // Read URL params
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat && cat !== 'all') setActiveCategory(cat);
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }),
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => user ? base44.entities.CartItem.filter({ user_id: user.id }) : [],
    enabled: !!user,
  });

  const createCartItemMutation = useMutation({
    mutationFn: (data) => base44.entities.CartItem.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const handleAddToCart = async (product, variant) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu!', {
        style: { background: '#0D0D12', border: '1px solid rgba(239,68,68,0.3)', color: '#F9FAFB' }
      });
      return;
    }
    const price = (product.base_price || 0) + (variant?.additional_price || 0);
    const variantLabel = variant ? `${variant.flavor || ''} ${variant.nicotine_mg || ''}`.trim() : 'Standard';
    const existing = cartItems.find(c => c.product_id === product.id && c.variant_id === (variant?.id || ''));
    if (existing) {
      await base44.entities.CartItem.update(existing.id, { quantity: existing.quantity + 1 });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } else {
      await createCartItemMutation.mutateAsync({
        user_id: user.id,
        product_id: product.id,
        variant_id: variant?.id || '',
        product_name: product.name,
        variant_label: variantLabel,
        product_image: product.images?.[0] || '',
        price,
        quantity: 1,
      });
    }
    toast.success('Ditambahkan ke keranjang!', {
      style: { background: '#0D0D12', border: '1px solid rgba(139,92,246,0.3)', color: '#F9FAFB' }
    });
  };

  // Filter & sort
  let filtered = allProducts.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'base_price') return (a.base_price || 0) - (b.base_price || 0);
    if (sortBy === '-base_price') return (b.base_price || 0) - (a.base_price || 0);
    if (sortBy === '-total_sold') return (b.total_sold || 0) - (a.total_sold || 0);
    return new Date(b.created_date) - new Date(a.created_date);
  });

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar cartCount={cartItems.length} />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-px bg-violet-500" />
              <span className="text-violet-400 text-sm font-medium tracking-wider uppercase">Katalog</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ghost">
              Semua <span className="gradient-violet-text">Produk</span>
            </h1>
          </div>

          {/* Filters */}
          <div className="mb-8 glass-card rounded-2xl p-4 border border-white/5">
            <CategoryFilter
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-gray-500 text-sm">
              {isLoading ? 'Memuat...' : `${filtered.length} produk ditemukan`}
            </p>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="glass-card rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal className="w-7 h-7 text-gray-600" />
              </div>
              <p className="text-gray-500 text-lg mb-2">Produk tidak ditemukan</p>
              <p className="text-gray-600 text-sm">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}