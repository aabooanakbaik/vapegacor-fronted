import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const orderStatusConfig = {
  pending: { label: 'Menunggu Pembayaran', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  processing: { label: 'Diproses', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', icon: Package },
  shipped: { label: 'Dikirim', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', icon: Truck },
  delivered: { label: 'Diterima', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
};

export default function Orders() {
  const [user, setUser] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate('/login'));
  }, []);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => user ? base44.entities.Order.filter({ user_id: user.id }, '-created_date') : [],
    enabled: !!user,
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => user ? base44.entities.CartItem.filter({ user_id: user.id }) : [],
    enabled: !!user,
  });

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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Package className="w-6 h-6 text-violet-400" />
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ghost">Pesanan Saya</h1>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="font-heading font-bold text-xl text-ghost mb-2">Belum Ada Pesanan</h2>
              <p className="text-gray-500 mb-6">Yuk, mulai belanja produk vape premium!</p>
              <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-3 gradient-violet rounded-full text-white font-medium">
                Belanja Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const status = orderStatusConfig[order.order_status] || orderStatusConfig.pending;
                const StatusIcon = status.icon;
                const isExpanded = expandedOrder === order.id;

                return (
                  <div key={order.id} className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                    {/* Order header */}
                    <div
                      className="p-5 cursor-pointer hover:bg-white/2 transition-all"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${status.bg} ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </div>
                          <span className="text-gray-500 text-sm">{order.order_number}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                      </div>

                      <div className="flex items-end justify-between mt-3">
                        <div>
                          <p className="text-gray-500 text-xs">
                            {order.created_date ? format(new Date(order.created_date), 'd MMMM yyyy', { locale: id }) : '-'}
                          </p>
                          <p className="text-ghost font-medium text-sm mt-0.5">
                            {order.items?.length || 0} item
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-xs">Total</p>
                          <p className="font-heading font-bold gradient-violet-text text-lg">
                            Rp {(order.total_amount || 0).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order details */}
                    {isExpanded && (
                      <div className="border-t border-white/5 p-5 space-y-4">
                        {/* Items */}
                        <div className="space-y-3">
                          {(order.items || []).map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-violet-500/5 border border-violet-500/10">
                                {item.product_image ? (
                                  <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-violet-500/30" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-ghost text-sm font-medium">{item.product_name}</p>
                                <p className="text-gray-500 text-xs">{item.variant_label} × {item.quantity}</p>
                              </div>
                              <p className="text-gray-400 text-sm">Rp {((item.price * item.quantity) || 0).toLocaleString('id-ID')}</p>
                            </div>
                          ))}
                        </div>

                        {/* Shipping address */}
                        {order.shipping_address && (
                          <div className="bg-white/3 rounded-xl p-4">
                            <p className="text-gray-500 text-xs mb-2 flex items-center gap-1"><Package className="w-3 h-3" /> Alamat Pengiriman</p>
                            <p className="text-ghost text-sm font-medium">{order.shipping_address.name}</p>
                            <p className="text-gray-400 text-xs">{order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}</p>
                            <p className="text-gray-500 text-xs mt-1">{order.shipping_address.phone}</p>
                          </div>
                        )}

                        {/* Payment info */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Metode: {order.payment_method || 'Virtual Account'}</span>
                          <span className={order.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'}>
                            {order.payment_status === 'paid' ? '✓ Lunas' : '⏳ Menunggu'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}