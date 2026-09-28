import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CreditCard, CheckCircle2, QrCode, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Checkout() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  
  // Billing details
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Processing states
  const [processing, setProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('fh_token');
    const storedUser = localStorage.getItem('fh_user');
    if (!token || !storedUser) {
      alert('Please login to continue checkout.');
      router.push('/auth/login?redirect=checkout');
      return;
    }

    try {
      const u = JSON.parse(storedUser);
      setBillingDetails(prev => ({
        ...prev,
        name: u.name,
        email: u.email,
        phone: u.phone || ''
      }));
    } catch(e) {}

    // Load Cart
    const loadCart = async () => {
      try {
        const data = await api.cart.get();
        setCartItems(data);
        if (data.length === 0) {
          router.push('/cart');
        }
      } catch (e) {
        // Fallback
        const local = JSON.parse(localStorage.getItem('fh_cart') || '[]');
        setCartItems(local);
      }
    };
    
    const code = localStorage.getItem('fh_coupon') || '';
    setCouponCode(code);
    loadCart();
  }, []);

  const handleInputChange = (e) => {
    setBillingDetails({ ...billingDetails, [e.target.name]: e.target.value });
  };

  const handlePaymentSubmit = async (e) => {
    if (e) e.preventDefault();
    setProcessing(true);

    try {
      // Create the order on the backend API
      const order = await api.orders.create(billingDetails, paymentMethod, couponCode);
      
      // Complete Order locally
      setCreatedOrder(order);
      setOrderSuccess(true);
      
      // Clear Cart
      localStorage.removeItem('fh_cart');
      localStorage.removeItem('fh_coupon');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      alert(err.message || 'Error processing your checkout.');
    } finally {
      setProcessing(false);
      setShowQRModal(false);
    }
  };

  const triggerUPICheckout = (e) => {
    e.preventDefault();
    // Validate billing details
    const { name, email, phone, address, city, state, pincode } = billingDetails;
    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      alert('Please fill out all billing details.');
      return;
    }
    
    if (paymentMethod === 'UPI') {
      setShowQRModal(true);
    } else {
      handlePaymentSubmit();
    }
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
  if (couponCode === 'FASHION20') discountAmount = subtotal * 0.20;
  else if (couponCode === 'WELCOME10') discountAmount = subtotal * 0.10;
  else if (couponCode === 'LUXE500') discountAmount = Math.min(500, subtotal * 0.5);

  const tax = Math.round((subtotal - discountAmount) * 0.18);
  const shipping = subtotal - discountAmount > 2000 ? 0 : 1;
  const total = Math.round(subtotal - discountAmount + tax + shipping);

  // Success view
  if (orderSuccess) {
    const isUPI = paymentMethod === 'UPI';
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-8 rounded-sm shadow-md text-center space-y-6 animate-fade-in">
          {isUPI ? (
            /* UPI: Pending verification icon */
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          ) : (
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          )}
          
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-neutral-850 dark:text-white">
              {isUPI ? 'Order Placed — Awaiting Verification' : 'Order Confirmed'}
            </h2>
            <p className="text-xs text-neutral-400 uppercase tracking-widest">Receipt ID: {createdOrder?.id || createdOrder?._id}</p>
          </div>

          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
            {isUPI
              ? 'Your order has been placed successfully. The seller will verify your UPI payment and confirm the order. You will see the status update on your profile page.'
              : `Your payment was successfully received. The digital invoice has been mailed to **${billingDetails.email}**. Our ateliers have begun tailoring your capsule wardrobe.`
            }
          </p>

          {isUPI && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-sm p-3 text-xs text-amber-700 dark:text-amber-400 font-medium">
              ⏳ Payment Status: <strong>Pending</strong> — Seller will confirm after verification
            </div>
          )}

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5 flex items-center justify-between text-sm font-semibold">
            <span>{isUPI ? 'Amount to Verify' : 'Total Debited'}</span>
            <span className="text-base text-luxury-accent">₹{total.toLocaleString('en-IN')}</span>
          </div>

          <button 
            onClick={() => router.push('/profile')}
            className="w-full py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-luxury-accent hover:text-white transition-all shadow-md"
          >
            Track Order Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Billing Checkout | FashionHub</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen">
        <h1 className="text-3xl font-serif font-bold text-neutral-800 dark:text-neutral-100 mb-10">
          {t('checkout.title', 'Checkout')}
        </h1>

        <form onSubmit={triggerUPICheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: FORM FIELDS */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Billing details form */}
            <div className="space-y-5">
              <h3 className="text-lg font-serif font-bold border-b border-neutral-100 dark:border-neutral-900 pb-3">
                1. {t('checkout.shippingDetails', 'Shipping Address')}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                    {t('checkout.fullName', 'Full Name')}
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={billingDetails.name} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm text-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={billingDetails.email} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm text-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Mobile Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={billingDetails.phone} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm text-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Street Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={billingDetails.address} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Suite, apartment, landmark details..."
                  className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm text-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={billingDetails.city} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm text-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">State</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={billingDetails.state} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm text-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Pincode</label>
                  <input 
                    type="text" 
                    name="pincode" 
                    value={billingDetails.pincode} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-transparent rounded-sm text-sm outline-none focus:border-luxury-accent text-neutral-850 dark:text-neutral-100"
                  />
                </div>
              </div>

            </div>

            {/* Payment method selector */}
            <div className="space-y-5">
              <h3 className="text-lg font-serif font-bold border-b border-neutral-100 dark:border-neutral-900 pb-3">2. Choose Payment Method</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Method 1 */}
                <label className={`flex flex-col items-center justify-center p-4 border rounded-sm cursor-pointer hover:border-luxury-accent transition-all ${
                  paymentMethod === 'UPI' ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900/40' : 'border-neutral-200 dark:border-neutral-800'
                }`}>
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value="UPI" 
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="sr-only"
                  />
                  <QrCode className="w-6 h-6 mb-2 text-luxury-accent" />
                  <span className="text-xs font-semibold uppercase tracking-wider">UPI / QR SCAN</span>
                </label>

                {/* Method 2 */}
                <label className={`flex flex-col items-center justify-center p-4 border rounded-sm cursor-pointer hover:border-luxury-accent transition-all ${
                  paymentMethod === 'Credit Card' ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900/40' : 'border-neutral-200 dark:border-neutral-800'
                }`}>
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value="Credit Card" 
                    checked={paymentMethod === 'Credit Card'}
                    onChange={() => setPaymentMethod('Credit Card')}
                    className="sr-only"
                  />
                  <CreditCard className="w-6 h-6 mb-2 text-luxury-accent" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Credit / Debit Card</span>
                </label>

                {/* Method 3 */}
                <label className={`flex flex-col items-center justify-center p-4 border rounded-sm cursor-pointer hover:border-luxury-accent transition-all ${
                  paymentMethod === 'COD' ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900/40' : 'border-neutral-200 dark:border-neutral-800'
                }`}>
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value="COD" 
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="sr-only"
                  />
                  <div className="text-xs mb-2 font-bold tracking-wider text-luxury-accent">COD</div>
                  <span className="text-xs font-semibold uppercase tracking-wider">Cash on Delivery</span>
                </label>
              </div>

              {/* Conditional payment fields */}
              {paymentMethod === 'Credit Card' && (
                <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-sm space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="XXXX XXXX XXXX XXXX" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required={paymentMethod === 'Credit Card'}
                      className="w-full px-3 py-2 border border-neutral-250 dark:border-neutral-850 bg-transparent rounded-sm text-sm outline-none focus:border-luxury-accent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required={paymentMethod === 'Credit Card'}
                        className="w-full px-3 py-2 border border-neutral-250 dark:border-neutral-850 bg-transparent rounded-sm text-sm outline-none focus:border-luxury-accent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">CVV</label>
                      <input 
                        type="password" 
                        maxLength={3} 
                        placeholder="123" 
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        required={paymentMethod === 'Credit Card'}
                        className="w-full px-3 py-2 border border-neutral-250 dark:border-neutral-850 bg-transparent rounded-sm text-sm outline-none focus:border-luxury-accent"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT: BASKET DETAILS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-neutral-100 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-900/30 p-6 rounded-sm space-y-6">
              <h3 className="font-serif font-bold text-lg border-b border-neutral-200 dark:border-neutral-800 pb-3">Wardrobe Basket</h3>
              
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item, idx) => {
                  const price = item.product.price * (1 - (item.product.discount || 0)/100);
                  return (
                    <div key={idx} className="flex gap-3 text-xs leading-relaxed">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-10 h-12 object-cover object-top rounded-sm" />
                      <div className="flex-grow">
                        <h4 className="font-semibold line-clamp-1">{item.product.name}</h4>
                        <span className="text-neutral-400">Qty: {item.quantity} | {item.size}/{item.color}</span>
                      </div>
                      <span className="font-semibold font-sans">₹{(price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-3.5 text-sm font-light">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-luxury-accent">
                    <span>Discount ({couponCode})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">Taxes (18%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex justify-between font-bold text-base">
                <span>Payment Amount</span>
                <span className="text-lg text-luxury-accent">₹{total.toLocaleString('en-IN')}</span>
              </div>

              <button 
                type="submit"
                disabled={processing || cartItems.length === 0}
                className="w-full py-4 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold uppercase tracking-widest hover:bg-luxury-accent hover:text-white rounded-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Confirm & Transact ₹{total.toLocaleString('en-IN')}
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* UPI QR SCANNER MODAL — Real Payment */}
      {showQRModal && (
        <UPIQRModal
          total={total}
          onCancel={() => setShowQRModal(false)}
          onConfirm={() => handlePaymentSubmit()}
        />
      )}
    </>
  );
}

// ─── Real UPI QR Modal Component ─────────────────────────────────────────────
function UPIQRModal({ total, onCancel, onConfirm }) {
  const UPI_ID = 'praneetkarthikeyan@okicici';
  const PAYEE_NAME = 'PKSS Clothing';
  const EXPIRY_SECONDS = 10 * 60; // 10 minutes

  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
  const [expired, setExpired] = useState(false);

  // Build UPI payment string
  const upiString = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent('PKSS Clothing Order')}`;

  // QR code image URL via public API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}&margin=8`;

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) {
      setExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerColor = secondsLeft < 60 ? 'text-red-500' : secondsLeft < 180 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6">
      <div className="max-w-sm w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-8 rounded-sm shadow-2xl text-center space-y-5 animate-slide-up">
        
        <h3 className="font-serif font-bold text-lg">Scan & Pay via UPI</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
          Open <strong>PhonePe</strong>, <strong>GPay</strong>, <strong>Paytm</strong> or any UPI app to scan the QR below.
        </p>

        {/* Timer */}
        <div className={`flex items-center justify-center gap-1.5 text-xs font-mono font-semibold ${timerColor}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {expired ? 'QR EXPIRED' : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} remaining`}
        </div>

        {/* QR Code — Real */}
        <div className="w-56 h-56 border-2 border-neutral-200 dark:border-neutral-700 mx-auto flex items-center justify-center bg-white p-2 rounded-lg shadow-inner relative">
          {expired ? (
            <div className="flex flex-col items-center gap-2 text-neutral-400">
              <AlertCircle className="w-10 h-10" />
              <span className="text-xs font-semibold">QR Expired</span>
              <button
                onClick={() => window.location.reload()}
                className="text-[10px] underline text-luxury-accent"
              >
                Refresh to generate new QR
              </button>
            </div>
          ) : (
            <img
              src={qrImageUrl}
              alt="UPI Payment QR Code"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* UPI ID display */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-light block">UPI ID</span>
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 font-mono tracking-wide">{UPI_ID}</span>
        </div>

        {/* Amount */}
        <div className="space-y-1 text-sm font-semibold">
          <span className="text-neutral-400 text-xs uppercase tracking-wider block font-light">Transaction Total</span>
          <span className="text-lg text-luxury-accent font-bold">₹{total.toLocaleString('en-IN')}</span>
        </div>

        {/* Pay via UPI App deep-link (works on mobile) */}
        {!expired && (
          <a
            href={upiString}
            className="block w-full py-2.5 bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-emerald-700 transition-all shadow-md text-center"
          >
            Pay via UPI App
          </a>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="w-full py-2.5 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
          >
            Cancel
          </button>
          {!expired && (
            <button
              onClick={onConfirm}
              className="w-full py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-luxury-accent hover:text-white transition-all shadow-md"
            >
              I Have Paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
