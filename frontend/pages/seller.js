import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Plus, Edit, Trash2, LayoutDashboard, ShoppingBag, FolderHeart, Users, CheckCircle, Loader2, X } from 'lucide-react';
import { api } from '../services/api';

export default function SellerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders'
  
  // Product modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingProductId, setEditingProductId] = useState('');
  
  // State to track custom dress option
  const [isCustom, setIsCustom] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    category: 'Outerwear',
    sizes: 'S, M, L, XL',
    colors: 'Black, Charcoal',
    gender: 'Unisex',
    image: '',
    // Custom dress fields (optional)
    measurements: '', // e.g., "Chest:38in,Waste:30in,Hips:40in,Length:44in"
    custom: false
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const analyticsData = await api.orders.getAnalytics();
      setAnalytics(analyticsData);

      const productList = await api.products.getAll();
      setProducts(productList);

      const orderList = await api.orders.getSellerOrders();
      setOrders(orderList);
    } catch (err) {
      console.error('Error loading seller metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('fh_token');
    const user = JSON.parse(localStorage.getItem('fh_user') || '{}');
    
    if (!token || (user.role !== 'seller' && user.role !== 'admin')) {
      alert('Unauthorized access: Sellers only.');
      router.push('/');
      return;
    }

    loadDashboardData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.orders.updateStatus(orderId, newStatus);
      loadDashboardData();
      alert(`Order marked as ${newStatus}`);
    } catch(err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleMarkAsPaid = async (orderId) => {
    if (!confirm('Mark this order as Paid? This cannot be undone.')) return;
    try {
      await api.orders.markAsPaid(orderId);
      loadDashboardData();
      alert('Payment marked as Paid successfully.');
    } catch(err) {
      alert(err.message || 'Failed to update payment status.');
    }
  };

  const handleInputChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setModalMode('add');
    setProductForm({
      name: '',
      description: '',
      price: '',
      discount: '0',
      stock: '',
      category: 'Outerwear',
      sizes: 'S, M, L, XL',
      colors: 'Black, Charcoal',
      gender: 'Unisex',
      image: '',
      measurements: '',
      custom: false
    });
    setCustomCategory('');
    setIsCustom(false);
    setShowProductModal(true);
  };

  const openEditModal = (p) => {
    setModalMode('edit');
    setEditingProductId(p.id || p._id);
    const standardCategories = ['Outerwear', 'Shirts', 'Pants', 'Hoodies'];
    const isStandard = standardCategories.includes(p.category);
    setProductForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      discount: String(p.discount || 0),
      stock: String(p.stock),
      category: isStandard ? p.category : 'Other',
      sizes: p.sizes ? p.sizes.join(', ') : 'M, L',
      colors: p.colors ? p.colors.join(', ') : 'Black',
      gender: p.gender || 'Unisex',
      image: p.images ? p.images[0] : '',
      measurements: p.measurements || '',
      custom: !!p.custom
    });
    setCustomCategory(isStandard ? '' : p.category);
    setIsCustom(!!p.custom);
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = productForm.category === 'Other' ? customCategory : productForm.category;
    const payload = {
      ...productForm,
      category: finalCategory,
      price: Number(productForm.price),
      discount: Number(productForm.discount),
      stock: Number(productForm.stock),
      sizes: productForm.sizes.split(',').map(x => x.trim()).filter(Boolean),
      colors: productForm.colors.split(',').map(x => x.trim()).filter(Boolean),
      images: productForm.image ? [productForm.image] : undefined
    };

    try {
      if (modalMode === 'add') {
        await api.products.create(payload);
        alert('Product uploaded successfully!');
      } else {
        await api.products.update(editingProductId, payload);
        alert('Product details updated successfully!');
      }
      setShowProductModal(false);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to save product details.');
    }
  };

  const handleDeleteProduct = async (pid) => {
    if (!confirm('Are you sure you want to delete this piece?')) return;
    try {
      await api.products.delete(pid);
      loadDashboardData();
      alert('Product removed successfully.');
    } catch (err) {
      alert(err.message || 'Error deleting product.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-luxury-accent animate-spin" />
      </div>
    );
  }

  // Draw custom SVG charts paths dynamically based on backend statistics
  const drawSVGChart = () => {
    if (!analytics || !analytics.monthlySales.length) return null;
    const data = analytics.monthlySales.map(x => x.amount);
    const maxVal = Math.max(...data, 10000);
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * 500 + 40;
      const y = 220 - (val / maxVal) * 160;
      return `${x},${y}`;
    });

    const dPath = `M ${points.join(' L ')}`;
    const areaPath = `${dPath} L ${500 + 40},220 L 40,220 Z`;

    return (
      <svg viewBox="0 0 600 250" className="w-full h-auto text-neutral-800 dark:text-neutral-200">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C5A880" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#C5A880" stopOpacity="0.00" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        <line x1="40" y1="220" x2="560" y2="220" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
        <line x1="40" y1="140" x2="560" y2="140" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="3" />
        <line x1="40" y1="60" x2="560" y2="60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="3" />
        
        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGrad)" />
        {/* Line */}
        <path d={dPath} fill="none" stroke="#C5A880" strokeWidth="2.5" />
        
        {/* Plot points */}
        {data.map((val, idx) => {
          const x = (idx / (data.length - 1)) * 500 + 40;
          const y = 220 - (val / maxVal) * 160;
          return (
            <g key={idx} className="group">
              <circle cx={x} cy={y} r="4.5" fill="#C5A880" className="cursor-pointer hover:r-6 transition-all" />
              <text x={x} y={y - 12} textAnchor="middle" className="text-[10px] fill-neutral-800 dark:fill-neutral-200 font-bold hidden group-hover:block font-sans">
                ₹{val.toLocaleString()}
              </text>
              <text x={x} y="240" textAnchor="middle" className="text-[9px] fill-neutral-400 font-medium font-sans">
                {analytics.monthlySales[idx].month}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <>
      <Head>
        <title>Seller Dashboard | FashionHub</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen flex flex-col md:flex-row gap-10">
        
        {/* LEFT NAV PANEL */}
        <aside className="w-full md:w-56 shrink-0 space-y-6">
          <div className="border border-neutral-100 dark:border-neutral-900 p-5 bg-neutral-50 dark:bg-neutral-900/30 rounded-sm">
            <h3 className="font-serif font-bold text-base border-b border-neutral-200 dark:border-neutral-800 pb-2.5 mb-4 uppercase tracking-widest text-neutral-500">Navigation</h3>
            
            <div className="flex flex-col gap-2 font-medium text-sm">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full py-2 px-3 rounded-sm text-left flex items-center gap-2 transition-all ${
                  activeTab === 'overview' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold' : 'hover:bg-neutral-150'
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5" />
                Metrics Summary
              </button>
              <button 
                onClick={() => setActiveTab('products')}
                className={`w-full py-2 px-3 rounded-sm text-left flex items-center gap-2 transition-all ${
                  activeTab === 'products' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold' : 'hover:bg-neutral-150'
                }`}
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                Manage Products
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full py-2 px-3 rounded-sm text-left flex items-center gap-2 transition-all ${
                  activeTab === 'orders' ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold' : 'hover:bg-neutral-150'
                }`}
              >
                <CheckCircle className="w-4.5 h-4.5" />
                Order Invoices
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT DASHBOARD CONTENT */}
        <main className="flex-grow space-y-10">
          
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-serif font-bold">Seller Intelligence Metrics</h2>
              
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="p-5 border border-neutral-100 dark:border-neutral-900 rounded-sm">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-450 block font-light">Gross revenue</span>
                  <div className="text-xl font-bold font-sans mt-2">₹{analytics.summary.totalRevenue.toLocaleString('en-IN')}</div>
                </div>
                <div className="p-5 border border-neutral-100 dark:border-neutral-900 rounded-sm">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-450 block font-light">Garments sold</span>
                  <div className="text-xl font-bold font-sans mt-2">{analytics.summary.totalSales} units</div>
                </div>
                <div className="p-5 border border-neutral-100 dark:border-neutral-900 rounded-sm">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-450 block font-light">Order queues</span>
                  <div className="text-xl font-bold font-sans mt-2">{analytics.summary.ordersCount} invoices</div>
                </div>
                <div className="p-5 border border-neutral-100 dark:border-neutral-900 rounded-sm">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-450 block font-light">Catalog collection</span>
                  <div className="text-xl font-bold font-sans mt-2">{analytics.summary.productsCount} pieces</div>
                </div>
              </div>

              {/* Chart container */}
              <div className="border border-neutral-100 dark:border-neutral-900 p-6 rounded-sm space-y-4">
                <span className="text-xs uppercase tracking-widest font-semibold text-neutral-450 block">Monthly Revenue Velocity</span>
                <div className="pt-4">
                  {drawSVGChart()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CRUD TABLE */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold">Catalog Management</h2>
                <button 
                  onClick={openAddModal}
                  className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-luxury-accent hover:text-white transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto border border-neutral-100 dark:border-neutral-900 rounded-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900/40 text-[10px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-900">
                      <th className="p-4 font-semibold">Product info</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Price</th>
                      <th className="p-4 font-semibold">Discount</th>
                      <th className="p-4 font-semibold">Stock status</th>
                      <th className="p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900 font-light">
                    {products.map((p) => (
                      <tr key={p.id || p._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={p.images[0]} alt={p.name} className="w-9 h-12 object-cover object-top rounded-sm" />
                          <span className="font-semibold">{p.name}</span>
                        </td>
                        <td className="p-4 text-xs">{p.category}</td>
                        <td className="p-4 text-xs font-semibold font-sans">₹{p.price.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-xs font-sans">-{p.discount}%</td>
                        <td className="p-4 text-xs">
                          {p.stock > 5 ? (
                            <span className="text-emerald-600 dark:text-emerald-450 font-semibold">{p.stock} units</span>
                          ) : p.stock > 0 ? (
                            <span className="text-amber-600 dark:text-amber-450 font-semibold">Low Stock: {p.stock}</span>
                          ) : (
                            <span className="text-red-500 font-bold">Sold Out</span>
                          )}
                        </td>
                        <td className="p-4 text-xs">
                          <div className="flex gap-3 text-neutral-400">
                            <button onClick={() => openEditModal(p)} className="hover:text-luxury-accent" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id || p._id)} className="hover:text-red-500" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SELLER ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-serif font-bold">Client Order Invoices</h2>

              <div className="space-y-6">
                {orders.length > 0 ? (
                  orders.map((ord) => (
                    <div key={ord.id || ord._id} className="border border-neutral-100 dark:border-neutral-900 p-5 rounded-sm space-y-4">
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs border-b border-neutral-100 dark:border-neutral-900 pb-3">
                        <div>
                          <strong className="block text-neutral-700 dark:text-neutral-200">INVOICE: {ord.id || ord._id}</strong>
                          <span className="text-neutral-400">Date: {new Date(ord.createdAt || ord.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Payment Status Badge + Mark as Paid button */}
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ord.payment_status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}>
                              {ord.payment_status === 'Paid' ? '✓ Paid' : '⏳ Pending'}
                            </span>
                            {ord.payment_status !== 'Paid' && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsPaid(ord.id || ord._id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm"
                              >
                                Mark as Paid
                              </button>
                            )}
                          </div>

                          <span className="font-semibold">Status:</span>
                          <select
                            value={ord.order_status}
                            onChange={(e) => handleStatusChange(ord.id || ord._id, e.target.value)}
                            className="bg-neutral-50 dark:bg-neutral-900 text-xs px-2.5 py-1.5 border border-neutral-200 dark:border-neutral-850 rounded-sm font-semibold text-luxury-accent cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Items details */}
                      <div className="space-y-2 text-xs">
                        <span className="block font-semibold uppercase tracking-wider text-[9px] text-neutral-400">Order Items</span>
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1">
                            <span>{item.name} ({item.size}/{item.color}) x{item.quantity}</span>
                            <span className="font-semibold font-sans">₹{item.price.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {/* Destination */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-50 dark:border-neutral-900 text-xs font-light text-neutral-400">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider font-semibold text-neutral-400">Client details</span>
                          <strong className="text-neutral-700 dark:text-neutral-300">{ord.billing_details.name}</strong><br />
                          {ord.billing_details.email} | {ord.billing_details.phone}
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider font-semibold text-neutral-400">Destination</span>
                          {ord.billing_details.address}<br />
                          {ord.billing_details.city}, {ord.billing_details.state} - {ord.billing_details.pincode}
                        </div>
                      </div>

                    </div>
                  ))
                ) : (
                  <p className="text-neutral-400 font-light italic text-sm py-4">No order invoices currently in queue.</p>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ADD / EDIT PRODUCT MODAL OVERLAY */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white dark:bg-neutral-950 p-6 border border-neutral-100 dark:border-neutral-900 rounded-sm shadow-2xl overflow-y-auto max-h-[90vh] space-y-6 animate-slide-up text-sm">
            
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <h3 className="font-serif font-bold text-lg">{modalMode === 'add' ? 'Upload New Design' : 'Edit Design Details'}</h3>
              <button 
                onClick={() => setShowProductModal(false)}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 font-light">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Product Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={productForm.name} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                />
              </div>

              {/* Custom Dress Option */}
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="customDress"
                  checked={isCustom}
                  onChange={() => {
                    setIsCustom(!isCustom);
                    setProductForm({
                      ...productForm,
                      custom: !isCustom
                    });
                  }}
                  className="h-4 w-4 text-luxury-accent border-neutral-300 rounded"
                />
                <label htmlFor="customDress" className="text-sm text-neutral-700 dark:text-neutral-300">
                  Custom Dress (user-provided measurements)
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Design Description</label>
                <textarea 
                  name="description" 
                  rows={3}
                  value={productForm.description} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Category</label>
                    <select 
                      name="category" 
                      value={productForm.category} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                    >
                      <option value="Outerwear" className="bg-white dark:bg-neutral-900">Outerwear</option>
                      <option value="Shirts" className="bg-white dark:bg-neutral-900">Shirts</option>
                      <option value="Pants" className="bg-white dark:bg-neutral-900">Pants</option>
                      <option value="Hoodies" className="bg-white dark:bg-neutral-900">Hoodies</option>
                      <option value="Other" className="bg-white dark:bg-neutral-900">Other (Custom)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Gender Target</label>
                    <select 
                      name="gender" 
                      value={productForm.gender} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100 font-sans"
                    >
                      <option value="Men" className="bg-white dark:bg-neutral-900 font-sans">Men</option>
                      <option value="Women" className="bg-white dark:bg-neutral-900 font-sans">Women</option>
                      <option value="Unisex" className="bg-white dark:bg-neutral-900 font-sans">Unisex</option>
                    </select>
                  </div>
                </div>

                {productForm.category === 'Other' && (
                  <div className="space-y-1 mt-2">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Custom Category Name</label>
                    <input 
                      type="text" 
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      required
                      placeholder="e.g. Dress, Shoes, Accessories"
                      className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                    />
                  </div>
                )}

                {/* Additional fields for custom dress */}
                {isCustom && (
                  <div className="mt-4 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Measurements</label>
                      <textarea
                        name="measurements"
                        value={productForm.measurements}
                        onChange={handleInputChange}
                        placeholder="e.g., Chest:38in, Waist:30in, Hips:40in, Length:44in"
                        rows={3}
                        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Price (₹)</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={productForm.price} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Discount (%)</label>
                  <input 
                    type="number" 
                    name="discount" 
                    value={productForm.discount} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Stock Qty</label>
                  <input 
                    type="number" 
                    name="stock" 
                    value={productForm.stock} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Sizes (Comma separated)</label>
                  <input 
                    type="text" 
                    name="sizes" 
                    value={productForm.sizes} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Colors (Comma separated)</label>
                  <input 
                    type="text" 
                    name="colors" 
                    value={productForm.colors} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Design Image</label>
                {productForm.image ? (
                  <div className="relative w-full max-w-[200px] h-[260px] border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden">
                    <img 
                      src={productForm.image} 
                      alt="Product Preview" 
                      className="w-full h-full object-cover object-top"
                    />
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, image: '' })}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-650 text-white rounded-full transition-colors flex items-center justify-center"
                      title="Remove Image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm p-6 flex flex-col items-center justify-center hover:border-luxury-accent transition-colors bg-neutral-50/50 dark:bg-neutral-900/10">
                    <Plus className="w-8 h-8 text-neutral-400 mb-2" />
                    <label className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-luxury-accent hover:underline">
                      Select Image from System
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProductForm({ ...productForm, image: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <span className="text-[10px] text-neutral-400 mt-1 font-light">PNG, JPG, or WEBP up to 5MB</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-900 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowProductModal(false)}
                  className="w-full py-2.5 border border-neutral-250 dark:border-neutral-850 text-xs font-semibold uppercase tracking-widest rounded-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold uppercase tracking-widest rounded-sm hover:bg-luxury-accent hover:text-white transition-all shadow-md"
                >
                  {modalMode === 'add' ? 'Upload Design' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
