import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t, locale } = useLanguage();

  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900/40 border-t border-neutral-100 dark:border-neutral-900 py-16 px-6 md:px-12 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand Info */}
        <div className="space-y-4">
          <h3 className="font-serif text-xl tracking-widest font-bold text-neutral-800 dark:text-neutral-100">
            {t('nav.brand', 'FASHIONHUB')}
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
            {t('footer.brandDesc', 'Crafting luxury, sustainable fashion for the modern individual.')}
          </p>
        </div>

        {/* Collections Links */}
        <div>
          <h4 className="font-serif text-xs uppercase tracking-widest font-semibold mb-6 text-neutral-800 dark:text-neutral-200">
            {t('nav.collections', 'Collections')}
          </h4>
          <ul className="space-y-3 font-light text-neutral-500 dark:text-neutral-400">
            <li><Link href="/products" locale={locale} className="hover:text-luxury-accent transition-colors">{t('products.all', 'All Collections')}</Link></li>
            <li><Link href="/products?category=Outerwear" locale={locale} className="hover:text-luxury-accent transition-colors">{t('nav.outerwear', 'Outerwear')}</Link></li>
            <li><Link href="/products?gender=Men" locale={locale} className="hover:text-luxury-accent transition-colors">{t('nav.men', 'Men')}</Link></li>
            <li><Link href="/products?gender=Women" locale={locale} className="hover:text-luxury-accent transition-colors">{t('nav.women', 'Women')}</Link></li>
          </ul>
        </div>

        {/* Brand Policies */}
        <div>
          <h4 className="font-serif text-xs uppercase tracking-widest font-semibold mb-6 text-neutral-800 dark:text-neutral-200">
            {t('footer.customerService', 'Customer Care')}
          </h4>
          <ul className="space-y-3 font-light text-neutral-500 dark:text-neutral-400">
            <li><a href="#" className="hover:text-luxury-accent transition-colors">{t('footer.shippingReturns', 'Shipping & Returns')}</a></li>
            <li><a href="#" className="hover:text-luxury-accent transition-colors">{t('footer.faq', 'FAQ')}</a></li>
            <li><a href="#" className="hover:text-luxury-accent transition-colors">{t('footer.privacyPolicy', 'Privacy Policy')}</a></li>
            <li><a href="#" className="hover:text-luxury-accent transition-colors">{t('footer.termsOfService', 'Terms of Service')}</a></li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div className="space-y-4">
          <h4 className="font-serif text-xs uppercase tracking-widest font-semibold text-neutral-800 dark:text-neutral-200">
            {t('footer.contactUs', 'Newsletter')}
          </h4>
          <p className="text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
            Subscribe to receive private seasonal catalog listings and exclusive access codes.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully.'); }} className="flex border-b border-neutral-300 dark:border-neutral-700 py-1">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-transparent border-none outline-none flex-grow text-xs font-light text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600"
              required
            />
            <button type="submit" className="text-xs uppercase tracking-widest font-medium text-luxury-accent hover:text-luxury-accentHover transition-colors">
              {t('common.apply', 'Join')}
            </button>
          </form>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto border-t border-neutral-200/50 dark:border-neutral-800/40 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-400 font-light">
        <p>© 2026 FashionHub Inc. {t('footer.rightsReserved', 'All rights reserved.')}</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-luxury-accent transition-colors">{t('footer.privacyPolicy', 'Privacy Policy')}</a>
          <a href="#" className="hover:text-luxury-accent transition-colors">{t('footer.termsOfService', 'Terms of Service')}</a>
        </div>
      </div>
    </footer>
  );
}
