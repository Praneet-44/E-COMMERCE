import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SlidersHorizontal, Search, X, Loader2 } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { api } from '../../services/api';

export default function Catalog() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter and Sort states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');

  // Parse queries from URL on load
  useEffect(() => {
    if (router.isReady) {
      if (router.query.category) setCategory(router.query.category);
      if (router.query.gender) setGender(router.query.gender);
      if (router.query.search) setSearch(router.query.search);
    }
  }, [router.isReady, router.query]);

  // Trigger search fetch on filter/sort changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await api.products.getAll({
          category,
          gender,
          size,
          color,
          minPrice,
          maxPrice,
          search,
          sort
        });
        setProducts(data);
      } catch (err) {
        console.error('Error fetching catalog products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, gender, size, color, minPrice, maxPrice, search, sort]);

  const clearFilters = () => {
    setCategory('');
    setGender('');
    setSize('');
    setColor('');
    setMinPrice('');
    setMaxPrice('');
    setSearch('');
    setSort('newest');
    router.replace('/products', undefined, { shallow: true });
  };

  const categories = ['Outerwear', 'Shirts', 'Pants', 'Hoodies'];
  const genders = ['Men', 'Women', 'Unisex'];
  const sizes = ['S', 'M', 'L', 'XL', '30', '32', '34'];
  const colors = ['Charcoal', 'Black', 'Cream', 'White', 'Navy', 'Beige', 'Olive', 'Heather Grey'];

  return (
    <>
      <Head>
        <title>Collections Archive | FashionHub</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 min-h-screen">
        {/* Title Header */}
        <div className="border-b border-neutral-100 dark:border-neutral-900 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block">Seasonal Registry</span>
            <h1 className="text-3xl font-serif font-bold text-neutral-800 dark:text-neutral-100">Collections Archive</h1>
          </div>
          
          {/* Search bar & Mobile filter toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-grow sm:flex-grow-0">
              <input 
                type="text" 
                placeholder="Search wardrobe..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-md text-sm outline-none text-neutral-800 dark:text-neutral-100 focus:border-luxury-accent transition-colors"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            </div>

            <button 
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 p-2 border border-neutral-200 dark:border-neutral-800 rounded-md text-sm hover:border-luxury-accent"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Catalog Main Layout */}
        <div className="flex gap-10">
          
          {/* SIDEBAR FILTERS (DESKTOP) */}
          <aside className="hidden md:block w-60 shrink-0 space-y-8">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <h3 className="font-serif font-bold text-lg">Filters</h3>
              <button onClick={clearFilters} className="text-xs uppercase tracking-wider text-neutral-400 hover:text-luxury-accent transition-colors font-medium">
                Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-neutral-500 dark:text-neutral-400">Category</h4>
              <div className="space-y-2 text-sm font-light">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2.5 cursor-pointer hover:text-luxury-accent">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={category === cat}
                      onChange={() => setCategory(cat)}
                      className="accent-luxury-accent"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-neutral-500 dark:text-neutral-400">Gender</h4>
              <div className="space-y-2 text-sm font-light">
                {genders.map((g) => (
                  <label key={g} className="flex items-center gap-2.5 cursor-pointer hover:text-luxury-accent">
                    <input 
                      type="radio" 
                      name="gender" 
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      className="accent-luxury-accent"
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>

            {/* Sizes Filter */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-neutral-500 dark:text-neutral-400">Sizes</h4>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(size === s ? '' : s)}
                    className={`text-xs w-9 h-9 border rounded-sm transition-all flex items-center justify-center ${
                      size === s 
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900' 
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-luxury-accent text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors Filter */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-neutral-500 dark:text-neutral-400">Colors</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(color === c ? '' : c)}
                    className={`text-[10px] uppercase tracking-wider px-2.5 py-1 border rounded-sm transition-all ${
                      color === c 
                        ? 'border-luxury-accent text-luxury-accent font-semibold bg-luxury-accent/5' 
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-luxury-accent text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-neutral-500 dark:text-neutral-400">Price Range</h4>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm text-neutral-800 dark:text-neutral-100"
                />
                <span className="text-neutral-400 font-light text-xs">to</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm text-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>

          </aside>

          {/* MAIN PRODUCT ARCHIVES GRID */}
          <main className="flex-grow space-y-6">
            
            {/* Top Bar Sort Selector */}
            <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/30 p-3 border border-neutral-100 dark:border-neutral-900 rounded-sm">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-light">
                Showing **{products.length}** results
              </span>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 uppercase tracking-wider">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent text-xs font-medium border-none outline-none text-neutral-800 dark:text-neutral-100 cursor-pointer"
                >
                  <option value="newest" className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100">Newest Arrivals</option>
                  <option value="price_asc" className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100">Price: Low to High</option>
                  <option value="price_desc" className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100">Price: High to Low</option>
                  <option value="best_selling" className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100">Best Selling</option>
                </select>
              </div>
            </div>

            {/* Grid List */}
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-luxury-accent animate-spin" />
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((p) => (
                  <ProductCard key={p.id || p._id} product={p} />
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm p-6 text-center space-y-3">
                <p className="text-neutral-400 font-light text-sm">We couldn't find items in our wardrobe matching your exact filters.</p>
                <button onClick={clearFilters} className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-luxury-accent hover:text-white transition-all">
                  Reset Filter Parameters
                </button>
              </div>
            )}

          </main>

        </div>
      </div>

      {/* MOBILE FILTERS DRAWER */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-80 bg-white dark:bg-neutral-950 p-6 flex flex-col overflow-y-auto shadow-2xl border-l border-neutral-100 dark:border-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4 mb-6">
              <h3 className="font-serif font-bold text-lg">Filters</h3>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Category */}
            <div className="border-b border-neutral-100 dark:border-neutral-900 pb-6 mb-6">
              <h4 className="text-xs uppercase tracking-widest font-semibold mb-3">Category</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(category === cat ? '' : cat)}
                    className={`text-xs px-3 py-1.5 border rounded-full ${
                      category === cat 
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900' 
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Gender */}
            <div className="border-b border-neutral-100 dark:border-neutral-900 pb-6 mb-6">
              <h4 className="text-xs uppercase tracking-widest font-semibold mb-3">Gender</h4>
              <div className="flex flex-wrap gap-2">
                {genders.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(gender === g ? '' : g)}
                    className={`text-xs px-3 py-1.5 border rounded-full ${
                      gender === g 
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900' 
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Sizes */}
            <div className="border-b border-neutral-100 dark:border-neutral-900 pb-6 mb-6">
              <h4 className="text-xs uppercase tracking-widest font-semibold mb-3">Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(size === s ? '' : s)}
                    className={`text-xs w-9 h-9 border rounded-sm flex items-center justify-center ${
                      size === s 
                        ? 'border-neutral-900 bg-neutral-900 text-white' 
                        : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset / Apply */}
            <div className="mt-auto pt-6 flex gap-3">
              <button 
                onClick={() => { clearFilters(); setShowMobileFilters(false); }}
                className="w-full py-3 border border-neutral-200 dark:border-neutral-800 text-xs uppercase tracking-widest font-medium rounded-sm"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs uppercase tracking-widest font-medium rounded-sm"
              >
                Apply
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
