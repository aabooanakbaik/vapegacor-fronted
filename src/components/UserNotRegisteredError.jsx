import { Link } from 'react-router-dom';

export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Akun Belum Terdaftar</h2>
        <p className="text-gray-400 mb-8">Maaf, akun Anda belum terdaftar di sistem kami. Silakan daftar terlebih dahulu untuk melanjutkan.</p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full text-white font-semibold hover:scale-105 transition-all"
        >
          Daftar Sekarang
        </Link>
      </div>
    </div>
  );
}
