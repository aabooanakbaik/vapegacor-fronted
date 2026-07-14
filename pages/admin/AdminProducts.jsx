import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/layout/Navbar';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Star, Search } from 'lucide-react';
import { toast } from 'sonner';

const categoryLabels = { device: 'Device', liquid: 'Liquid', accessories: 'Aksesoris', pod: 'Pod', coil: 'Coil' };

export default function AdminProducts() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u.role !== 'admin') navigate('/');
      setUser(u);
    }).catch(() => navigate('/login'));
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.filter({}, '-created_date', 200),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const handleToggleActive = (product) => {
    updateMutation.mutate({ id: product.id, data: { is_active: !product.is_active } });
  };

  const handleToggleFeatured = (product) => {
    updateMutation.mutate({ id: product.id, data: { is_featured: !product.is_featured } });
  };

  const handleDelete = (product) => {
    if (window.confirm(`Hapus produk "${product.name}"?`)) {
      deleteMutation.mutate(product.id);
      toast.success('Produk dihapus', { style: { background: '#0D0D12', border: '1px solid rgba(139,92,246,0.3)', color: '#F9FAFB' } });
    }
  };

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading font-extrabold text-2xl text-ghost">Kelola <span className="gradient-violet-text">Produk</span></h1>
              <p className="text-gray-500 text-sm">{products.length} produk total</p>
            </div>
            <Link to="/admin/products/new" className="flex items-center gap-2 px-4 py-2.5 gradient-violet rounded-xl text-white font-medium text-sm glow-violet-sm hover:scale-105 transition-all">
              <Plus className="w-4 h-4" /> Tambah Produk
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-ghost text-sm focus:outline-none focus:border-violet-500/40 transition-all"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => <div key={i} className="glass-card rounded-xl h-16 animate-pulse" />)}
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Produk</th>
                    <th className="px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Brand</th>
                    <th className="px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider hidden md:table-cell">Kategori</th>
                    <th className="px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Harga</th>
                    <th className="px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product, i) => (
                    <tr key={product.id} className={`border-b border-white/5 hover:bg-white/2 transition-all ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-violet-500/5 border border-violet-500/10">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-violet-500/10" />
                            )}
                          </div>
                          <p className="text-ghost text-sm font-medium">{product.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-gray-400 text-sm">{product.brand}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400 text-xs">
                          {categoryLabels[product.category] || product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-violet-400 font-semibold text-sm">Rp {(product.base_price || 0).toLocaleString('id-ID')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => handleToggleActive(product)}
                            className={`flex items-center gap-1 text-xs ${product.is_active ? 'text-green-400' : 'text-gray-600'}`}
                          >
                            {product.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            {product.is_active ? 'Aktif' : 'Nonaktif'}
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(product)}
                            className={`flex items-center gap-1 text-xs ${product.is_featured ? 'text-yellow-400' : 'text-gray-600'}`}
                          >
                            <Star className="w-3.5 h-3.5" />
                            {product.is_featured ? 'Featured' : 'Biasa'}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/admin/products/${product.id}/edit`} className="p-1.5 text-gray-500 hover:text-violet-400 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(product)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-600">Belum ada produk</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}