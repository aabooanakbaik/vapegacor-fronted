import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      navigate('/login');
    });
  }, []);

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => user ? base44.entities.CartItem.filter({ user_id: user.id }) : [],
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, qty }) => base44.entities.CartItem.update(id, { quantity: qty }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CartItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const handleQtyChange = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      deleteMutation.mutate(item.id);
    } else {
      updateMutation.mutate({ id: item.id, qty: newQty });
    }
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
    toast.success('Item dihapus', {
      style: { background: '#0D0D12', border: '1px solid rgba(139,92,246,0.3)', color: '#F9FAFB' }
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal >= 300000 ? 0 : 15000;
  const total = subtotal + shippingCost;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar cartCount={cartItems.length} />
      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <ShoppingCart className="w-6 h-6 text-violet-400" />
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ghost">Keranjang Belanja</h1>
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm">{cartItems.length}</span>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="font-heading font-bold text-xl text-ghost mb-2">Keranjang Kosong</h2>
              <p className="text-gray-500 mb-6">Yuk, tambahkan produk ke keranjangmu!</p>
              <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-3 gradient-violet rounded-full text-white font-medium">
                Mulai Belanja <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Items list */}
              <div className="lg:col-span-2 space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="glass-card rounded-2xl p-4 border border-white/5 flex gap-4 items-center">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-violet-500/5 border border-violet-500/10">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-7 h-7 text-violet-500/30" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-ghost text-sm truncate">{item.product_name}</h3>
                      {item.variant_label && (
                        <p className="text-gray-500 text-xs mt-0.5">{item.variant_label}</p>
                      )}
                      <p className="text-violet-400 font-semibold text-sm mt-1">
                        Rp {(item.price || 0).toLocaleString('id-ID')}
                      </p>
                    </div>

                    {/* Qty control */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQtyChange(item, -1)}
                        className="w-7 h-7 rounded-lg border border-white/10 text-gray-400 hover:border-violet-500/40 hover:text-ghost transition-all flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-ghost font-semibold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item, 1)}
                        className="w-7 h-7 rounded-lg border border-white/10 text-gray-400 hover:border-violet-500/40 hover:text-ghost transition-all flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <p className="text-ghost font-semibold text-sm w-20 text-right hidden sm:block">
                      Rp {((item.price || 0) * item.quantity).toLocaleString('id-ID')}
                    </p>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <Link to="/catalog" className="inline-flex items-center gap-2 text-violet-400 text-sm hover:text-violet-300 transition-colors mt-2">
                  <ArrowLeft className="w-3.5 h-3.5" /> Lanjut Belanja
                </Link>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <div className="glass-card rounded-2xl p-5 border border-violet-500/15">
                  <h2 className="font-heading font-bold text-ghost mb-4">Ringkasan Pesanan</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal ({cartItems.length} item)</span>
                      <span className="text-ghost">Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Ongkos Kirim</span>
                      <span className={shippingCost === 0 ? 'text-green-400' : 'text-ghost'}>
                        {shippingCost === 0 ? 'GRATIS' : `Rp ${shippingCost.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                    {subtotal < 300000 && (
                      <p className="text-gray-600 text-xs">Belanja Rp {(300000 - subtotal).toLocaleString('id-ID')} lagi untuk gratis ongkir!</p>
                    )}
                    <div className="border-t border-white/10 pt-3 flex justify-between">
                      <span className="text-ghost font-semibold">Total</span>
                      <span className="font-heading font-bold text-lg gradient-violet-text">
                        Rp {total.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    state={{ cartItems, subtotal, shippingCost, total }}
                    className="w-full mt-4 py-3.5 gradient-violet rounded-xl text-white font-semibold text-center flex items-center justify-center gap-2 hover:scale-[1.02] transition-all glow-violet-sm"
                  >
                    Checkout <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="glass-card rounded-xl p-4 border border-white/5 text-xs text-gray-500 space-y-1">
                  <p>✓ Pembayaran aman & terenkripsi</p>
                  <p>✓ Produk 100% original bergaransi</p>
                  <p>✓ Gratis ongkir min. Rp 300.000</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}