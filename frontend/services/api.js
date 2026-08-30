const API_BASE = 'http://localhost:5000/api';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fh_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'An unexpected error occurred.');
  }
  return data;
};

export const api = {
  // Authentication
  auth: {
    login: async (email, password, otp) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password, otp }),
      });
      return handleResponse(res);
    },
    register: async (name, email, phone, password, role = 'buyer', otp) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, phone, password, role, otp }),
      });
      return handleResponse(res);
    },
    getProfile: async () => {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    forgotPassword: async (email) => {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      return handleResponse(res);
    },
    verifyOtp: async (email, otp) => {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, otp }),
      });
      return handleResponse(res);
    },
    googleLogin: async (token) => {
      const res = await fetch(`${API_BASE}/auth/google-login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ token }),
      });
      return handleResponse(res);
    },
  },

  // Products
  products: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
      const res = await fetch(`${API_BASE}/products?${params.toString()}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Cart
  cart: {
    get: async () => {
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    add: async (product_id, quantity = 1, color = '', size = '') => {
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ product_id, quantity, color, size }),
      });
      return handleResponse(res);
    },
    update: async (id, quantity) => {
      const res = await fetch(`${API_BASE}/cart/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity }),
      });
      return handleResponse(res);
    },
    remove: async (id) => {
      const res = await fetch(`${API_BASE}/cart/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Orders & Checkout
  orders: {
    create: async (billing_details, payment_method, coupon_code = '') => {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ billing_details, payment_method, coupon_code }),
      });
      return handleResponse(res);
    },
    getMyOrders: async () => {
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getSellerOrders: async () => {
      const res = await fetch(`${API_BASE}/orders/seller-orders`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateStatus: async (id, status) => {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ order_status: status }),
      });
      return handleResponse(res);
    },
    markAsPaid: async (id) => {
      const res = await fetch(`${API_BASE}/orders/${id}/payment`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getAnalytics: async () => {
      const res = await fetch(`${API_BASE}/orders/analytics`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Reviews
  reviews: {
    get: async (productId) => {
      const res = await fetch(`${API_BASE}/reviews/${productId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (productId, rating, comment) => {
      const res = await fetch(`${API_BASE}/reviews/${productId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ rating, comment }),
      });
      return handleResponse(res);
    },
  },

  // AI Chatbot
  ai: {
    chat: async (message) => {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message }),
      });
      return handleResponse(res);
    },
  },
};
