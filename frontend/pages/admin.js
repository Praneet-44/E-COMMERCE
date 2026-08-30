import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ShieldAlert, Users, ShoppingBag, CheckSquare, Tag, Star, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function AdminPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'coupons' | 'reviews'
  
  // Coupon management
  const [coupons, setCoupons] = useState([
    { code: 'FASHION20', discount: '20% Off', status: 'Active' },
    { code: 'WELCOME10', discount: '10% Off', status: 'Active' },
    { code: 'LUXE500', discount: '₹500 Flat Off', status: 'Active' }
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load products & orders using existing public/seller API methods
      const productList = await api.products.getAll();
      setProducts(productList);

      const orderList = await api.orders.getSellerOrders(); // Admin role will fetch all orders
      setOrders(orderList);

      // Seed mock user listings for admin view
      setUsers([
        { id: 'u-admin-1', name: 'Alex Mercer', email: 'admin@fashionhub.com', role: 'admin', phone: '9876543210' },
        { id: 'u-seller-1', name: 'Vanguard Apparel Co.', email: 'seller@fashionhub.com', role: 'seller', phone: '9876543211' },
        { id: 'u-buyer-1', name: 'Jane Doe', email: 'buyer@fashionhub.com', role: 'buyer', phone: '9876543212' }
      ]);
    } catch(err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('fh_token');
    const user = JSON.parse(localStorage.getItem('fh_user') || '{}');
    
    if (!token || user.role !== 'admin') {
      alert('Unauthorized access: Admins only.');
      router.push('/');
      return;
    }

    loadAdminData();
  }, []);

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponDiscount.trim()) return;

    setCoupons([
      ...coupons,
      { code: newCouponCode.toUpperCase().trim(), discount: newCouponDiscount, status: 'Active' }
    ]);
    setNewCouponCode('');
    setNewCouponDiscount('');
    alert('Promo code created successfully!');
  };

  const handleToggleUserRole = (userId, currentRole) => {
    const nextRole = currentRole === 'buyer' ? 'seller' : 'buyer';
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: nextRole };
      }
      return u;
    });
    setUsers(updated);
    alert('User security role changed.');
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
        <title>Admin Panel | FashionHub</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen flex flex-col md:flex-row gap-10">
        
        {/* LEFT NAV PANEL */}
        <aside className="w-full md:w-56 shrink-0 space-y-6">
          <div className="border border-neutral-100 dark:border-neutral-900 p-5 bg-neutral-50 dark:bg-neutral-900/30 rounded-sm">
            <h3 className="font-serif font-bold text-base border-b border-neutral-200 dark:border-neutral-800 pb-2.5 mb-4 uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5 text-luxury-accent" />
              Admin Access
            </h3>
            
            <div className="flex flex-col gap-2 font-medium text-sm">
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full py-2 px-3 rounded-sm text-left flex items-center gap-2 transition-all ${
                  activeTab === 'users' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold' : 'hover:bg-neutral-150'
                }`}
              >
                <Users className="w-4.5 h-4.5" />
                Manage Accounts
              </button>
              <button 
                onClick={() => setActiveTab('coupons')}
                className={`w-full py-2 px-3 rounded-sm text-left flex items-center gap-2 transition-all ${
                  activeTab === 'coupons' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold' : 'hover:bg-neutral-150'
                }`}
              >
                <Tag className="w-4.5 h-4.5" />
                Promo Coupons
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT DASHBOARD CONTENT */}
        <main className="flex-grow space-y-10">
          
          {/* TAB 1: USER ACCOUNT ACCESS */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-serif font-bold">Manage Accounts</h2>
              
              <div className="overflow-x-auto border border-neutral-100 dark:border-neutral-900 rounded-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900/40 text-[10px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-900">
                      <th className="p-4 font-semibold">User details</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Contact phone</th>
                      <th className="p-4 font-semibold">Active role</th>
                      <th className="p-4 font-semibold">Security action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900 font-light">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors">
                        <td className="p-4 font-semibold">{u.name}</td>
                        <td className="p-4 text-xs font-sans">{u.email}</td>
                        <td className="p-4 text-xs font-sans">{u.phone}</td>
                        <td className="p-4 text-xs uppercase tracking-widest font-semibold text-luxury-accent">
                          {u.role}
                        </td>
                        <td className="p-4 text-xs">
                          {u.role !== 'admin' ? (
                            <button
                              onClick={() => handleToggleUserRole(u.id, u.role)}
                              className="px-2.5 py-1.5 border border-neutral-300 dark:border-neutral-800 rounded-sm hover:border-luxury-accent transition-all text-[10px] uppercase font-bold tracking-widest"
                            >
                              Toggle Seller/Buyer
                            </button>
                          ) : (
                            <span className="text-neutral-400 italic">Protected Admin</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: COUPON PROMO CODES */}
          {activeTab === 'coupons' && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-serif font-bold">Active Promo Coupons</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* List Coupons */}
                <div className="space-y-4">
                  <span className="text-xs uppercase tracking-widest font-semibold text-neutral-400 block mb-2">Active Codes</span>
                  <div className="space-y-3">
                    {coupons.map((c, idx) => (
                      <div key={idx} className="p-4 border border-neutral-100 dark:border-neutral-900 rounded-sm flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/20">
                        <div>
                          <strong className="block text-sm font-sans tracking-wide text-neutral-800 dark:text-neutral-100">{c.code}</strong>
                          <span className="text-xs text-neutral-400 font-light">{c.discount}</span>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full font-bold uppercase tracking-widest">
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Coupon Form */}
                <div className="p-6 border border-neutral-100 dark:border-neutral-900 rounded-sm space-y-4 h-fit bg-neutral-50 dark:bg-neutral-900/10">
                  <span className="text-xs uppercase tracking-widest font-semibold text-neutral-400 block mb-2">Generate New Coupon</span>
                  
                  <form onSubmit={handleAddCoupon} className="space-y-4 text-xs font-light">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-neutral-450 font-semibold block">Coupon Code</label>
                      <input 
                        type="text" 
                        placeholder="e.g. SAVINGS30"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent uppercase font-sans font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-neutral-455 font-semibold block">Discount Value / Text</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 30% Off / Flat ₹300 Off"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-luxury-accent hover:text-white transition-all shadow-md"
                    >
                      Create Coupon
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
