import { Link } from 'react-router-dom';

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 border border-white/10 text-center">
        <h1 className="text-3xl font-extrabold text-white mb-2">Reset Password</h1>
        <p className="text-gray-400 mb-6">Fitur ini belum tersedia di versi ini.</p>
        <Link to="/login" className="text-violet-400 hover:text-violet-300">Kembali ke Login</Link>
      </div>
    </div>
  );
}
