import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-white mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/products" className="glass-card rounded-2xl p-6 border border-white/10 hover:border-violet-500/50 transition-all group">
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-violet-400">Kelola Produk</h2>
            <p className="text-gray-400">Tambah, edit, atau hapus produk dari katalog toko.</p>
          </Link>
          <Link to="/admin/orders" className="glass-card rounded-2xl p-6 border border-white/10 hover:border-violet-500/50 transition-all group">
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-violet-400">Kelola Pesanan</h2>
            <p className="text-gray-400">Lihat dan proses pesanan yang masuk dari pelanggan.</p>
          </Link>
          <Link to="/admin/export" className="glass-card rounded-2xl p-6 border border-white/10 hover:border-violet-500/50 transition-all group">
            <h2 className="text-xl font-bold text-white mb-2 group-hover:text-violet-400">Export Laporan</h2>
            <p className="text-gray-400">Unduh data penjualan dan produk ke dalam format excel/csv.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
