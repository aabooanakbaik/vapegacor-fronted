import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/layout/Navbar';
import { Save, Image as ImageIcon, Plus, Trash2, ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  { value: 'device', label: 'Device' },
  { value: 'liquid', label: 'Liquid' },
  { value: 'pod', label: 'Pod System' },
  { value: 'coil', label: 'Coil' },
  { value: 'accessories', label: 'Accessories' },
];

const flavorTagOptions = ['Icy', 'Fruity', 'Creamy', 'Tobacco', 'Menthol', 'Sweet', 'Sour', 'Minty'];

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id && id !== 'new';

  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [form, setForm] = useState({
    name: '', brand: '', category: 'liquid', description: '',
    base_price: '', is_active: true, is_featured: false, images: [], flavor_tags: [],
  });

  const [variants, setVariants] = useState([
    { flavor: '', nicotine_mg: '', stock: '', additional_price: '', is_available: true },
  ]);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u.role !== 'admin') navigate('/');
      setUser(u);
    }).catch(() => navigate('/login'));
  }, []);

  const { data: productData } = useQuery({
    queryKey: ['product-edit', id],
    queryFn: async () => {
      const product = await base44.entities.Product.get(id);
      return product;
    },
    enabled: isEdit && !!user,
  });

  const { data: existingVariants = [] } = useQuery({
    queryKey: ['variants-edit', id],
    queryFn: () => base44.entities.ProductVariant.filter({ product_id: id }),
    enabled: isEdit && !!user,
  });

  useEffect(() => {
    if (productData) {
      setForm({
        name: productData.name || '',
        brand: productData.brand || '',
        category: productData.category || 'liquid',
        description: productData.description || '',
        base_price: productData.base_price || '',
        is_active: productData.is_active !== false,
        is_featured: productData.is_featured || false,
        images: productData.images || [],
        flavor_tags: productData.flavor_tags || [],
      });
    }
  }, [productData]);

  useEffect(() => {
    if (existingVariants.length > 0) {
      setVariants(existingVariants.map(v => ({
        id: v.id,
        flavor: v.flavor || '',
        nicotine_mg: v.nicotine_mg || '',
        stock: v.stock || 0,
        additional_price: v.additional_price || 0,
        is_available: v.is_available !== false,
      })));
    }
  }, [existingVariants]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImg(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, images: [...f.images, file_url] }));
    setUploadingImg(false);
    toast.success('Foto berhasil diupload', { style: { background: '#0D0D12', border: '1px solid rgba(139,92,246,0.3)', color: '#F9FAFB' } });
  };

  const handleRemoveImage = (idx) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleToggleFlavorTag = (tag) => {
    setForm(f => ({
      ...f,
      flavor_tags: f.flavor_tags.includes(tag)
        ? f.flavor_tags.filter(t => t !== tag)
        : [...f.flavor_tags, tag],
    }));
  };

  const addVariant = () => {
    setVariants(v => [...v, { flavor: '', nicotine_mg: '', stock: '', additional_price: '', is_available: true }]);
  };

  const removeVariant = (idx) => {
    setVariants(v => v.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx, field, value) => {
    setVariants(v => v.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSave = async () => {
    if (!form.name || !form.brand || !form.base_price) {
      toast.error('Nama, brand, dan harga wajib diisi!');
      return;
    }
    setSaving(true);

    const productPayload = {
      ...form,
      base_price: Number(form.base_price),
    };

    let productId = id;
    if (isEdit) {
      await base44.entities.Product.update(id, productPayload);
    } else {
      const created = await base44.entities.Product.create(productPayload);
      productId = created.id;
    }

    // Save variants
    for (const variant of variants) {
      const variantPayload = {
        product_id: productId,
        flavor: variant.flavor,
        nicotine_mg: variant.nicotine_mg,
        stock: Number(variant.stock) || 0,
        additional_price: Number(variant.additional_price) || 0,
        is_available: variant.is_available,
      };
      if (variant.id) {
        await base44.entities.ProductVariant.update(variant.id, variantPayload);
      } else {
        await base44.entities.ProductVariant.create(variantPayload);
      }
    }

    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    toast.success(isEdit ? 'Produk berhasil diupdate!' : 'Produk berhasil ditambahkan!', {
      style: { background: '#0D0D12', border: '1px solid rgba(139,92,246,0.3)', color: '#F9FAFB' }
    });
    navigate('/admin/products');
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <main className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 text-gray-500 hover:text-violet-400 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <h1 className="font-heading font-extrabold text-xl text-ghost">
              {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h1>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h2 className="font-heading font-semibold text-ghost mb-4">Informasi Produk</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-1.5">Nama Produk *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ghost text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                    placeholder="Nama produk" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1.5">Brand *</label>
                  <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ghost text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                    placeholder="Nama brand" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1.5">Kategori *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ghost text-sm focus:outline-none focus:border-violet-500/50 transition-all">
                    {categories.map(c => <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1.5">Harga Dasar (Rp) *</label>
                  <input type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ghost text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                    placeholder="0" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-gray-400 text-sm block mb-1.5">Deskripsi</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-ghost text-sm focus:outline-none focus:border-violet-500/50 transition-all resize-none h-24"
                    placeholder="Deskripsi produk..." />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-4 mt-4">
                {[
                  { key: 'is_active', label: 'Aktif (tampil di toko)' },
                  { key: 'is_featured', label: 'Produk Unggulan' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                      className={`w-10 h-5 rounded-full transition-all relative ${form[key] ? 'bg-violet-600' : 'bg-white/10'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${form[key] ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-gray-400 text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Flavor Tags */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h2 className="font-heading font-semibold text-ghost mb-4">Tag Rasa</h2>
              <div className="flex gap-2 flex-wrap">
                {flavorTagOptions.map(tag => (
                  <button key={tag} onClick={() => handleToggleFlavorTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      form.flavor_tags.includes(tag)
                        ? 'gradient-violet text-white border-transparent glow-violet-sm'
                        : 'border-white/10 text-gray-400 hover:border-violet-500/30'
                    }`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h2 className="font-heading font-semibold text-ghost mb-4">Foto Produk</h2>
              <div className="flex gap-3 flex-wrap">
                {form.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-violet-500/20">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/40 flex flex-col items-center justify-center cursor-pointer transition-all text-gray-600 hover:text-violet-400">
                  {uploadingImg ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5 mb-1" /><span className="text-xs">Upload</span></>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
                </label>
              </div>
            </div>

            {/* Variants */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-ghost">Varian Produk</h2>
                <button onClick={addVariant} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-500/30 text-violet-400 text-sm hover:bg-violet-500/10 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Tambah Varian
                </button>
              </div>
              <div className="space-y-3">
                {variants.map((variant, i) => (
                  <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 rounded-xl bg-white/3 border border-white/5 items-center">
                    <input value={variant.flavor} onChange={e => updateVariant(i, 'flavor', e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-ghost text-xs focus:outline-none focus:border-violet-500/40"
                      placeholder="Rasa (opsional)" />
                    <input value={variant.nicotine_mg} onChange={e => updateVariant(i, 'nicotine_mg', e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-ghost text-xs focus:outline-none focus:border-violet-500/40"
                      placeholder="Nikotin (0mg)" />
                    <input type="number" value={variant.stock} onChange={e => updateVariant(i, 'stock', e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-ghost text-xs focus:outline-none focus:border-violet-500/40"
                      placeholder="Stok" />
                    <input type="number" value={variant.additional_price} onChange={e => updateVariant(i, 'additional_price', e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-ghost text-xs focus:outline-none focus:border-violet-500/40"
                      placeholder="+Harga (Rp)" />
                    <button onClick={() => removeVariant(i)} className="p-2 text-gray-600 hover:text-red-400 transition-colors justify-self-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save button */}
            <button onClick={handleSave} disabled={saving}
              className="w-full py-4 gradient-violet rounded-2xl text-white font-semibold text-base glow-violet-sm hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</> : (isEdit ? 'Update Produk' : 'Simpan Produk')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}