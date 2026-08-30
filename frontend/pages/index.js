import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { ArrowRight, Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    // Fetch top products for catalog preview
    const loadProducts = async () => {
      try {
        const data = await api.products.getAll();
        setProducts(data.slice(0, 4));
      } catch (err) {
        console.error('Error loading home products:', err);
      }
    };
    loadProducts();
  }, []);

  const reviews = [
    {
      name: "Sophia Kensington",
      role: "Wardrobe Stylist",
      rating: 5,
      comment: "The tailoring on the Vanguard Overcoat is exceptional. The structural lines create an instantly commanding silhouette. Quiet luxury at its finest."
    },
    {
      name: "Marcus Aurelius",
      role: "Client",
      rating: 5,
      comment: "The mulberry silk shirts have an incredibly soft touch and a rich drape. The AI consultant suggested size M and it fits as if custom-tailored."
    },
    {
      name: "Elena Rostova",
      role: "Fashion Editor",
      rating: 5,
      comment: "Mongolian cashmere hoodie is the perfect layer. It strikes the perfect balance between casual comfort and high-end fabric refinement."
    }
  ];

  const handleNextReview = () => {
    setReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrevReview = () => {
    setReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <>
      <Head>
        <title>FashionHub | Premium Curated Wardrobe & AI Stylist</title>
      </Head>

      <div className="space-y-24 pb-20">
        
        {/* HERO BANNER SECTION */}
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-neutral-900">
          {/* Hero background image */}
          <div className="absolute inset-0 opacity-55">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop" 
              alt="Fashion editorial model" 
              className="w-full h-full object-cover object-center scale-105 animate-pulse-subtle"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-neutral-950/40" />
          </div>

          {/* Hero Text Content */}
          <div className="relative max-w-5xl mx-auto px-6 text-center text-white space-y-6">
            <span className="text-[11px] uppercase tracking-[0.3em] text-luxury-accent font-semibold block animate-fade-in">
              Seasonal Archive Vol. 04
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] animate-slide-up text-white">
              Understated Luxury.<br />
              <span className="text-luxury-accent italic font-light">Meticulously</span> Crafted.
            </h1>
            <p className="max-w-xl mx-auto text-sm md:text-base text-neutral-300 font-light leading-relaxed animate-fade-in">
              Explore essential silhouettes combining premium raw textiles, modern cuts, and tailored AI styling assistance.
            </p>
            <div className="pt-4 animate-slide-up">
              <Link href="/products" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-neutral-950 hover:bg-luxury-accent hover:text-white transition-all text-xs font-semibold uppercase tracking-widest rounded-sm shadow-lg">
                Shop Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURED COLLECTIONS GRID */}
        <section className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block">The Selection</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-800 dark:text-neutral-100">Featured Capsule Archives</h2>
            <div className="w-12 h-[2px] bg-luxury-accent mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Box 1 */}
            <div className="group relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop" 
                alt="Outerwear collection" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                <span className="text-[10px] uppercase tracking-widest text-luxury-accent font-semibold mb-2 block">Premium Outerwear</span>
                <h3 className="font-serif text-xl font-bold mb-4">Vanguard Coats</h3>
                <Link href="/products?category=Outerwear" className="text-xs uppercase tracking-widest font-semibold inline-flex items-center gap-1.5 hover:text-luxury-accent transition-colors">
                  Explore
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Box 2 */}
            <div className="group relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop" 
                alt="Shirts Collection" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                <span className="text-[10px] uppercase tracking-widest text-luxury-accent font-semibold mb-2 block">Mulberry Silk</span>
                <h3 className="font-serif text-xl font-bold mb-4">Aether Shirts</h3>
                <Link href="/products?category=Shirts" className="text-xs uppercase tracking-widest font-semibold inline-flex items-center gap-1.5 hover:text-luxury-accent transition-colors">
                  Explore
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Box 3 */}
            <div className="group relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop" 
                alt="Cashmere Collection" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                <span className="text-[10px] uppercase tracking-widest text-luxury-accent font-semibold mb-2 block">Pure Knitwear</span>
                <h3 className="font-serif text-xl font-bold mb-4">Cashmere Knits</h3>
                <Link href="/products?category=Hoodies" className="text-xs uppercase tracking-widest font-semibold inline-flex items-center gap-1.5 hover:text-luxury-accent transition-colors">
                  Explore
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* AI STYLIST BANNER */}
        <section className="bg-neutral-50 dark:bg-neutral-900/40 border-y border-neutral-100 dark:border-neutral-900 py-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="text-[10px] uppercase tracking-widest text-luxury-accent font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Meet Your Personal AI Stylist
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-neutral-800 dark:text-neutral-100">Bespoke Fitting & Wardrobe Suggestions</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                Click the sparkling assistant in the bottom corner of your screen to get styling tips, match accessories, or determine the ideal cut based on your dimensions.
              </p>
            </div>
            <button 
              onClick={() => {
                const event = new CustomEvent('open-chatbot');
                window.dispatchEvent(event);
              }}
              className="px-6 py-3 border border-neutral-800 dark:border-neutral-200 text-xs uppercase tracking-widest font-medium hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 transition-all rounded-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-luxury-accent" />
              Open Stylist Consultation
            </button>
          </div>
        </section>

        {/* NEW ARRIVALS GRID */}
        <section className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 border-b border-neutral-100 dark:border-neutral-900 pb-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block">Selected Highlights</span>
              <h2 className="text-3xl font-serif font-bold text-neutral-800 dark:text-neutral-100">New Arrivals</h2>
            </div>
            <Link href="/products" className="text-xs uppercase tracking-widest font-semibold flex items-center gap-1 hover:text-luxury-accent text-neutral-600 dark:text-neutral-400 mt-4 sm:mt-0 transition-colors">
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.length > 0 ? (
              products.map((p) => <ProductCard key={p.id || p._id} product={p} />)
            ) : (
              // Loading/Mock elements
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-sm" />
              ))
            )}
          </div>
        </section>

        {/* REVIEWS SLIDER */}
        <section className="bg-neutral-50/50 dark:bg-neutral-900/10 py-16 border-y border-neutral-100 dark:border-neutral-900/60">
          <div className="max-w-3xl mx-auto px-6 text-center space-y-6 relative">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block">Editorial Voice</span>
            <div className="flex justify-center gap-1 text-luxury-accent">
              {Array(reviews[reviewIndex].rating).fill(0).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-luxury-accent" />
              ))}
            </div>
            
            <p className="font-serif text-lg md:text-xl italic text-neutral-700 dark:text-neutral-200 leading-relaxed font-light">
              "{reviews[reviewIndex].comment}"
            </p>
            
            <div>
              <h4 className="text-sm uppercase tracking-wider font-semibold text-neutral-900 dark:text-white">
                {reviews[reviewIndex].name}
              </h4>
              <span className="text-xs text-neutral-400 uppercase tracking-widest">
                {reviews[reviewIndex].role}
              </span>
            </div>

            {/* Slider navigations */}
            <div className="flex justify-center gap-4 mt-8">
              <button 
                onClick={handlePrevReview}
                className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-full hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 transition-colors"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextReview}
                className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-full hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 transition-colors"
                aria-label="Next review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
