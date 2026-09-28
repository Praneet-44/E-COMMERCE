import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function ProductCard({ product }) {
  const { locale } = useLanguage();
  const [hovered, setHovered] = useState(false);
  
  // Destructure product
  const { id, _id, name, price, discount, images, category, gender } = product;
  const productId = id || _id;
  
  // Calculate price after discount
  const finalPrice = Math.round(price * (1 - (discount || 0) / 100));
  
  // Select active image based on hover state
  const activeImage = hovered && images && images.length > 1 ? images[1] : (images && images[0]);

  return (
    <div 
      className="group relative flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image Container */}
      <Link href={`/products/${productId}`} locale={locale} className="relative block overflow-hidden aspect-[3/4] bg-neutral-100 dark:bg-neutral-800">
        {discount > 0 && (
          <span className="absolute top-4 left-4 z-10 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm shadow-sm border border-luxury-accent/20">
            -{discount}% OFF
          </span>
        )}
        
        <span className="absolute top-4 right-4 z-10 bg-luxury-cream text-neutral-800 text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full glass">
          {gender}
        </span>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={activeImage} 
          alt={name}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* Info details */}
      <div className="flex flex-col flex-grow p-5 justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium mb-1.5 block">
            {category}
          </span>
          <Link href={`/products/${productId}`} locale={locale} className="hover:text-luxury-accent transition-colors">
            <h3 className="font-serif text-base font-semibold leading-tight text-neutral-800 dark:text-neutral-100 line-clamp-1 mb-2">
              {name}
            </h3>
          </Link>
        </div>

        {/* Price listing */}
        <div className="flex items-baseline gap-2 mt-2">
          {discount > 0 ? (
            <>
              <span className="font-sans font-bold text-neutral-900 dark:text-neutral-100">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
              <span className="font-sans text-xs text-neutral-400 line-through">
                ₹{price.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="font-sans font-bold text-neutral-900 dark:text-neutral-100">
              ₹{price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
