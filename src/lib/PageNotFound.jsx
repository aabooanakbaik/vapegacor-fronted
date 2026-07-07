import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600 mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold text-white mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-400 mb-8">Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full text-white font-semibold hover:scale-105 transition-all"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
