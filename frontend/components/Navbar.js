import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShoppingBag, User, Sun, Moon, LayoutDashboard, LogOut, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ darkMode, toggleDarkMode, cartCount }) {
  const router = useRouter();
  const { t, locale, languages, changeLanguage } = useLanguage();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

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

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('auth-changed', checkUser);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('fh_token');
    localStorage.removeItem('fh_user');
    window.dispatchEvent(new Event('auth-changed'));
    router.push('/');
  };

  const activeLangObj = languages.find((l) => l.code === locale) || languages[0];

  return (
    <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
      scrolled 
        ? 'py-4 bg-white/95 dark:bg-neutral-950/95 shadow-sm backdrop-blur-md border-b border-neutral-100 dark:border-neutral-900' 
        : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" locale={locale} className="flex items-center gap-1">
          <span className="font-serif text-2xl tracking-widest font-bold bg-gradient-to-r from-neutral-800 to-luxury-accent dark:from-neutral-100 dark:to-luxury-accent bg-clip-text text-transparent">
            {t('nav.brand', 'FASHIONHUB')}
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest font-medium">
          <Link href="/products" locale={locale} className={`hover:text-luxury-accent transition-colors ${router.pathname === '/products' ? 'text-luxury-accent' : ''}`}>
            {t('nav.collections', 'Collections')}
          </Link>
          <Link href="/products?gender=Men" locale={locale} className="hover:text-luxury-accent transition-colors">
            {t('nav.men', 'Men')}
          </Link>
          <Link href="/products?gender=Women" locale={locale} className="hover:text-luxury-accent transition-colors">
            {t('nav.women', 'Women')}
          </Link>
          <Link href="/products?category=Outerwear" locale={locale} className="hover:text-luxury-accent transition-colors">
            {t('nav.outerwear', 'Outerwear')}
          </Link>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Language Switcher Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-1.5 px-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-luxury-accent dark:hover:border-luxury-accent transition-all bg-neutral-50/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Select Language"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-luxury-accent" />
              <span className="text-sm">{activeLangObj.flag}</span>
              <span className="font-medium text-xs tracking-wider">{activeLangObj.code.toUpperCase()}</span>
              <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl shadow-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-lg">
                <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase border-b border-neutral-100 dark:border-neutral-800 mb-1">
                  {t('nav.language', 'Select Language')}
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                      locale === lang.code ? 'font-bold text-luxury-accent bg-neutral-50 dark:bg-neutral-850' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </span>
                    {locale === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-luxury-accent"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

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
              locale={locale}
              className="p-2 hover:text-luxury-accent transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-1.5 text-sm font-medium"
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5 text-luxury-accent animate-pulse-subtle" />
              <span className="hidden lg:inline text-xs uppercase tracking-wider">{t('nav.dashboard', 'Dashboard')}</span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link 
            href="/cart"
            locale={locale}
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
                locale={locale}
                className="p-2 hover:text-luxury-accent transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-1 text-sm font-medium"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 hover:text-red-500 transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900"
                title={t('nav.logout', 'Logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              href="/auth/login"
              locale={locale}
              className="p-2 hover:text-luxury-accent transition-colors rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center gap-1 text-sm uppercase tracking-wider font-semibold"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline text-xs">{t('nav.signIn', 'Sign In')}</span>
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}
