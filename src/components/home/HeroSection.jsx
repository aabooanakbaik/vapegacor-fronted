import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid-pattern">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/8 rounded-full blur-3xl pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/5 rounded-full blur-3xl" />
      </div>

      {/* Circuit lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        <div className="absolute bottom-32 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/5 text-violet-400 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full pulse-slow" />
              Premium Vape Store #1 Indonesia
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold text-ghost leading-[0.95] tracking-tight mb-6">Crafting Every Puff to Perfection





            </h1>

            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Koleksi device & liquid premium terlengkap. Dari starter kit hingga advanced mod, temukan pengalaman vaping terbaik hanya di VapeGacor.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/catalog"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 gradient-violet rounded-full text-white font-semibold text-base glow-pulse-animation hover:scale-105 transition-all duration-300">
                
                Belanja Sekarang
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/catalog?category=liquid"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/10 text-gray-300 font-medium text-base hover:border-violet-500/40 hover:text-ghost hover:bg-violet-500/5 transition-all duration-300">
                
                Lihat Liquid
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start">
              {[
              { value: '500+', label: 'Produk' },
              { value: '50+', label: 'Brand' },
              { value: '10K+', label: 'Pelanggan' }].
              map((stat) =>
              <div key={stat.label} className="text-center">
                  <div className="font-heading font-extrabold text-2xl gradient-violet-text">{stat.value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Hero visual */}
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full bg-violet-600/15 blur-3xl scale-110" />
              
              {/* Main product display */}
              <div className="relative glass-card rounded-3xl p-8 float-animation" style={{ width: '340px', height: '420px' }}>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/10 to-pink-600/5" />
                
                {/* Product placeholder visual */}
                <div className="relative h-full flex flex-col items-center justify-center">
                  <div className="relative mb-6">
                    <div className="w-32 h-64 rounded-2xl bg-gradient-to-b from-violet-900/60 to-violet-950/80 border border-violet-500/30 flex items-center justify-center glow-violet">
                      <div className="text-center">
                        <Zap className="w-10 h-10 text-violet-400 mx-auto mb-2" />
                        <div className="w-16 h-1 bg-violet-500/50 rounded-full mx-auto mb-1" />
                        <div className="w-10 h-1 bg-violet-500/30 rounded-full mx-auto" />
                      </div>
                    </div>
                    {/* Floating badge */}
                    <div className="absolute -top-3 -right-6 glass-card rounded-xl px-3 py-1.5 border border-violet-500/30">
                      <span className="text-violet-400 text-xs font-semibold">NEW DROP</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-400 text-xs mb-1">Featured Collection</p>
                    <h3 className="font-heading font-bold text-ghost text-lg">Premium Devices</h3>
                    <p className="gradient-violet-text font-semibold mt-1">Mulai Rp 250.000</p>
                  </div>
                </div>
              </div>

              {/* Floating feature cards */}
              <div className="absolute -left-16 top-16 glass-card rounded-2xl px-4 py-3 border border-violet-500/20 hidden lg:block">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-400" />
                  <span className="text-ghost text-xs font-medium">100% Original</span>
                </div>
              </div>
              <div className="absolute -right-16 bottom-20 glass-card rounded-2xl px-4 py-3 border border-violet-500/20 hidden lg:block">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-cyan-400" />
                  <span className="text-ghost text-xs font-medium">Free Ongkir</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature badges */}
        <div className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto lg:max-w-none">
          {[
          { icon: Shield, text: 'Produk 100% Original & Bergaransi', color: 'text-violet-400' },
          { icon: Truck, text: 'Pengiriman Cepat ke Seluruh Indonesia', color: 'text-cyan-400' },
          { icon: Zap, text: 'Pembayaran Aman & Terenkripsi', color: 'text-pink-400' }].
          map(({ icon: Icon, text, color }) =>
          <div key={text} className="glass-card rounded-xl p-4 text-center border border-white/5 hover:border-violet-500/20 transition-all">
              <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
              <p className="text-gray-400 text-xs leading-relaxed">{text}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}