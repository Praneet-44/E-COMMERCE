import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ShoppingBag, Heart, Star, Sparkles, AlertCircle, Plus, Minus, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  
  // Review form states
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fh_user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const prodData = await api.products.getById(id);
        setProduct(prodData);
        if (prodData.sizes && prodData.sizes.length > 0) setSelectedSize(prodData.sizes[0]);
        if (prodData.colors && prodData.colors.length > 0) setSelectedColor(prodData.colors[0]);

        const reviewData = await api.reviews.get(id);
        setReviews(reviewData);

        // Check if item is wishlisted
        const wishlist = JSON.parse(localStorage.getItem('fh_wishlist') || '[]');
        setIsWishlisted(wishlist.includes(id));
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const handleZoom = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.7)'
    });
  };

  const handleZoomReset = () => {
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  const handleAddToCart = async (redirect = false) => {
    if (!product) return;
    setAddingToCart(true);

    const token = localStorage.getItem('fh_token');
    
    if (!token) {
      // Offline fallback: Use LocalStorage for cart
      try {
        const localCart = JSON.parse(localStorage.getItem('fh_cart') || '[]');
        const existingIdx = localCart.findIndex(
          item => item.product_id === (product.id || product._id) && 
                  item.color === selectedColor && 
                  item.size === selectedSize
        );

        if (existingIdx > -1) {
          localCart[existingIdx].quantity += quantity;
        } else {
          localCart.push({
            id: `local-${Date.now()}`,
            product_id: product.id || product._id,
            quantity,
            color: selectedColor,
            size: selectedSize,
            product: {
              name: product.name,
              price: product.price,
              discount: product.discount,
              images: product.images,
              stock: product.stock
            }
          });
        }
        localStorage.setItem('fh_cart', JSON.stringify(localCart));
        window.dispatchEvent(new Event('cart-updated'));
        
        if (redirect) {
          router.push('/cart');
        } else {
          alert('Product added to wardrobe cart successfully!');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setAddingToCart(false);
      }
      return;
    }

    try {
      await api.cart.add(product.id || product._id, quantity, selectedColor, selectedSize);
      
      // Update local cart copies as well
      const updatedCart = await api.cart.get();
      localStorage.setItem('fh_cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cart-updated'));

      if (redirect) {
        router.push('/cart');
      } else {
        alert('Product added to wardrobe cart successfully!');
      }
    } catch (err) {
      alert(err.message || 'Error adding item to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    if (!product) return;
    const prodId = product.id || product._id;
    let wishlist = JSON.parse(localStorage.getItem('fh_wishlist') || '[]');
    
    if (isWishlisted) {
      wishlist = wishlist.filter(x => x !== prodId);
      setIsWishlisted(false);
    } else {
      wishlist.push(prodId);
      setIsWishlisted(true);
    }
    localStorage.setItem('fh_wishlist', JSON.stringify(wishlist));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!userComment.trim()) return;
    setSubmittingReview(true);

    try {
      const newReview = await api.reviews.create(product.id || product._id, userRating, userComment);
      setReviews(prev => [newReview, ...prev]);
      setUserComment('');
      alert('Thank you. Your critique has been recorded.');
    } catch (err) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-luxury-accent animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-2xl font-serif font-bold">Product Not Found</h2>
        <button onClick={() => router.push('/products')} className="px-6 py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold uppercase tracking-widest rounded-sm">
          Return to Collections
        </button>
      </div>
    );
  }

  const finalPrice = Math.round(product.price * (1 - (product.discount || 0) / 100));
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  return (
    <>
      <Head>
        <title>{product.name} | FashionHub</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-20">
        
        {/* UPPER INFO: GALLERY & SPECS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* LEFT: GALLERY CAROUSEL */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Image Frame with Zoom */}
            <div 
              className="relative aspect-[3/4] bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-sm overflow-hidden cursor-zoom-in"
              onMouseMove={handleZoom}
              onMouseLeave={handleZoomReset}
            >
              <img 
                src={product.images[activeImageIdx]} 
                alt={product.name}
                style={zoomStyle}
                className="w-full h-full object-cover object-top transition-transform duration-100 ease-out"
              />
            </div>

            {/* Thumbnails row */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 aspect-[3/4] border rounded-sm overflow-hidden shrink-0 transition-all ${
                      activeImageIdx === idx ? 'border-luxury-accent ring-1 ring-luxury-accent' : 'border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: SPECS & BUY OPTIONS */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Title, rating */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold block">
                {product.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-800 dark:text-neutral-100 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-luxury-accent">
                  <Star className="w-4 h-4 fill-luxury-accent" />
                  <span className="font-semibold">{avgRating}</span>
                </div>
                <span className="text-neutral-300">|</span>
                <span className="text-neutral-500 dark:text-neutral-400 font-light underline cursor-pointer">
                  {reviews.length} Critique Reviews
                </span>
              </div>
            </div>

            {/* Price list */}
            <div className="border-y border-neutral-100 dark:border-neutral-900 py-5 flex items-baseline gap-4">
              {product.discount > 0 ? (
                <>
                  <span className="text-3xl font-sans font-bold text-neutral-900 dark:text-neutral-100">
                    ₹{finalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-base text-neutral-400 line-through">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-luxury-accent uppercase tracking-widest font-bold">
                    Save {product.discount}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-sans font-bold text-neutral-900 dark:text-neutral-100">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed font-light">
              {product.description}
            </p>

            {/* Color selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500">Color Palette</span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`text-xs px-3 py-1.5 border rounded-sm transition-all ${
                        selectedColor === c
                          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 font-medium'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-luxury-accent'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="uppercase tracking-widest text-neutral-500">Select Silhouette Size</span>
                  <button 
                    onClick={() => {
                      const event = new CustomEvent('open-chatbot');
                      window.dispatchEvent(event);
                    }}
                    className="text-luxury-accent hover:text-luxury-accentHover flex items-center gap-1 font-medium transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask AI Stylist for size
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-12 h-12 border rounded-sm flex items-center justify-center text-xs transition-all ${
                        selectedSize === s
                          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 font-semibold'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-luxury-accent'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity selection & Stock Status */}
            <div className="flex items-center gap-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500 block">Quantity</span>
                <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-sm">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="p-2.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 font-sans text-sm font-semibold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="p-2.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500 block mb-2">Availability</span>
                {product.stock > 0 ? (
                  <span className="text-xs font-semibold px-2.5 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-sm">
                    {product.stock} items in vault
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1.5 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 rounded-sm">
                    Vault Empty (Out of Stock)
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => handleAddToCart(false)}
                disabled={addingToCart || product.stock <= 0}
                className="w-full py-4 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-luxury-accent hover:text-white dark:hover:bg-luxury-accent dark:hover:text-white transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Wardrobe
              </button>

              <button
                onClick={() => handleAddToCart(true)}
                disabled={addingToCart || product.stock <= 0}
                className="w-full py-4 border border-neutral-900 dark:border-neutral-200 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
              >
                Buy Now
              </button>

              <button
                onClick={handleWishlist}
                className={`p-4 border rounded-sm flex items-center justify-center transition-all ${
                  isWishlisted 
                    ? 'border-red-200 bg-red-50 text-red-500 dark:bg-red-950/20 dark:border-red-900' 
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-red-500'
                }`}
                aria-label="Add to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </button>
            </div>

          </div>

        </div>

        {/* LOWER INFO: REVIEWS SECTION */}
        <section className="border-t border-neutral-100 dark:border-neutral-900 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Write review */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xl font-serif font-bold">Write a Critique</h3>
            
            {user ? (
              <form onSubmit={submitReview} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block">Rating Score</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setUserRating(val)}
                        className={`p-1 transition-colors ${
                          userRating >= val ? 'text-luxury-accent' : 'text-neutral-200 dark:text-neutral-800'
                        }`}
                      >
                        <Star className={`w-6 h-6 ${userRating >= val ? 'fill-luxury-accent' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block">Your Review</label>
                  <textarea
                    rows={4}
                    placeholder="Provide your experience regarding fit, fabric feel, and craftsmanship drape..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm text-sm outline-none focus:border-luxury-accent transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-luxury-accent hover:text-white transition-all shadow-sm"
                >
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="p-5 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm text-center">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light mb-3">Please sign in to write a review for this product.</p>
                <button onClick={() => router.push('/auth/login')} className="px-4 py-2 border border-neutral-850 dark:border-neutral-200 text-xs font-medium uppercase tracking-wider rounded-sm hover:bg-neutral-50">
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* List reviews */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-xl font-serif font-bold">Critique Reviews ({reviews.length})</h3>
            
            {reviews.length > 0 ? (
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {reviews.map((rev) => (
                  <div key={rev.id || rev._id} className="border-b border-neutral-100 dark:border-neutral-900 pb-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{rev.user_name}</h4>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(rev.createdAt || rev.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-0.5 text-luxury-accent">
                      {Array(rev.rating).fill(0).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-luxury-accent" />
                      ))}
                    </div>

                    <p className="text-neutral-500 dark:text-neutral-400 text-xs font-light leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-400 font-light text-sm italic py-4">No reviews have been written for this piece yet.</p>
            )}
          </div>

        </section>

      </div>
    </>
  );
}
