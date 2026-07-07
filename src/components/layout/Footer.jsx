import { Link } from 'react-router-dom';
import { Zap, Instagram, Twitter, Youtube, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-violet-500/10 bg-black/40 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 gradient-violet rounded-lg flex items-center justify-center glow-violet-sm">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-extrabold text-xl text-ghost">
                VAPE<span className="gradient-violet-text">GACOR</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Premium vape store with the finest collection of devices, liquids, and accessories. Elevating your vaping experience to the next level.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-500 hover:text-violet-400 hover:border-violet-500/40 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-ghost text-sm mb-4">Produk</h4>
            <ul className="space-y-2.5">
              {['Device', 'Liquid', 'Pod System', 'Accessories', 'Coil'].map(item => (
                <li key={item}>
                  <Link to={`/catalog?category=${item.toLowerCase()}`} className="text-gray-500 hover:text-violet-400 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-ghost text-sm mb-4">Bantuan</h4>
            <ul className="space-y-2.5">
              {['Cara Order', 'Cara Pembayaran', 'Pengiriman', 'Retur & Refund', 'Kontak Kami'].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-violet-400 text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">© 2024 VapeGacor. All rights reserved.</p>
          <p className="text-gray-600 text-xs">18+ Only. Vaping products are for adults only.</p>
        </div>
      </div>
    </footer>
  );
}