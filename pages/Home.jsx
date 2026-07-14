import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Zap, ArrowRight, Package, Droplets, Cpu } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

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
      toast.error('Silakan login terlebih dahulu!');
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

  const categories = [
    { icon: Cpu, label: 'Device', desc: 'Mod, Kit, Box Mod', color: 'text-violet-400', href: '/catalog?category=device', bg: 'bg-violet-500/10 border-violet-500/20' },
    { icon: Droplets, label: 'Liquid', desc: 'Salt Nic, Freebase, Pod Juice', color: 'text-pink-400', href: '/catalog?category=liquid', bg: 'bg-pink-500/10 border-pink-500/20' },
    { icon: Package, label: 'Accessories', desc: 'Coil, Cotton, Drip Tip', color: 'text-cyan-400', href: '/catalog?category=accessories', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  ];

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar cartCount={cartItems.length} />
      
      <main>
        <HeroSection />

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-px bg-violet-500" />
              <span className="text-violet-400 text-sm font-medium tracking-wider uppercase">Kategori</span>
              <div className="w-6 h-px bg-violet-500" />
            </div>
            <h2 className="font-heading font-extrabold text-3xl text-ghost">
              Temukan Produk <span className="gradient-violet-text">Favoritmu</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.map(({ icon: Icon, label, desc, color, href, bg }) => (
              <Link
                key={label}
                to={href}
                className={`glass-card glass-card-hover rounded-2xl p-6 border ${bg} group`}
              >
                <div className={`w-12 h-12 rounded-xl ${bg} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-heading font-bold text-ghost text-lg mb-1">{label}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
                <div className={`flex items-center gap-1 mt-4 ${color} text-sm font-medium`}>
                  Lihat Koleksi <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <FeaturedProducts onAddToCart={handleAddToCart} />

        {/* CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative glass-card rounded-3xl overflow-hidden border border-violet-500/20 p-8 sm:p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-transparent to-pink-600/10" />
            <div className="relative z-10">
              <div className="w-14 h-14 gradient-violet rounded-2xl flex items-center justify-center mx-auto mb-4 glow-violet">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ghost mb-3">
                Ready to <span className="shimmer-text">Level Up?</span>
              </h2>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Temukan ratusan pilihan device dan liquid premium. Pengiriman cepat, produk original bergaransi.
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-8 py-4 gradient-violet rounded-full text-white font-semibold glow-pulse-animation hover:scale-105 transition-all"
              >
                Mulai Belanja <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}