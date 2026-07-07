import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Zap, User, LogOut, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Navbar({ cartCount = 0 }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const navLinks = [
  { label: 'Katalog', href: '/catalog' },
  { label: 'Device', href: '/catalog?category=device' },
  { label: 'Liquid', href: '/catalog?category=liquid' },
  { label: 'Accessories', href: '/catalog?category=accessories' }];


  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
    scrolled ? 'glass-card border-b border-violet-glow' : 'bg-transparent'}`
    }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              

              
            </div>
            <span className="font-heading font-800 text-xl text-ghost tracking-tight">
              VAPE<span className="gradient-violet-text">GACOR</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              location.pathname === link.href ?
              'text-violet-400 bg-violet-500/10' :
              'text-gray-400 hover:text-ghost hover:bg-white/5'}`
              }>
              
                {link.label}
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {user ?
            <>
                {user.role === 'admin' &&
              <Link to="/admin" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-500/30 text-violet-400 text-sm hover:bg-violet-500/10 transition-all">
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Link>
              }
                <Link to="/orders" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 text-sm hover:text-ghost hover:bg-white/5 transition-all">
                  <User className="w-3.5 h-3.5" />
                  {user.full_name?.split(' ')[0]}
                </Link>
                <button onClick={handleLogout} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 text-sm hover:text-red-400 hover:bg-red-500/5 transition-all">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </> :

            <Link to="/login" className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-lg border border-violet-500/30 text-violet-400 text-sm hover:bg-violet-500/10 transition-all">
                <User className="w-3.5 h-3.5" />
                Masuk
              </Link>
            }

            <Link to="/cart" className="relative p-2 rounded-lg border border-violet-500/20 text-gray-400 hover:text-ghost hover:border-violet-500/50 hover:glow-violet-sm transition-all">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 &&
              <span className="absolute -top-1 -right-1 w-5 h-5 gradient-violet rounded-full text-xs text-white flex items-center justify-center font-medium glow-violet-sm">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              }
            </Link>

            <button
              className="md:hidden p-2 text-gray-400 hover:text-ghost"
              onClick={() => setMenuOpen(!menuOpen)}>
              
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen &&
      <div className="md:hidden glass-card border-t border-violet-glow">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) =>
          <Link
            key={link.href}
            to={link.href}
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-gray-400 hover:text-ghost hover:bg-white/5 transition-all text-sm">
            
                {link.label}
              </Link>
          )}
            <div className="pt-2 border-t border-white/5 mt-2">
              {user ?
            <>
                  {user.role === 'admin' &&
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-violet-400 text-sm">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
              }
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-400 text-sm">
                    <User className="w-4 h-4" /> {user.full_name}
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-red-400 text-sm w-full">
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </> :

            <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-violet-400 text-sm">
                  <User className="w-4 h-4" /> Masuk / Daftar
                </Link>
            }
            </div>
          </div>
        </div>
      }
    </nav>);

}