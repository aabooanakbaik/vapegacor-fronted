import Navbar from '@/components/layout/Navbar';

export default function AdminExport() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-white mb-8">Export Laporan</h1>
        <div className="glass-card rounded-2xl p-8 border border-white/10 text-center">
          <p className="text-gray-400 mb-6">Fitur export laporan belum tersedia di versi ini.</p>
        </div>
      </main>
    </div>
  );
}
