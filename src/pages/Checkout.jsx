import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/layout/Navbar';
import { MapPin, CreditCard, CheckCircle, Loader2, Package, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1); // 1: address, 2: payment, 3: success
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('va_bca');

  const [address, setAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setAddress(a => ({ ...a, name: u.full_name || '', phone: u.phone || '' }));
    }).catch(() => navigate('/login'));
  }, []);

  if (!state?.cartItems?.length) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Keranjang kosong</p>
          <Link to="/catalog" className="text-violet-400 hover:text-violet-300">Kembali Belanja</Link>
        </div>
      </div>
    );
  }

  const { cartItems, subtotal, shippingCost, total } = state;

  const handleSubmitAddress = (e) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.address || !address.city || !address.province) {
      toast.error('Lengkapi semua data pengiriman!');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    const orderNumber = `VG-${Date.now()}`;
    const items = cartItems.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      variant_label: item.variant_label,
      product_image: item.product_image,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    try {
      const order = await base44.entities.Order.create({
        user_id: user.id,
        customer_name: user.full_name,
        customer_email: user.email,
        customer_phone: address.phone,
        items,
        subtotal,
        shipping_cost: shippingCost,
        total_amount: total,
        shipping_address: address,
        payment_status: 'pending',
        order_status: 'pending',
        order_number: orderNumber,
        payment_gateway_ref: `SIM-${orderNumber}`,
        payment_method: paymentMethod,
      });

      // Clear cart
      await Promise.all(cartItems.map(item => base44.entities.CartItem.delete(item.id)));
      queryClient.invalidateQueries({ queryKey: ['cart'] });

      setStep(3);
    } catch (err) {
      toast.error('Gagal membuat pesanan. Coba lagi.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar cartCount={0} />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Steps */}
          {step < 3 && (
            <div className="flex items-center gap-4 mb-8">
              {[
                { n: 1, label: 'Alamat', icon: MapPin },
                { n: 2, label: 'Pembayaran', icon: CreditCard },
                { n: 3, label: 'Selesai', icon: CheckCircle },
              ].map(({ n, label, icon: Icon }, i) => (
                <div key={n} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    step >= n ? 'gradient-violet text-white glow-violet-sm' : 'bg-white/5 border border-white/10 text-gray-500'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                  {i < 2 && <div className="w-8 h-px bg-white/10" />}
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                  <h2 className="font-heading font-bold text-ghost text-xl mb-5 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-violet-400" /> Alamat Pengiriman
                  </h2>
                  <form onSubmit={handleSubmitAddress} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm block mb-1.5">Nama Penerima</label>
                        <input value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ghost text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                          placeholder="Nama lengkap" required />
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm block mb-1.5">No. Handphone</label>
                        <input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ghost text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                          placeholder="08xxxxxxxxxx" required />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm block mb-1.5">Alamat Lengkap</label>
                      <textarea value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ghost text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none h-20"
                        placeholder="Jalan, No. Rumah, RT/RW, Kelurahan" required />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm block mb-1.5">Kota</label>
                        <input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ghost text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                          placeholder="Jakarta" required />
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm block mb-1.5">Provinsi</label>
                        <input value={address.province} onChange={e => setAddress({ ...address, province: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ghost text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                          placeholder="DKI Jakarta" required />
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm block mb-1.5">Kode Pos</label>
                        <input value={address.postal_code} onChange={e => setAddress({ ...address, postal_code: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ghost text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                          placeholder="12345" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3.5 gradient-violet rounded-xl text-white font-semibold mt-2 hover:scale-[1.01] transition-all glow-violet-sm">
                      Lanjut ke Pembayaran
                    </button>
                  </form>
                </div>
              </div>
              <OrderSummary cartItems={cartItems} subtotal={subtotal} shippingCost={shippingCost} total={total} />
            </div>
          )}

          {step === 2 && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-violet-400 text-sm transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Ubah Alamat
                </button>
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                  <h2 className="font-heading font-bold text-ghost text-xl mb-5 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-violet-400" /> Metode Pembayaran
                  </h2>
                  <div className="space-y-3">
                    {[
                      { id: 'va_bca', label: 'BCA Virtual Account', desc: 'Transfer via ATM/Mobile Banking' },
                      { id: 'va_mandiri', label: 'Mandiri Virtual Account', desc: 'Transfer via ATM/Mobile Banking' },
                      { id: 'va_bni', label: 'BNI Virtual Account', desc: 'Transfer via ATM/Mobile Banking' },
                      { id: 'qris', label: 'QRIS', desc: 'Bayar dengan GoPay, OVO, Dana, dll' },
                    ].map(method => (
                      <div key={method.id} onClick={() => setPaymentMethod(method.id)} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all group ${paymentMethod === method.id ? 'border-violet-500/50 bg-violet-500/5' : 'border-white/10 hover:border-violet-500/30'}`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${paymentMethod === method.id ? 'border-violet-500' : 'border-gray-600'}`}>
                          {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-violet-500" />}
                        </div>
                        <div>
                          <p className={`text-sm font-medium transition-colors ${paymentMethod === method.id ? 'text-violet-300' : 'text-ghost'}`}>{method.label}</p>
                          <p className="text-gray-500 text-xs">{method.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full mt-5 py-3.5 gradient-violet rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] transition-all glow-violet-sm disabled:opacity-50"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : 'Konfirmasi Pesanan'}
                  </button>
                </div>
              </div>
              <OrderSummary cartItems={cartItems} subtotal={subtotal} shippingCost={shippingCost} total={total} address={address} />
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6 glow-cyan">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="font-heading font-extrabold text-3xl text-ghost mb-3">Pesanan Berhasil! 🎉</h2>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Pesananmu sudah kami terima. Silakan selesaikan pembayaran untuk memproses pesanan.
              </p>
              <div className="glass-card rounded-2xl p-6 max-w-sm mx-auto border border-green-500/15 mb-6">
                <p className="text-gray-400 text-sm mb-1">Total Pembayaran</p>
                <p className="font-heading font-bold text-2xl gradient-violet-text">Rp {total.toLocaleString('id-ID')}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Link to="/orders" className="px-6 py-3 gradient-violet rounded-full text-white font-medium glow-violet-sm">
                  Lihat Pesanan
                </Link>
                <Link to="/catalog" className="px-6 py-3 rounded-full border border-white/10 text-gray-400 hover:text-ghost transition-all font-medium">
                  Belanja Lagi
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function OrderSummary({ cartItems, subtotal, shippingCost, total, address }) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-violet-500/10 h-fit">
      <h3 className="font-heading font-bold text-ghost mb-4 text-sm">Ringkasan Pesanan</h3>
      <div className="space-y-2 mb-4">
        {cartItems.map(item => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-violet-500/5">
              {item.product_image ? (
                <img src={item.product_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-violet-500/30" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ghost text-xs truncate">{item.product_name}</p>
              <p className="text-gray-600 text-xs">{item.variant_label}</p>
            </div>
            <p className="text-gray-400 text-xs">x{item.quantity}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 pt-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-400">
          <span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Ongkir</span>
          <span className={shippingCost === 0 ? 'text-green-400' : ''}>
            {shippingCost === 0 ? 'GRATIS' : `Rp ${shippingCost.toLocaleString('id-ID')}`}
          </span>
        </div>
        <div className="flex justify-between font-semibold text-ghost pt-1 border-t border-white/5">
          <span>Total</span>
          <span className="gradient-violet-text">Rp {total.toLocaleString('id-ID')}</span>
        </div>
      </div>
      {address && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-gray-500 text-xs mb-1">Kirim ke:</p>
          <p className="text-ghost text-xs font-medium">{address.name}</p>
          <p className="text-gray-500 text-xs">{address.address}, {address.city}</p>
        </div>
      )}
    </div>
  );
}