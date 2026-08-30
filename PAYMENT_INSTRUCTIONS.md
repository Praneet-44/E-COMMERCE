# 💳 Payment System — Instructions & Developer Guide
# FashionHub E-Commerce Platform

---

## 📋 Overview

The payment system in FashionHub supports three methods:
- **UPI / QR Scan** — Customer scans a QR code and confirms payment manually
- **Credit / Debit Card** — Customer enters card details (demo mode only)
- **Cash on Delivery (COD)** — Payment collected on delivery

---

## 📁 Key Files

| Purpose                          | File Path                                              |
|----------------------------------|-------------------------------------------------------|
| Checkout page (frontend)         | frontend/pages/checkout.js                            |
| UPI QR modal (lines 442–480)     | frontend/pages/checkout.js                            |
| Order creation (backend)         | backend/controllers/orderController.js                |
| Order status update (backend)    | backend/controllers/orderController.js                |
| Seller order view (frontend)     | frontend/pages/seller.js → "Order Invoices" tab       |
| Database (JSON fallback)         | database/db.json → "orders" array                     |

---

## 🔵 How UPI Payment Works (Current Flow)

1. Customer fills billing details and selects **UPI / QR SCAN**
2. Clicks **Confirm & Transact** → UPI QR modal appears
3. Customer scans QR code using PhonePe / GPay / Paytm
4. Customer clicks **"I Have Paid"** button in the modal
5. Order is created in database with `payment_status: "Paid"`
6. Customer sees **Order Confirmed** success screen

---

## 🔴 How to Change UPI ID to Your Own

### Step 1 — Open the file:
```
frontend/pages/checkout.js
```

### Step 2 — Go to lines 452–458 (UPI QR container)

Find this block:
```jsx
<div className="w-full h-full bg-neutral-50 ...">
  <QrCode className="w-24 h-24 text-neutral-800" />
  <span className="text-[9px] ... text-neutral-800 mt-2">RAZORPAY SECURE</span>
</div>
```

### Step 3 — Replace with your real UPI QR image:
```jsx
<img
  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=praneetkarthikeyan@okicici%26pn=YourName%26am=${total}%26cu=INR`}
  alt="UPI QR Code"
  className="w-full h-full"
/>
<p className="text-[9px] text-neutral-800 mt-1 font-bold">UPI: praneetkarthikeyan@okicici</p>
```

### Step 4 — Replace the placeholders:
| Placeholder       | Replace With                        | Example                    |
|-------------------|-------------------------------------|----------------------------|
| `YOUR_UPI_ID@upi` | Your actual UPI ID                  | `9876543210@paytm`         |
| `YourName`        | Your name or business name          | `PKSSClothing`             |

---

## 🟡 Payment Status Values

Each order in the database has a `payment_status` field:

| Value       | Meaning                                         | When Set                          |
|-------------|------------------------------------------------|-----------------------------------|
| `"Paid"`    | Payment confirmed by customer                  | UPI "I Have Paid" / Card submit   |
| `"Pending"` | Payment not yet received                       | COD orders                        |

---

## 🟠 Order Status Values

Each order also has an `order_status` field, managed by the seller:

| Value         | Meaning                    |
|---------------|----------------------------|
| `"Confirmed"` | Order accepted by seller   |
| `"Shipped"`   | Order dispatched           |
| `"Delivered"` | Order received by customer |
| `"Cancelled"` | Order cancelled            |

---

## ✅ How Seller Verifies Payment

1. Go to **Seller Dashboard** → `localhost:3000/seller`
2. Click **"Order Invoices"** tab (left sidebar)
3. Each order card shows:
   - Order ID, Date, Items
   - Client name, email, phone, address
   - **Payment Method** (UPI / Card / COD)
   - **Payment Status** (`Paid` or `Pending`)
   - **Order Status** dropdown to update shipping stage

> ⚠️ Currently, the seller cannot manually mark a payment as "Paid" from the dashboard.
> To enable this, a "Mark as Paid" button needs to be added to the order controller.

---

## 🔵 How Credit Card Payment Works (Demo Mode)

- Card number, expiry, and CVV fields are shown
- No real payment gateway is connected (Razorpay/Stripe not integrated)
- Submitting the form creates the order with `payment_status: "Paid"` (simulated)
- To connect a real gateway, integrate Razorpay or Stripe SDK in checkout.js

---

## 🔵 How COD Payment Works

- No additional input required
- Order is created with `payment_status: "Pending"`
- Seller manually updates order status after delivery

---

## 📦 Database Location

All orders are stored in:
```
database/db.json  →  "orders" array
```

Each order entry looks like:
```json
{
  "id": "ord-XXXX",
  "user_id": "u-buyer-1",
  "payment_method": "UPI",
  "payment_status": "Paid",
  "order_status": "Confirmed",
  "billing_details": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "address": "...",
    "city": "...",
    "state": "...",
    "pincode": "..."
  },
  "items": [...],
  "total_amount": 3500
}
```

---

## 🚀 To Integrate Real Payment Gateway (Future)

1. Sign up at [Razorpay](https://razorpay.com) or [Stripe](https://stripe.com)
2. Get your **API Key** and **Secret Key**
3. Install SDK:
   ```
   npm install razorpay   (backend)
   ```
4. Replace the "I Have Paid" button flow in `checkout.js` with a Razorpay payment popup
5. Verify payment signature on the backend before creating the order

---

*Last updated: 2026-06-16 | FashionHub PKSS Clothing*
