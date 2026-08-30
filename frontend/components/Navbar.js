import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShoppingBag, User, Sun, Moon, Sparkles, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar({ darkMode, toggleDarkMode, cartCount }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = () => {
      const stored = localStorage.getItem('fh_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    
    checkUser();
    window.addEventListener('auth-changed', checkUser);
    
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('auth-changed', checkUser);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('fh_token');
    localStorage.removeItem('fh_user');
    window.dispatchEvent(new Event('auth-changed'));
    router.push('/');
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
      scrolled 
        ? 'py-4 bg-white/95 dark:bg-neutral-950/95 shadow-sm backdrop-blur-md border-b border-neutral-100 dark:border-neutral-900' 
        : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="font-serif text-2xl tracking-widest font-bold bg-gradient-to-r from-neutral-800 to-luxury-accent dark:from-neutral-100 dark:to-luxury-accent bg-clip-text text-transparent">
            FASHIONHUB
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest font-medium">
          <Link href="/products" className={`hover:text-luxury-accent transition-colors ${router.pathname === '/products' ? 'text-luxury-accent' : ''}`}>
            Collections
          </Link>
          <Link href="/products?gender=Men" className="hover:text-luxury-accent transition-colors">
            Men
          </Link>
          <Link href="/products?gender=Women" className="hover:text-luxury-accent transition-colors">
            Women
          </Link>
          <Link href="/products?category=Outerwear" className="hover:text-luxury-accent transition-colors">
            Outerwear
          </Link>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Dark Mode */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 hover:text-luxury-accent transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Seller / Admin Dashboards */}
          {user && (user.role === 'seller' || user.role === 'admin') && (
            <Link 
              href={user.role === 'admin' ? '/admin' : '/seller'} 
              className="p-2 hover:text-luxury-accent transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-1.5 text-sm font-medium"
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5 text-luxury-accent animate-pulse-subtle" />
              <span className="hidden lg:inline text-xs uppercase tracking-wider">Dashboard</span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link 
            href="/cart"
            className="p-2 hover:text-luxury-accent transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 relative"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-luxury-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Profile / Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/profile"
                className="p-2 hover:text-luxury-accent transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-1 text-sm font-medium"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 hover:text-red-500 transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              href="/auth/login"
              className="p-2 hover:text-luxury-accent transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-1 text-sm uppercase tracking-wider font-semibold"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline text-xs">Sign In</span>
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}
