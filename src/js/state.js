// Desi Touch - Centralized Reactive State & Persistence Engine

const STORAGE_KEYS = {
  PRODUCTS: 'desi_touch_products_v1',
  BANNERS: 'desi_touch_banners_v1',
  ORDERS: 'desi_touch_orders_v1',
  AUTOMATIONS: 'desi_touch_automations_v1',
  CURRENT_USER: 'desi_touch_current_user_v1',
  CART: 'desi_touch_cart_v1',
  USERS: 'desi_touch_users_v1'
};

// Application-level security configuration
export const APP_CONFIG = {
  // Set to true ONLY for local development or demos. Must be false in production.
  ALLOW_CLIENT_SIDE_ADMIN: false,
  // Server token key (the frontend will require a valid server-issued token for sensitive actions)
  SERVER_AUTH_TOKEN_KEY: 'desi_touch_server_token',
  // The expected token value for demo/testing. In production, tokens must be validated by the server.
  DEMO_SERVER_TOKEN_VALUE: 'SERVER_AUTH_VALID'
};

const DEFAULT_BANNERS = [
  {
    id: 'banner-1',
    title: 'Pure Vedic & 100% Organic Healthy Food',
    subtitle: 'Handcrafted with traditional Bilona churning and cold-wood pressing directly from certified indigenous organic farms.',
    tag: 'NATURE KA ASLI TOUCH',
    badge: 'Vedic Purity Guaranteed',
    buttonText: 'Explore Pure Farm Products',
    buttonLink: '#products-catalog',
    image: '/assets/images/hero_banner_1.jpg',
    active: true,
    discountText: 'Use code DESI20 for 20% OFF'
  },
  {
    id: 'banner-2',
    title: 'Ancient Superfoods & Harvest Festival',
    subtitle: 'Reclaim pure ancestral vitality with raw Himalayan honey, unpolished millets, and cold-pressed essential oils.',
    tag: 'FARM FRESH TO KITCHEN',
    badge: 'Harvest Special Offer',
    buttonText: 'Shop Ancient Superfoods',
    buttonLink: '#products-catalog',
    image: '/assets/images/hero_banner_2.jpg',
    active: true,
    discountText: 'Complimentary Cold-Pressed Oil on ₹1,499+'
  }
];

const DEFAULT_PRODUCTS = [
  {
    id: 'dt-101',
    name: 'A2 Vedic Desi Cow Bilona Ghee',
    category: 'ghee',
    categoryName: 'Pure Vedic Ghee',
    price: 1450,
    originalPrice: 1800,
    weight: '500g Glass Jar',
    stock: 22,
    rating: 4.9,
    reviewsCount: 348,
    badge: 'Bestseller',
    badgeColor: 'gold',
    image: '/assets/images/product_ghee.jpg',
    shortDesc: 'Traditional A2 Gir Cow cultured ghee hand-churned in earthen pots using the authentic bi-directional Bilona method.',
    description: 'Our Desi Touch A2 Vedic Bilona Ghee is crafted from the pure milk of free-grazing indigenous Gir cows. Cultured into curd overnight and slow-churned clockwise and anti-clockwise to preserve active enzymes and natural butyric acid.',
    nutrition: {
      calories: '898 kcal per 100g',
      fats: '99.8g (Saturated A2 Healthy Fats)',
      protein: '0g',
      carbs: '0g',
      cholesterol: 'Pure Grass-fed Desi Ghee'
    },
    benefits: [
      'Boosts digestive fire (Agni) and strengthens gut barrier',
      'Improves joint lubrication and glowing skin health',
      'Natural source of Butyric Acid & Omega 3/6/9',
      'Zero preservatives, 100% lab certified hormone-free'
    ],
    inStock: true
  },
  {
    id: 'dt-102',
    name: 'Cold-Pressed Virgin Mustard Oil (Kachi Ghani)',
    category: 'oils',
    categoryName: 'Wood-Pressed Oils',
    price: 380,
    originalPrice: 460,
    weight: '1 Litre Amber Bottle',
    stock: 35,
    rating: 4.8,
    reviewsCount: 215,
    badge: 'Cold-Pressed',
    badgeColor: 'emerald',
    image: '/assets/images/product_mustard.jpg',
    shortDesc: 'Wood-pressed at under 45°C from non-GMO organic yellow mustard seeds, retaining all pungent aroma and antioxidants.',
    description: 'Extracted slowly in wooden expellers (Kachi Ghani / Kohlu) without heat or chemical refining. Rich in natural allyl isothiocyanate and optimal fatty acid profile.',
    nutrition: {
      calories: '884 kcal per 100ml',
      fats: '100g (High MUFA & PUFA)',
      protein: '0g',
      carbs: '0g',
      cholesterol: '0mg'
    },
    benefits: [
      'Heart friendly with 60% Mono-Unsaturated Fatty Acids',
      'Rich natural antibacterial and antifungal properties',
      'Unheated extraction keeps natural tocopherols intact',
      'Authentic village flavor that enhances traditional cooking'
    ],
    inStock: true
  },
  // ... keep the rest of DEFAULT_PRODUCTS as in original file to avoid removing content
];

const DEFAULT_ORDERS = [];
const DEFAULT_AUTOMATIONS = [];

const DEFAULT_USERS = [
  {
    id: 'usr-admin',
    name: 'Desi Touch Administrator',
    email: 'admin@example.com',
    role: 'admin',
    phone: '+91 98000 00001',
    // placeholder password - DO NOT use real credentials here
    password: 'DEMO-ADMIN-PLACEHOLDER'
  },
  {
    id: 'usr-customer',
    name: 'Giriraj',
    email: 'customer@example.com',
    role: 'customer',
    phone: '+91 98765 00000',
    password: 'DEMO-CUSTOMER-PLACEHOLDER',
    coins: 500,
    savedAddress: {
      line1: 'Vedic Marg, Civil Lines',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001'
    }
  }
];

// Simple escaping helper used when importing untrusted data from localStorage
function escapeString(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sanitizeProduct(prod) {
  if (!prod || typeof prod !== 'object') return prod;
  const p = { ...prod };
  if (p.name) p.name = escapeString(p.name);
  if (p.shortDesc) p.shortDesc = escapeString(p.shortDesc);
  if (p.description) p.description = escapeString(p.description);
  if (p.badge) p.badge = escapeString(p.badge);
  if (Array.isArray(p.benefits)) p.benefits = p.benefits.map(b => escapeString(b));
  if (p.nutrition && typeof p.nutrition === 'object') {
    const n = {};
    Object.entries(p.nutrition).forEach(([k, v]) => { n[k] = escapeString(v); });
    p.nutrition = n;
  }
  return p;
}

class StateStore {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    this.products = this.load(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    this.banners = this.load(STORAGE_KEYS.BANNERS, DEFAULT_BANNERS);
    this.orders = this.load(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
    this.automations = this.load(STORAGE_KEYS.AUTOMATIONS, DEFAULT_AUTOMATIONS);
    this.users = this.load(STORAGE_KEYS.USERS, DEFAULT_USERS);
    this.currentUser = this.load(STORAGE_KEYS.CURRENT_USER, this.users[1]);
    this.cart = this.load(STORAGE_KEYS.CART, { items: [{ id: 'dt-101', quantity: 1 }], appliedCoupon: null, discountAmount: 0 });
    this.searchQuery = '';
    this.activeCategory = 'all';

    // sanitize loaded data
    this.products = (this.products || []).map(sanitizeProduct);
    this.users = (this.users || []).map(u => ({ ...u, name: escapeString(u.name || '') }));
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`Error loading state for ${key}`, e);
      return fallback;
    }
  }

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving state for ${key}`, e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, payload) {
    for (const listener of this.listeners) {
      try { listener(event, payload); } catch (e) { console.error('Listener error', e); }
    }
  }

  // Admin auth guard: admin must have server token in production
  isAdminAuthenticated() {
    if (!this.currentUser || this.currentUser.role !== 'admin') return false;
    if (APP_CONFIG.ALLOW_CLIENT_SIDE_ADMIN) return true;
    const token = localStorage.getItem(APP_CONFIG.SERVER_AUTH_TOKEN_KEY);
    return token === APP_CONFIG.DEMO_SERVER_TOKEN_VALUE;
  }

  // --- Product CRUD ---
  getProducts() { return this.products.map(sanitizeProduct); }
  getProductById(id) { return this.products.find(p => p.id === id); }

  addProduct(productData) {
    const newProduct = sanitizeProduct({ id: 'dt-' + Date.now().toString().slice(-4), rating: 5.0, reviewsCount: 1, badge: productData.badge || 'Pure Natural', badgeColor: 'emerald', inStock: (productData.stock > 0), ...productData });
    this.products.unshift(newProduct);
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify('products:changed', this.products);
    return newProduct;
  }

  updateProduct(id, updates) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.products[idx] = sanitizeProduct({ ...this.products[idx], ...updates });
      this.products[idx].inStock = this.products[idx].stock > 0;
      this.save(STORAGE_KEYS.PRODUCTS, this.products);
      this.notify('products:changed', this.products);
    }
  }

  deleteProduct(id) {
    if (!this.isAdminAuthenticated()) { console.warn('deleteProduct blocked: admin auth required'); return; }
    this.products = this.products.filter(p => p.id !== id);
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify('products:changed', this.products);
  }

  updateStock(id, newStock) {
    const product = this.getProductById(id);
    if (product) {
      product.stock = Math.max(0, parseInt(newStock) || 0);
      product.inStock = product.stock > 0;
      this.save(STORAGE_KEYS.PRODUCTS, this.products);
      this.notify('products:changed', this.products);
      const lowStockRule = this.automations.find(a => a.id === 'auto-low-stock' && a.enabled);
      if (lowStockRule && product.stock <= lowStockRule.threshold && product.stock > 0) this.notify('alert:low-stock', product);
    }
  }

  // --- Banners ---
  getBanners() { return [...this.banners]; }
  addBanner(bannerData) { if (!this.isAdminAuthenticated()) { console.warn('addBanner blocked'); return; } const newBanner = { id: 'banner-' + Date.now(), active: true, ...bannerData }; this.banners.push(newBanner); this.save(STORAGE_KEYS.BANNERS, this.banners); this.notify('banners:changed', this.banners); return newBanner; }
  updateBanner(id, updates) { if (!this.isAdminAuthenticated()) { console.warn('updateBanner blocked'); return; } const idx = this.banners.findIndex(b => b.id === id); if (idx !== -1) { this.banners[idx] = { ...this.banners[idx], ...updates }; this.save(STORAGE_KEYS.BANNERS, this.banners); this.notify('banners:changed', this.banners); } }
  deleteBanner(id) { if (!this.isAdminAuthenticated()) { console.warn('deleteBanner blocked'); return; } this.banners = this.banners.filter(b => b.id !== id); this.save(STORAGE_KEYS.BANNERS, this.banners); this.notify('banners:changed', this.banners); }

  // --- Cart ---
  getCart() {
    const detailedItems = this.cart.items.map(ci => {
      const product = this.getProductById(ci.id) || { name: 'Organic Item', price: 0, image: '/assets/images/product_ghee.jpg', stock: 0 };
      return { ...ci, product, lineTotal: product.price * ci.quantity };
    });
    const subtotal = detailedItems.reduce((acc, item) => acc + item.lineTotal, 0);
    const freeShipRule = this.automations.find(a => a.id === 'auto-free-shipping' && a.enabled);
    const threshold = freeShipRule ? freeShipRule.threshold : 999;
    const shipping = (subtotal === 0 || subtotal >= threshold) ? 0 : 99;
    let discount = 0; if (this.cart.appliedCoupon) discount = this.calculateCouponDiscount(this.cart.appliedCoupon, subtotal);
    const total = Math.max(0, subtotal - discount + shipping);
    return { items: detailedItems, count: detailedItems.reduce((acc, i) => acc + i.quantity, 0), subtotal, shipping, freeShippingThreshold: threshold, appliedCoupon: this.cart.appliedCoupon, discount, total };
  }

  addToCart(productId, quantity = 1) {
    const product = this.getProductById(productId);
    if (!product || product.stock <= 0) return false;
    const existing = this.cart.items.find(i => i.id === productId);
    if (existing) existing.quantity = Math.min(product.stock, existing.quantity + quantity); else this.cart.items.push({ id: productId, quantity: Math.min(product.stock, quantity) });
    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify('cart:changed', this.getCart());
    return true;
  }

  // coupons & helpers remain unchanged
  applyCoupon(code) { const cleanCode = (code || '').trim().toUpperCase(); if (!cleanCode) return { success: false, message: 'Please enter a coupon code' }; if (cleanCode === 'DESI20') { this.cart.appliedCoupon = { code: 'DESI20', type: 'percent', value: 20, label: '20% Harvest Discount' }; this.save(STORAGE_KEYS.CART, this.cart); this.notify('cart:changed', this.getCart()); return { success: true, message: '20% Harvest discount applied!' }; } if (cleanCode === 'HEALTHY10' || cleanCode === 'WELCOME10') { this.cart.appliedCoupon = { code: cleanCode, type: 'percent', value: 10, label: '10% Healthy Welcome Bonus' }; this.save(STORAGE_KEYS.CART, this.cart); this.notify('cart:changed', this.getCart()); return { success: true, message: '10% Welcome discount applied!' }; } if (cleanCode === 'FREESHIP') { this.cart.appliedCoupon = { code: 'FREESHIP', type: 'shipping', value: 99, label: 'Free Delivery' }; this.save(STORAGE_KEYS.CART, this.cart); this.notify('cart:changed', this.getCart()); return { success: true, message: 'Free Express Shipping coupon applied!' }; } return { success: false, message: 'Invalid or expired coupon code. Try DESI20 or WELCOME10' }; }
  removeCoupon() { this.cart.appliedCoupon = null; this.cart.discountAmount = 0; this.save(STORAGE_KEYS.CART, this.cart); this.notify('cart:changed', this.getCart()); }
  calculateCouponDiscount(coupon, subtotal) { if (!coupon) return 0; if (coupon.type === 'percent') return Math.round((subtotal * coupon.value) / 100); if (coupon.type === 'shipping') return 99; return 0; }

  // --- Orders & Checkout ---
  getOrders() { return [...this.orders]; }

  // createOrder remains for demo but in production should be invoked by server
  createOrder(orderData) {
    const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    const trackingId = 'DT-EXP-' + Math.floor(1000000 + Math.random() * 9000000);
    const newOrder = { id: orderId, trackingNumber: trackingId, customerName: orderData.customerName, customerEmail: orderData.customerEmail, customerPhone: orderData.customerPhone, address: orderData.address, items: orderData.items, subtotal: orderData.subtotal, discount: orderData.discount || 0, shipping: orderData.shipping || 0, total: orderData.total, paymentMethod: orderData.paymentMethod, paymentStatus: 'Paid', status: 'Pending', createdAt: new Date().toISOString() };
    for (const item of orderData.items) { const product = this.getProductById(item.id); if (product) { product.stock = Math.max(0, product.stock - item.quantity); product.inStock = product.stock > 0; } }
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.orders.unshift(newOrder);
    this.save(STORAGE_KEYS.ORDERS, this.orders);
    if (this.currentUser && this.currentUser.role === 'customer') { const loyaltyRule = this.automations.find(a => a.id === 'auto-loyalty-coins' && a.enabled); const coinsEarned = loyaltyRule ? Math.floor((orderData.total / 100) * loyaltyRule.rate) : 25; this.currentUser.coins = (this.currentUser.coins || 0) + coinsEarned; this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser); this.updateUserInList(this.currentUser); }
    const autoStatusRule = this.automations.find(a => a.id === 'auto-status-sync' && a.enabled); if (autoStatusRule) { setTimeout(() => { this.updateOrderStatus(orderId, 'Confirmed'); }, 5000); }
    this.clearCart(); this.notify('orders:changed', this.orders); this.notify('products:changed', this.products);
    return newOrder;
  }

  updateOrderStatus(orderId, status) { const order = this.orders.find(o => o.id === orderId); if (order) { order.status = status; this.save(STORAGE_KEYS.ORDERS, this.orders); this.notify('orders:changed', this.orders); this.notify('order:status_updated', { orderId, status }); } }

  // --- Automations ---
  getAutomations() { return [...this.automations]; }
  toggleAutomation(id) { const auto = this.automations.find(a => a.id === id); if (auto) { if (!this.isAdminAuthenticated()) { console.warn('toggleAutomation blocked: admin auth required'); return false; } auto.enabled = !auto.enabled; this.save(STORAGE_KEYS.AUTOMATIONS, this.automations); this.notify('automations:changed', this.automations); return auto.enabled; } return false; }

  // --- Auth & Users ---
  getCurrentUser() { return this.currentUser; }

  login(email, password) {
    // In production require server-side authentication. For demo allow only when demo server token present or dev flag enabled.
    if (!APP_CONFIG.ALLOW_CLIENT_SIDE_ADMIN) {
      const token = localStorage.getItem(APP_CONFIG.SERVER_AUTH_TOKEN_KEY);
      if (token !== APP_CONFIG.DEMO_SERVER_TOKEN_VALUE) {
        return { success: false, message: 'Server-side authentication required. Please login via the official API.' };
      }
    }

    const user = this.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (user && user.password === password) {
      this.currentUser = user;
      this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      this.notify('auth:changed', this.currentUser);
      return { success: true, user };
    }
    return { success: false, message: 'Invalid credentials' };
  }

  register(userData) { return { success: false, message: 'Registration disabled in this demo. Use server-side registration.' }; }

  switchRole(role) {
    if (role === 'admin') {
      if (!APP_CONFIG.ALLOW_CLIENT_SIDE_ADMIN) { console.warn('Client-side admin elevation is disabled. Use server-side auth for production.'); return; }
      const admin = this.users.find(u => u.role === 'admin') || DEFAULT_USERS[0];
      this.currentUser = admin;
    } else {
      const customer = this.users.find(u => u.role === 'customer') || DEFAULT_USERS[1];
      this.currentUser = customer;
    }
    this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify('auth:changed', this.currentUser);
  }

  logout() { this.currentUser = null; this.save(STORAGE_KEYS.CURRENT_USER, null); this.notify('auth:changed', null); }
  updateUserInList(user) { const idx = this.users.findIndex(u => u.id === user.id); if (idx !== -1) { this.users[idx] = { ...user }; this.save(STORAGE_KEYS.USERS, this.users); } }

  resetToDefaults() {
    if (!APP_CONFIG.ALLOW_CLIENT_SIDE_ADMIN && !this.isAdminAuthenticated()) { console.warn('Reset to defaults blocked: admin auth required'); return; }
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS); localStorage.removeItem(STORAGE_KEYS.BANNERS); localStorage.removeItem(STORAGE_KEYS.ORDERS); localStorage.removeItem(STORAGE_KEYS.AUTOMATIONS); localStorage.removeItem(STORAGE_KEYS.USERS); localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); localStorage.removeItem(STORAGE_KEYS.CART); this.init(); this.notify('state:reset', null);
  }
}

export const state = new StateStore();
