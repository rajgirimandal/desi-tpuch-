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
    description: 'Our Desi Touch A2 Vedic Bilona Ghee is crafted from the pure milk of free-grazing indigenous Gir cows. Cultured into curd overnight and slow-churned clockwise and anti-clockwise with wooden churners, then gently melted on low flame. Rich in CLA, Butyric acid, and fat-soluble vitamins A, D, E, and K.',
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
    description: 'Extracted slowly in wooden expellers (Kachi Ghani / Kohlu) without heat or chemical refining. Rich in natural allyl isothiocyanate, MUFA, and optimum Omega 3 to Omega 6 balance for heart wellness.',
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
  {
    id: 'dt-103',
    name: 'Extra Virgin Wood-Pressed Coconut Oil',
    category: 'oils',
    categoryName: 'Wood-Pressed Oils',
    price: 490,
    originalPrice: 599,
    weight: '500ml Glass Bottle',
    stock: 18,
    rating: 4.9,
    reviewsCount: 182,
    badge: 'Farm Fresh',
    badgeColor: 'emerald',
    image: '/assets/images/product_coconut.jpg',
    shortDesc: 'Cold-pressed from sun-dried organic sulphur-free Kerala coconuts. Pure crystal white edible oil with sweet aroma.',
    description: 'Made strictly from pristine mature coconuts grown naturally in coastal regenerative organic groves. Crushed slowly in Vaagai wood presses, preserving healthy medium chain triglycerides (MCTs) and Lauric acid.',
    nutrition: {
      calories: '862 kcal per 100ml',
      fats: '100g (Contains 52% Lauric Acid / MCT)',
      protein: '0g',
      carbs: '0g',
      cholesterol: '0mg'
    },
    benefits: [
      'High in MCTs for sustained clean brain & physical energy',
      'Immunity boosting Lauric Acid similar to mother’s milk',
      'Versatile for high-smoke cooking, raw salads, and hair health',
      'Unrefined, unbleached, and un-deodorized'
    ],
    inStock: true
  },
  {
    id: 'dt-104',
    name: 'Raw Himalayan Wild Forest Honey',
    category: 'honey',
    categoryName: 'Raw Wild Honey',
    price: 650,
    originalPrice: 790,
    weight: '400g Hexagon Jar',
    stock: 15,
    rating: 4.9,
    reviewsCount: 290,
    badge: '100% Unprocessed',
    badgeColor: 'gold',
    image: '/assets/images/product_honey.jpg',
    shortDesc: 'Pure nectar sustainably gathered from deep Himalayan wildflower blossoms. Never heated, pasteurized, or ultra-filtered.',
    description: 'Harvested ethically by indigenous forest beekeepers from pristine alpine meadows. Contains live bee pollen, propolis, royal jelly enzymes, and over 22 essential amino acids. Thick, floral, and naturally crystallizing.',
    nutrition: {
      calories: '304 kcal per 100g',
      fats: '0g',
      protein: '0.3g',
      carbs: '82g (Natural raw fructose & glucose)',
      minerals: 'Iron, Zinc, Potassium, Calcium'
    },
    benefits: [
      'Natural immune booster with active enzymes and bioflavonoids',
      'Soothes throat irritation and supports respiratory wellness',
      'Raw unheated state preserves natural antibiotic propolis',
      'Clean sustainable alternative to processed cane sugar'
    ],
    inStock: true
  },
  {
    id: 'dt-105',
    name: 'Organic Lakadong High-Curcumin Turmeric',
    category: 'spices',
    categoryName: 'Organic Spices',
    price: 290,
    originalPrice: 350,
    weight: '200g Kraft Pouch',
    stock: 40,
    rating: 5.0,
    reviewsCount: 164,
    badge: '7.8% Curcumin',
    badgeColor: 'gold',
    image: '/assets/images/product_turmeric.jpg',
    shortDesc: 'Grown exclusively in the pristine Jaintia Hills of Meghalaya. World renowned for extraordinary high natural curcumin content.',
    description: 'Unlike commercial turmeric which has 1-2% curcumin, Desi Touch Lakadong Turmeric is verified to contain over 7.5% curcumin. Grown organically without synthetic fertilizers, sun-dried and stone-ground to preserve volatile essential oils.',
    nutrition: {
      curcumin: '7.8% (Third-party lab tested)',
      calories: '354 kcal per 100g',
      protein: '7.8g',
      carbs: '65g',
      fiber: '21g'
    },
    benefits: [
      'Powerful natural anti-inflammatory & antioxidant action',
      'Enhances cellular longevity and immune defense',
      'Deep golden hue with rich aromatic earthiness',
      'Lab tested for zero lead chromate or synthetic color adulteration'
    ],
    inStock: true
  },
  {
    id: 'dt-106',
    name: 'Roasted Foxnuts / Himalayan Salt Makhana',
    category: 'snacks',
    categoryName: 'Healthy Snacks',
    price: 240,
    originalPrice: 299,
    weight: '200g Fresh Pouch',
    stock: 4, // Intentionally low for stock alert demo
    rating: 4.7,
    reviewsCount: 118,
    badge: 'Low Stock Alert',
    badgeColor: 'rose',
    image: '/assets/images/product_makhana.jpg',
    shortDesc: 'Slow-roasted crispy lotus seeds gently seasoned with pure virgin olive oil, Himalayan pink rock salt, and mild herbs.',
    description: 'A guilt-free super-crunchy snack packed with natural plant protein, calcium, and magnesium. Roasted without palm oil or artificial flavors. Ideal for evening tea time, work snacking, or fasting.',
    nutrition: {
      calories: '347 kcal per 100g',
      protein: '9.7g',
      fats: '0.5g',
      carbs: '76g',
      fiber: '14.5g'
    },
    benefits: [
      'Naturally gluten-free and low glycemic index snack',
      'High in magnesium and potassium for heart relaxation',
      'Zero cholesterol, trans-fats, or MSG',
      'Provides satiety and satisfies savory cravings cleanly'
    ],
    inStock: true
  }
];

const DEFAULT_ORDERS = [
  {
    id: 'ORD-98241',
    customerName: 'Priya Sharma',
    customerEmail: 'priya@example.com',
    customerPhone: '+91 98450 12345',
    address: {
      line1: 'Flat 402, Green Meadows, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    },
    items: [
      { id: 'dt-101', name: 'A2 Vedic Desi Cow Bilona Ghee', price: 1450, quantity: 1 },
      { id: 'dt-104', name: 'Raw Himalayan Wild Forest Honey', price: 650, quantity: 1 }
    ],
    subtotal: 2100,
    discount: 210,
    shipping: 0,
    total: 1890,
    paymentMethod: 'UPI / Google Pay',
    paymentStatus: 'Paid',
    status: 'Confirmed', // Pending, Confirmed, Packed & Shipped, Delivered
    trackingNumber: 'DT-EXP-8891024',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  },
  {
    id: 'ORD-98110',
    customerName: 'Aarav Patel',
    customerEmail: 'aarav.patel@gmail.com',
    customerPhone: '+91 99201 88342',
    address: {
      line1: 'B-12, Palm Residency, Juhu',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400049'
    },
    items: [
      { id: 'dt-102', name: 'Cold-Pressed Virgin Mustard Oil (Kachi Ghani)', price: 380, quantity: 2 },
      { id: 'dt-105', name: 'Organic Lakadong High-Curcumin Turmeric', price: 290, quantity: 1 }
    ],
    subtotal: 1050,
    discount: 100,
    shipping: 0,
    total: 950,
    paymentMethod: 'Credit Card (Visa)',
    paymentStatus: 'Paid',
    status: 'Delivered',
    trackingNumber: 'DT-EXP-7729112',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
  }
];

const DEFAULT_AUTOMATIONS = [
  {
    id: 'auto-low-stock',
    name: 'Low Stock Auto-Trigger',
    description: 'Flags products with inventory below 5 units and alerts the admin team.',
    type: 'inventory',
    threshold: 5,
    enabled: true
  },
  {
    id: 'auto-free-shipping',
    name: 'Free Shipping Threshold',
    description: 'Automatically waives standard shipping charges on all orders above ₹999.',
    type: 'shipping',
    threshold: 999,
    enabled: true
  },
  {
    id: 'auto-loyalty-coins',
    name: 'Desi Coins Reward Engine',
    description: 'Customers automatically earn 5 Desi Coins for every ₹100 spent.',
    type: 'loyalty',
    rate: 5,
    enabled: true
  },
  {
    id: 'auto-welcome-discount',
    name: 'First-time Welcome Bonus',
    description: 'Validates coupon code WELCOME10 for instant 10% savings on first order.',
    type: 'marketing',
    code: 'WELCOME10',
    discountPercent: 10,
    enabled: true
  },
  {
    id: 'auto-status-sync',
    name: 'Instant Dispatch Simulation',
    description: 'Automatically advances newly placed orders from Pending to Confirmed for rapid fulfillment demo.',
    type: 'fulfillment',
    enabled: true
  }
];

const DEFAULT_USERS = [
  {
    id: 'usr-admin',
    name: 'Desi Touch Administrator',
    email: 'DESITOUCH@1234',
    role: 'admin',
    phone: '+91 98000 00001',
    password: 'D3s1T0uch!9x$K2pL5wQ8vN4mB7jC6zX1fG0hR#tY*cM!bV&nZ^sW9qP2dF5kL7x'
  },
  {
    id: 'usr-customer',
    name: 'Giriraj',
    email: 'GIRIRAJ1234@GMAIN.COM',
    role: 'customer',
    phone: '+91 98765 00000',
    password: '@0000000',
    coins: 500,
    savedAddress: {
      line1: 'Vedic Marg, Civil Lines',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001'
    }
  }
];

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
    this.currentUser = this.load(STORAGE_KEYS.CURRENT_USER, this.users[1]); // Priya by default
    this.cart = this.load(STORAGE_KEYS.CART, {
      items: [
        { id: 'dt-101', quantity: 1 }
      ],
      appliedCoupon: null,
      discountAmount: 0
    });
    this.searchQuery = '';
    this.activeCategory = 'all';
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
      listener(event, payload);
    }
  }

  // --- Product CRUD ---
  getProducts() {
    return [...this.products];
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  addProduct(productData) {
    const newProduct = {
      id: 'dt-' + Date.now().toString().slice(-4),
      rating: 5.0,
      reviewsCount: 1,
      badge: productData.badge || 'Pure Natural',
      badgeColor: 'emerald',
      inStock: (productData.stock > 0),
      ...productData
    };
    this.products.unshift(newProduct);
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.notify('products:changed', this.products);
    return newProduct;
  }

  updateProduct(id, updates) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...updates };
      this.products[idx].inStock = this.products[idx].stock > 0;
      this.save(STORAGE_KEYS.PRODUCTS, this.products);
      this.notify('products:changed', this.products);
    }
  }

  deleteProduct(id) {
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
      
      // Automation check: low stock alert
      const lowStockRule = this.automations.find(a => a.id === 'auto-low-stock' && a.enabled);
      if (lowStockRule && product.stock <= lowStockRule.threshold && product.stock > 0) {
        this.notify('alert:low-stock', product);
      }
    }
  }

  // --- Posters & Banners Management ---
  getBanners() {
    return [...this.banners];
  }

  addBanner(bannerData) {
    const newBanner = {
      id: 'banner-' + Date.now(),
      active: true,
      ...bannerData
    };
    this.banners.push(newBanner);
    this.save(STORAGE_KEYS.BANNERS, this.banners);
    this.notify('banners:changed', this.banners);
    return newBanner;
  }

  updateBanner(id, updates) {
    const idx = this.banners.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.banners[idx] = { ...this.banners[idx], ...updates };
      this.save(STORAGE_KEYS.BANNERS, this.banners);
      this.notify('banners:changed', this.banners);
    }
  }

  deleteBanner(id) {
    this.banners = this.banners.filter(b => b.id !== id);
    this.save(STORAGE_KEYS.BANNERS, this.banners);
    this.notify('banners:changed', this.banners);
  }

  // --- Cart Operations ---
  getCart() {
    const detailedItems = this.cart.items.map(ci => {
      const product = this.getProductById(ci.id) || {
        name: 'Organic Item',
        price: 0,
        image: '/assets/images/product_ghee.jpg',
        stock: 0
      };
      return {
        ...ci,
        product,
        lineTotal: product.price * ci.quantity
      };
    });

    const subtotal = detailedItems.reduce((acc, item) => acc + item.lineTotal, 0);
    
    // Check automations for free shipping threshold
    const freeShipRule = this.automations.find(a => a.id === 'auto-free-shipping' && a.enabled);
    const threshold = freeShipRule ? freeShipRule.threshold : 999;
    const shipping = (subtotal === 0 || subtotal >= threshold) ? 0 : 99;

    let discount = 0;
    if (this.cart.appliedCoupon) {
      discount = this.calculateCouponDiscount(this.cart.appliedCoupon, subtotal);
    }

    const total = Math.max(0, subtotal - discount + shipping);

    return {
      items: detailedItems,
      count: detailedItems.reduce((acc, i) => acc + i.quantity, 0),
      subtotal,
      shipping,
      freeShippingThreshold: threshold,
      appliedCoupon: this.cart.appliedCoupon,
      discount,
      total
    };
  }

  addToCart(productId, quantity = 1) {
    const product = this.getProductById(productId);
    if (!product || product.stock <= 0) return false;

    const existing = this.cart.items.find(i => i.id === productId);
    if (existing) {
      existing.quantity = Math.min(product.stock, existing.quantity + quantity);
    } else {
      this.cart.items.push({ id: productId, quantity: Math.min(product.stock, quantity) });
    }

    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify('cart:changed', this.getCart());
    return true;
  }

  updateCartQuantity(productId, quantity) {
    const product = this.getProductById(productId);
    if (!product) return;

    if (quantity <= 0) {
      this.cart.items = this.cart.items.filter(i => i.id !== productId);
    } else {
      const item = this.cart.items.find(i => i.id === productId);
      if (item) {
        item.quantity = Math.min(product.stock, quantity);
      }
    }

    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify('cart:changed', this.getCart());
  }

  clearCart() {
    this.cart = {
      items: [],
      appliedCoupon: null,
      discountAmount: 0
    };
    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify('cart:changed', this.getCart());
  }

  applyCoupon(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return { success: false, message: 'Please enter a coupon code' };

    // Standard coupons
    if (cleanCode === 'DESI20') {
      this.cart.appliedCoupon = { code: 'DESI20', type: 'percent', value: 20, label: '20% Harvest Discount' };
      this.save(STORAGE_KEYS.CART, this.cart);
      this.notify('cart:changed', this.getCart());
      return { success: true, message: '20% Harvest discount applied!' };
    }

    if (cleanCode === 'HEALTHY10' || cleanCode === 'WELCOME10') {
      this.cart.appliedCoupon = { code: cleanCode, type: 'percent', value: 10, label: '10% Healthy Welcome Bonus' };
      this.save(STORAGE_KEYS.CART, this.cart);
      this.notify('cart:changed', this.getCart());
      return { success: true, message: '10% Welcome discount applied!' };
    }

    if (cleanCode === 'FREESHIP') {
      this.cart.appliedCoupon = { code: 'FREESHIP', type: 'shipping', value: 99, label: 'Free Delivery' };
      this.save(STORAGE_KEYS.CART, this.cart);
      this.notify('cart:changed', this.getCart());
      return { success: true, message: 'Free Express Shipping coupon applied!' };
    }

    return { success: false, message: 'Invalid or expired coupon code. Try DESI20 or WELCOME10' };
  }

  removeCoupon() {
    this.cart.appliedCoupon = null;
    this.cart.discountAmount = 0;
    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify('cart:changed', this.getCart());
  }

  calculateCouponDiscount(coupon, subtotal) {
    if (!coupon) return 0;
    if (coupon.type === 'percent') {
      return Math.round((subtotal * coupon.value) / 100);
    }
    if (coupon.type === 'shipping') {
      return 99;
    }
    return 0;
  }

  // --- Orders & Checkout ---
  getOrders() {
    return [...this.orders];
  }

  createOrder(orderData) {
    const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
    const trackingId = 'DT-EXP-' + Math.floor(1000000 + Math.random() * 9000000);

    const newOrder = {
      id: orderId,
      trackingNumber: trackingId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      address: orderData.address,
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      shipping: orderData.shipping || 0,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'Paid',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    // Deduct stock
    for (const item of orderData.items) {
      const product = this.getProductById(item.id);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        product.inStock = product.stock > 0;
      }
    }
    this.save(STORAGE_KEYS.PRODUCTS, this.products);

    // Save order
    this.orders.unshift(newOrder);
    this.save(STORAGE_KEYS.ORDERS, this.orders);

    // Award loyalty coins if customer
    if (this.currentUser && this.currentUser.role === 'customer') {
      const loyaltyRule = this.automations.find(a => a.id === 'auto-loyalty-coins' && a.enabled);
      const coinsEarned = loyaltyRule ? Math.floor((orderData.total / 100) * loyaltyRule.rate) : 25;
      this.currentUser.coins = (this.currentUser.coins || 0) + coinsEarned;
      this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      this.updateUserInList(this.currentUser);
    }

    // Automation: simulated auto-confirm
    const autoStatusRule = this.automations.find(a => a.id === 'auto-status-sync' && a.enabled);
    if (autoStatusRule) {
      setTimeout(() => {
        this.updateOrderStatus(orderId, 'Confirmed');
      }, 5000);
    }

    // Clear cart
    this.clearCart();
    this.notify('orders:changed', this.orders);
    this.notify('products:changed', this.products);

    return newOrder;
  }

  updateOrderStatus(orderId, status) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      this.save(STORAGE_KEYS.ORDERS, this.orders);
      this.notify('orders:changed', this.orders);
      this.notify('order:status_updated', { orderId, status });
    }
  }

  // --- Automations Management ---
  getAutomations() {
    return [...this.automations];
  }

  toggleAutomation(id) {
    const auto = this.automations.find(a => a.id === id);
    if (auto) {
      auto.enabled = !auto.enabled;
      this.save(STORAGE_KEYS.AUTOMATIONS, this.automations);
      this.notify('automations:changed', this.automations);
      return auto.enabled;
    }
    return false;
  }

  // --- Auth & Users ---
  getCurrentUser() {
    return this.currentUser;
  }

  login(email, password) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.password === password) {
      this.currentUser = user;
      this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
      this.notify('auth:changed', this.currentUser);
      return { success: true, user };
    }
    return { success: false, message: '⚠️ Authentication Notice: Currently server is overloaded or facing problems. Connection to Firebase could not be established. Please use verified credentials.' };
  }

  register(userData) {
    return { 
      success: false, 
      message: '⚠️ Registration Temporarily Suspended: Currently server is overloaded or facing technical issues. New account registration is paused until Firebase Authentication is online.' 
    };
  }

  switchRole(role) {
    if (role === 'admin') {
      const admin = this.users.find(u => u.role === 'admin') || DEFAULT_USERS[0];
      this.currentUser = admin;
    } else {
      const customer = this.users.find(u => u.role === 'customer') || DEFAULT_USERS[1];
      this.currentUser = customer;
    }
    this.save(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.notify('auth:changed', this.currentUser);
  }

  logout() {
    this.currentUser = null;
    this.save(STORAGE_KEYS.CURRENT_USER, null);
    this.notify('auth:changed', null);
  }

  updateUserInList(user) {
    const idx = this.users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      this.users[idx] = { ...user };
      this.save(STORAGE_KEYS.USERS, this.users);
    }
  }

  // --- Reset to Factory Seed ---
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.BANNERS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.AUTOMATIONS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.CART);
    this.init();
    this.notify('state:reset', null);
  }
}

export const state = new StateStore();
