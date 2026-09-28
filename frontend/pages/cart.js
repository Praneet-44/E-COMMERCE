import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Trash2, ShoppingBag, ArrowRight, Loader2, Tag } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Cart() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  const loadCart = async () => {
    setLoading(true);
    const token = localStorage.getItem('fh_token');
    
    if (!token) {
      // Offline fallback: load from LocalStorage
      try {
        const local = JSON.parse(localStorage.getItem('fh_cart') || '[]');
        setCartItems(local);
      } catch (e) {
        setCartItems([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const data = await api.cart.get();
      setCartItems(data);
      localStorage.setItem('fh_cart', JSON.stringify(data));
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    const token = localStorage.getItem('fh_token');

    if (!token) {
      // Offline edit
      const updated = cartItems.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
      setCartItems(updated);
      localStorage.setItem('fh_cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cart-updated'));
      return;
    }

    try {
      await api.cart.update(itemId, newQty);
      loadCart();
    } catch (err) {
      alert(err.message || 'Failed to update quantity.');
    }
  };

  const handleRemove = async (itemId) => {
    const token = localStorage.getItem('fh_token');

    if (!token) {
      // Offline remove
      const updated = cartItems.filter(item => item.id !== itemId);
      setCartItems(updated);
      localStorage.setItem('fh_cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cart-updated'));
      return;
    }

    try {
      await api.cart.remove(itemId);
      loadCart();
    } catch (err) {
      alert(err.message || 'Failed to remove item.');
    }
  };

  const applyCoupon = () => {
    setCouponError('');
    const code = coupon.toUpperCase().trim();
    if (code === 'FASHION20' || code === 'WELCOME10' || code === 'LUXE500') {
      setAppliedCoupon(code);
      localStorage.setItem('fh_coupon', code);
    } else {
      setCouponError('Invalid promo code.');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon('');
    localStorage.removeItem('fh_coupon');
  };

  // Calculations
  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.product.price * (1 - (item.product.discount || 0) / 100);
      return acc + price * item.quantity;
    }, 0);
  };

  const subtotal = getSubtotal();
  let discountAmount = 0;
  if (appliedCoupon === 'FASHION20') discountAmount = subtotal * 0.20;
  else if (appliedCoupon === 'WELCOME10') discountAmount = subtotal * 0.10;
  else if (appliedCoupon === 'LUXE500') discountAmount = Math.min(500, subtotal * 0.5);

  const tax = Math.round((subtotal - discountAmount) * 0.18);
  const shipping = subtotal - discountAmount > 2000 || subtotal === 0 ? 0 : 150;
  const total = Math.round(subtotal - discountAmount + tax + shipping);

  const handleCheckoutRedirect = () => {
    const token = localStorage.getItem('fh_token');
    if (!token) {
      alert('Please sign in or register to complete your order.');
      router.push('/auth/login?redirect=checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-luxury-accent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Shopping Cart | FashionHub</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen">
        <h1 className="text-3xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-10">
          {t('cart.title', 'Shopping Cart')}
        </h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT: LIST ITEMS */}
            <div className="lg:col-span-8 space-y-6">
              {cartItems.map((item) => {
                const finalPrice = Math.round(item.product.price * (1 - (item.product.discount || 0) / 100));
                return (
                  <div 
                    key={item.id || item._id} 
                    className="flex flex-col sm:flex-row gap-6 p-5 border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-neutral-900/20 rounded-sm hover:shadow-sm transition-all"
                  >
                    {/* Image */}
                    <Link href={`/products/${item.product_id}`} className="w-24 aspect-[3/4] bg-neutral-50 rounded-sm overflow-hidden shrink-0">
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div className="space-y-1.5">
                        <Link href={`/products/${item.product_id}`} className="hover:text-luxury-accent">
                          <h3 className="font-serif font-bold text-base text-neutral-850 dark:text-neutral-100">{item.product.name}</h3>
                        </Link>
                        
                        <div className="flex gap-4 text-xs text-neutral-400 font-light">
                          <span>Size: <strong className="text-neutral-600 dark:text-neutral-200">{item.size}</strong></span>
                          <span>Color: <strong className="text-neutral-600 dark:text-neutral-200">{item.color}</strong></span>
                        </div>
                      </div>

                      {/* Controls and Price */}
                      <div className="flex items-center justify-between mt-4">
                        {/* Qty edit */}
                        <div className="flex items-center border border-neutral-250 dark:border-neutral-850 rounded-sm">
                          <button 
                            onClick={() => handleUpdateQty(item.id || item._id, item.quantity - 1)}
                            className="px-2.5 py-1 text-sm font-medium hover:bg-neutral-150"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQty(item.id || item._id, item.quantity + 1)}
                            className="px-2.5 py-1 text-sm font-medium hover:bg-neutral-150"
                          >
                            +
                          </button>
                        </div>

                        {/* Price & Trash */}
                        <div className="flex items-center gap-6">
                          <span className="font-bold text-sm">
                            ₹{(finalPrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <button 
                            onClick={() => handleRemove(item.id || item._id)}
                            className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>

            {/* RIGHT: SUMMARY CARD */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Checkout values Card */}
              <div className="border border-neutral-100 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-900/30 p-6 rounded-sm space-y-6">
                <h3 className="font-serif font-bold text-lg border-b border-neutral-200 dark:border-neutral-800 pb-3">
                  {t('cart.summary', 'Order Summary')}
                </h3>
                
                <div className="space-y-3.5 text-sm font-light">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t('cart.subtotal', 'Subtotal')}</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-luxury-accent">
                      <span>Discount ({appliedCoupon})</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-neutral-500">Tax (GST 18%)</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t('cart.shipping', 'Shipping')}</span>
                    <span>{shipping === 0 ? t('cart.freeShipping', 'FREE') : `₹${shipping}`}</span>
                  </div>
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex justify-between font-bold text-base">
                  <span>{t('cart.total', 'Total')}</span>
                  <span className="text-lg">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <button 
                  onClick={handleCheckoutRedirect}
                  className="w-full py-3.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold uppercase tracking-widest hover:bg-luxury-accent hover:text-white dark:hover:bg-luxury-accent dark:hover:text-white rounded-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {t('cart.proceedCheckout', 'Proceed to Checkout')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Coupon Card */}
              <div className="border border-neutral-100 dark:border-neutral-900 p-5 rounded-sm space-y-4">
                <span className="text-xs uppercase tracking-widest font-bold text-neutral-500 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-luxury-accent" />
                  Promo Codes
                </span>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-luxury-cream text-neutral-800 text-xs font-medium rounded-sm glass">
                    <span>Active: **{appliedCoupon}**</span>
                    <button onClick={removeCoupon} className="text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. FASHION20" 
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="flex-grow px-3 py-1.5 text-xs bg-transparent border border-neutral-250 dark:border-neutral-850 rounded-sm text-neutral-800 dark:text-neutral-100 uppercase"
                    />
                    <button 
                      onClick={applyCoupon}
                      className="px-4 py-1.5 bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-900"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[10px] text-red-500">{couponError}</p>}
                
                <div className="text-[10px] text-neutral-400 space-y-1 font-light">
                  <p>• **WELCOME10**: 10% off items</p>
                  <p>• **FASHION20**: 20% off items</p>
                  <p>• **LUXE500**: ₹500 off (Min value ₹1000)</p>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm space-y-4">
            <ShoppingBag className="w-12 h-12 text-neutral-300" />
            <div className="space-y-1">
              <h2 className="text-xl font-serif font-bold">Your wardrobe is empty</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light max-w-sm">Browse our curated seasonal capsule collections and add your first pieces.</p>
            </div>
            <Link href="/products" className="px-6 py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold uppercase tracking-widest rounded-sm">
              Explore Collections
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
