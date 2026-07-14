import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/layout/Navbar';
import { ChevronDown, ChevronUp, Package, Truck, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const orderStatusConfig = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  processing: { label: 'Processing', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', icon: Package },
  shipped: { label: 'Shipped', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
};

const paymentStatusConfig = {
  pending: { label: 'Belum Bayar', color: 'text-yellow-400' },
  paid: { label: 'Lunas', color: 'text-green-400' },
  failed: { label: 'Gagal', color: 'text-red-400' },
  expired: { label: 'Expired', color: 'text-gray-400' },
};

export default function AdminOrders() {
  const [user, setUser] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u.role !== 'admin') navigate('/');
      setUser(u);
    }).catch(() => navigate('/login'));
  }, []);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders-full'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders-full'] }),
  });

  const handleStatusChange = (orderId, field, value) => {
    updateMutation.mutate({ id: orderId, data: { [field]: value } });
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.order_status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || o.order_number?.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q) || o.customer_email?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="font-heading font-extrabold text-2xl text-ghost">Kelola <span className="gradient-violet-text">Pesanan</span></h1>
            <p className="text-gray-500 text-sm">{orders.length} total pesanan</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari no. pesanan atau nama..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-ghost text-sm focus:outline-none focus:border-violet-500/40 transition-all" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                <button key={status} onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                    filterStatus === status ? 'gradient-violet text-white' : 'border border-white/10 text-gray-400 hover:border-violet-500/30'
                  }`}>
                  {status === 'all' ? 'Semua' : orderStatusConfig[status]?.label || status}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="glass-card rounded-xl h-16 animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(order => {
                const status = orderStatusConfig[order.order_status] || orderStatusConfig.pending;
                const StatusIcon = status.icon;
                const isExpanded = expandedOrder === order.id;

                return (
                  <div key={order.id} className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-4 cursor-pointer hover:bg-white/2 transition-all" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-lg border text-xs font-medium flex items-center gap-1 flex-shrink-0 ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />{status.label}
                        </span>
                        <span className="text-ghost font-medium text-sm">{order.order_number}</span>
                        <span className="text-gray-500 text-xs">{order.customer_name}</span>
                        <span className="text-gray-600 text-xs hidden sm:block">
                          {order.created_date ? format(new Date(order.created_date), 'd MMM yyyy', { locale: id }) : '-'}
                        </span>
                        <div className="ml-auto flex items-center gap-3">
                          <span className={`text-xs ${paymentStatusConfig[order.payment_status]?.color || 'text-gray-400'}`}>
                            {paymentStatusConfig[order.payment_status]?.label || 'Pending'}
                          </span>
                          <span className="text-violet-400 font-semibold text-sm">Rp {(order.total_amount || 0).toLocaleString('id-ID')}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-white/5 p-5 space-y-4">
                        {/* Status controls */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-500 text-xs block mb-2">Status Pesanan</label>
                            <select
                              value={order.order_status}
                              onChange={e => handleStatusChange(order.id, 'order_status', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-ghost text-sm focus:outline-none focus:border-violet-500/40"
                            >
                              {Object.entries(orderStatusConfig).map(([val, cfg]) => (
                                <option key={val} value={val} className="bg-gray-900">{cfg.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-gray-500 text-xs block mb-2">Status Pembayaran</label>
                            <select
                              value={order.payment_status}
                              onChange={e => handleStatusChange(order.id, 'payment_status', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-ghost text-sm focus:outline-none focus:border-violet-500/40"
                            >
                              {Object.entries(paymentStatusConfig).map(([val, cfg]) => (
                                <option key={val} value={val} className="bg-gray-900">{cfg.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Order items */}
                        <div>
                          <p className="text-gray-500 text-xs mb-2">Items Pesanan:</p>
                          <div className="space-y-2">
                            {(order.items || []).map((item, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-violet-500/5 flex-shrink-0">
                                  {item.product_image ? <img src={item.product_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-violet-500/10" />}
                                </div>
                                <span className="text-ghost flex-1">{item.product_name}</span>
                                <span className="text-gray-500">{item.variant_label}</span>
                                <span className="text-gray-400">×{item.quantity}</span>
                                <span className="text-violet-400">Rp {(item.subtotal || 0).toLocaleString('id-ID')}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping */}
                        {order.shipping_address && (
                          <div className="bg-white/3 rounded-xl p-3 text-sm">
                            <p className="text-gray-500 text-xs mb-1">Alamat Pengiriman:</p>
                            <p className="text-ghost">{order.shipping_address.name} — {order.shipping_address.phone}</p>
                            <p className="text-gray-400 text-xs">{order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-600">Tidak ada pesanan ditemukan</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}