import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { User, Package, Heart, LogOut, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'wishlist'

  const handleLogout = () => {
    localStorage.removeItem('fh_token');
    localStorage.removeItem('fh_user');
    window.dispatchEvent(new Event('auth-changed'));
    router.push('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('fh_token');
    if (!token) {
      router.push('/auth/login?redirect=profile');
      return;
    }

    const loadProfileData = async () => {
      setLoading(true);
      try {
        // Load Profile
        const profileResponse = await api.auth.getProfile();
        setUser(profileResponse.user);
        
        // Load Orders
        const orderResponse = await api.orders.getMyOrders();
        setOrders(orderResponse);

        // Load Wishlist
        const wishlistIds = JSON.parse(localStorage.getItem('fh_wishlist') || '[]');
        const wishListItems = [];
        for (const pid of wishlistIds) {
          try {
            const p = await api.products.getById(pid);
            if (p) wishListItems.push(p);
          } catch(e) {}
        }
        setWishlistProducts(wishListItems);
      } catch (err) {
        console.error('Error loading profile page:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Shipped':
        return 'bg-blue-50 text-blue-755 dark:bg-blue-950/20 dark:text-blue-400';
      case 'Confirmed':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400';
      default:
        return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-luxury-accent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Head>
        <title>My Account Profile | FashionHub</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: USER DETAILS PANEL */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-neutral-100 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-900/30 p-6 rounded-sm space-y-6 text-center">
              
              {/* Profile Avatar */}
              <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto border border-luxury-accent/30 shadow-inner">
                <User className="w-10 h-10 text-neutral-500 dark:text-neutral-400" />
              </div>

              {/* Name Details */}
              <div className="space-y-1">
                <h2 className="font-serif font-bold text-xl leading-tight">{user.name}</h2>
                <span className="text-[10px] text-luxury-accent uppercase tracking-widest font-bold block">{user.role} Member</span>
              </div>

              {/* Contacts */}
              <div className="space-y-3.5 text-xs text-neutral-500 dark:text-neutral-400 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-left font-light leading-relaxed">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">Email</span>
                  <strong className="text-neutral-700 dark:text-neutral-200">{user.email}</strong>
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5">Mobile Contact</span>
                  <strong className="text-neutral-700 dark:text-neutral-200">{user.phone}</strong>
                </div>
              </div>

              {/* Signout */}
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/20 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>

            </div>
          </div>

          {/* RIGHT: TABS AND TAB CONTENT */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Tab Headers */}
            <div className="flex border-b border-neutral-100 dark:border-neutral-900 pb-3 gap-6 text-sm uppercase tracking-widest font-semibold">
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'orders' ? 'border-luxury-accent text-luxury-accent' : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <Package className="w-4 h-4" />
                Order History ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'wishlist' ? 'border-luxury-accent text-luxury-accent' : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <Heart className="w-4 h-4" />
                Saved Pieces ({wishlistProducts.length})
              </button>
            </div>

            {/* TAB CONTENT: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {orders.length > 0 ? (
                  orders.map((ord) => (
                    <div key={ord.id || ord._id} className="border border-neutral-100 dark:border-neutral-900 rounded-sm overflow-hidden p-6 space-y-4">
                      {/* Order info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4 gap-4 text-xs font-medium text-neutral-500">
                        <div className="space-y-1">
                          <span className="block font-semibold">ORDER ID: {ord.id || ord._id}</span>
                          <span className="block font-light">Placed on: {new Date(ord.createdAt || ord.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1.5 rounded-sm text-[10px] uppercase font-bold tracking-widest ${getStatusBadge(ord.order_status)}`}>
                            {ord.order_status}
                          </span>
                          <span className="font-sans font-bold text-neutral-800 dark:text-neutral-100 text-sm">
                            ₹{ord.total_amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-semibold block">{item.name}</span>
                              <span className="text-xs text-neutral-400 font-light">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</span>
                            </div>
                            <span className="font-sans text-neutral-600 dark:text-neutral-350">₹{item.price.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {/* Address */}
                      <div className="bg-neutral-50 dark:bg-neutral-900/30 p-3 rounded-sm text-xs font-light text-neutral-500 leading-relaxed">
                        <span className="block font-semibold uppercase tracking-wider text-[9px] mb-1">Shipping Destination</span>
                        {ord.billing_details.address}, {ord.billing_details.city}, {ord.billing_details.state} - {ord.billing_details.pincode}
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm text-center space-y-3">
                    <p className="text-sm text-neutral-400 font-light italic">No order invoices are saved under this profile.</p>
                    <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-luxury-accent hover:underline uppercase tracking-wider">
                      Shop our listings
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {wishlistProducts.length > 0 ? (
                  wishlistProducts.map((p) => {
                    const finalPrice = Math.round(p.price * (1 - (p.discount || 0)/100));
                    return (
                      <div key={p.id || p._id} className="border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-neutral-900 p-4 rounded-sm flex gap-4 items-center">
                        <img src={p.images[0]} alt={p.name} className="w-16 h-20 object-cover object-top rounded-sm" />
                        <div className="flex-grow space-y-1">
                          <h4 className="font-serif font-bold text-sm line-clamp-1">{p.name}</h4>
                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">{p.category}</span>
                          <div className="font-sans font-bold text-xs">₹{finalPrice.toLocaleString('en-IN')}</div>
                        </div>
                        <Link href={`/products/${p.id || p._id}`}>
                          <button className="p-2 border border-neutral-200 dark:border-neutral-800 rounded-full hover:bg-neutral-900 hover:text-white transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm text-center space-y-3">
                    <p className="text-sm text-neutral-400 font-light italic">Your wishlist archive is currently empty.</p>
                    <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-luxury-accent hover:underline uppercase tracking-wider">
                      Save details from catalog
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
}
