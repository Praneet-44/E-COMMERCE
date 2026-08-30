import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-50 dark:bg-neutral-900/40 border-t border-neutral-100 dark:border-neutral-900 py-16 px-6 md:px-12 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand Info */}
        <div className="space-y-4">
          <h3 className="font-serif text-xl tracking-widest font-bold text-neutral-800 dark:text-neutral-100">FASHIONHUB</h3>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
            An curated archive of premium essential garments blending luxury aesthetics, meticulous craftsmanship, and modern styling assistance.
          </p>
        </div>

        {/* Collections Links */}
        <div>
          <h4 className="font-serif text-xs uppercase tracking-widest font-semibold mb-6 text-neutral-800 dark:text-neutral-200">Shop Archives</h4>
          <ul className="space-y-3 font-light text-neutral-500 dark:text-neutral-400">
            <li><Link href="/products" className="hover:text-luxury-accent transition-colors">All Collections</Link></li>
            <li><Link href="/products?category=Outerwear" className="hover:text-luxury-accent transition-colors">Vanguard Coats</Link></li>
            <li><Link href="/products?category=Shirts" className="hover:text-luxury-accent transition-colors">Aether Shirts</Link></li>
            <li><Link href="/products?category=Hoodies" className="hover:text-luxury-accent transition-colors">Cashmere Hoodie</Link></li>
          </ul>
        </div>

        {/* Brand Policies */}
        <div>
          <h4 className="font-serif text-xs uppercase tracking-widest font-semibold mb-6 text-neutral-800 dark:text-neutral-200">Customer Care</h4>
          <ul className="space-y-3 font-light text-neutral-500 dark:text-neutral-400">
            <li><a href="#" className="hover:text-luxury-accent transition-colors">Bespoke Fit Guide</a></li>
            <li><a href="#" className="hover:text-luxury-accent transition-colors">Shipping & Duty Rates</a></li>
            <li><a href="#" className="hover:text-luxury-accent transition-colors">Returns & Exchanges</a></li>
            <li><a href="#" className="hover:text-luxury-accent transition-colors">Store Boutiques</a></li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div className="space-y-4">
          <h4 className="font-serif text-xs uppercase tracking-widest font-semibold text-neutral-800 dark:text-neutral-200">Newsletter</h4>
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
              Join
            </button>
          </form>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto border-t border-neutral-200/50 dark:border-neutral-800/40 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-400 font-light">
        <p>© 2026 FashionHub Inc. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-luxury-accent transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-luxury-accent transition-colors">Terms of Use</a>
          <a href="#" className="hover:text-luxury-accent transition-colors">Accessibility</a>
        </div>
      </div>
    </footer>
  );
}
