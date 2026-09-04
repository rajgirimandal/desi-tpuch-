// Storefront & Product Catalog Component

import { state } from '../state.js';
import { showToast } from '../toast.js';

export class Storefront {
  constructor() {
    this.gridContainer = document.getElementById('products-grid-container');
    this.categoryTabs = document.getElementById('category-tabs-container');
    this.sortSelect = document.getElementById('sort-select');
    this.emptyState = document.getElementById('no-products-found');
    this.resetFilterBtn = document.getElementById('reset-filter-btn');

    // Quick View Modal elements
    this.quickViewModal = document.getElementById('quickview-modal');
    this.quickViewContent = document.getElementById('quickview-modal-content');
    this.closeQuickViewBtn = document.getElementById('close-quickview-btn');
    this.quickViewBackdrop = document.getElementById('quickview-backdrop');

    this.activeCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'featured';

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    state.subscribe((event) => {
      if (['products:changed', 'state:reset'].includes(event)) {
        this.render();
      }
    });
  }

  getFilteredProducts() {
    let products = state.getProducts();

    // Category filter
    if (this.activeCategory !== 'all') {
      products = products.filter(p => p.category === this.activeCategory);
    }

    // Search query filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.shortDesc && p.shortDesc.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort
    if (this.sortBy === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'rating') {
      products.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    return products;
  }

  render() {
    if (!this.gridContainer) return;

    const products = this.getFilteredProducts();

    if (products.length === 0) {
      this.gridContainer.innerHTML = '';
      if (this.emptyState) this.emptyState.classList.remove('hidden');
      return;
    }

    if (this.emptyState) this.emptyState.classList.add('hidden');

    this.gridContainer.innerHTML = products.map(product => {
      const savings = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
      const isOutOfStock = product.stock <= 0;
      const isLowStock = product.stock > 0 && product.stock <= 5;

      return `
        <article class="product-card" data-id="${product.id}">
          <div class="product-media" data-action="quickview" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
            ${product.badge ? `
              <span class="product-badge-tag badge-${product.badgeColor || 'gold'}">${product.badge}</span>
            ` : ''}
            <button class="quick-view-overlay-btn" title="Quick View" data-action="quickview" data-id="${product.id}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>

          <div class="product-info">
            <div class="product-meta-row">
              <span class="product-cat-label">${product.categoryName || 'Organic Farm'}</span>
              <div class="product-rating">
                <span>⭐</span>
                <span>${product.rating || '5.0'} (${product.reviewsCount || 42})</span>
              </div>
            </div>

            <h3 class="product-title" data-action="quickview" data-id="${product.id}">${product.name}</h3>
            <div class="product-unit">${product.weight || '500g Glass Jar'}</div>

            ${isLowStock ? `
              <div class="stock-pill-low">⚡ Only ${product.stock} left in farm!</div>
            ` : ''}

            <div class="product-pricing-row">
              <span class="price-current">₹${product.price.toLocaleString('en-IN')}</span>
              ${product.originalPrice ? `
                <span class="price-original">₹${product.originalPrice.toLocaleString('en-IN')}</span>
                <span class="price-savings-badge">${savings}% OFF</span>
              ` : ''}
            </div>

            <div class="product-actions-row">
              <button 
                class="add-to-cart-btn" 
                data-action="add-cart" 
                data-id="${product.id}"
                ${isOutOfStock ? 'disabled' : ''}
              >
                ${isOutOfStock ? 'Out of Stock' : `
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  Add to Basket
                `}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  bindEvents() {
    // Category Tabs
    if (this.categoryTabs) {
      this.categoryTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.category-tab');
        if (!tab) return;

        this.categoryTabs.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        this.activeCategory = tab.dataset.category;
        this.render();
      });
    }

    // Sort selection
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.render();
      });
    }

    // Reset filters
    if (this.resetFilterBtn) {
      this.resetFilterBtn.addEventListener('click', () => {
        this.activeCategory = 'all';
        this.searchQuery = '';
        if (this.categoryTabs) {
          this.categoryTabs.querySelectorAll('.category-tab').forEach((t, i) => {
            t.classList.toggle('active', i === 0);
          });
        }
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.value = '';
        this.render();
      });
    }

    // Product Grid Clicks (Add to cart & Quick View)
    if (this.gridContainer) {
      this.gridContainer.addEventListener('click', (e) => {
        const addBtn = e.target.closest('[data-action="add-cart"]');
        if (addBtn) {
          const productId = addBtn.dataset.id;
          const success = state.addToCart(productId, 1);
          if (success) {
            const product = state.getProductById(productId);
            showToast(`Added <strong>${product.name}</strong> to your basket!`);
          } else {
            showToast('Unable to add item. Check stock availability.', 'error');
          }
          return;
        }

        const quickViewTrigger = e.target.closest('[data-action="quickview"]');
        if (quickViewTrigger) {
          const productId = quickViewTrigger.dataset.id;
          this.openQuickView(productId);
        }
      });
    }

    // Close Quick View
    if (this.closeQuickViewBtn) {
      this.closeQuickViewBtn.addEventListener('click', () => this.closeQuickView());
    }
    if (this.quickViewBackdrop) {
      this.quickViewBackdrop.addEventListener('click', () => this.closeQuickView());
    }
  }

  setSearchQuery(query) {
    this.searchQuery = query;
    this.render();
  }

  openQuickView(productId) {
    const product = state.getProductById(productId);
    if (!product || !this.quickViewModal || !this.quickViewContent) return;

    const savings = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const isOutOfStock = product.stock <= 0;

    this.quickViewContent.innerHTML = `
      <div class="quickview-media">
        <img src="${product.image}" alt="${product.name}" class="quickview-img">
      </div>
      <div class="quickview-details">
        <div class="product-meta-row">
          <span class="product-cat-label text-gold font-bold">${product.categoryName || 'Vedic Organic'}</span>
          <div class="product-rating">⭐ ${product.rating || '5.0'} (${product.reviewsCount || 85} Reviews)</div>
        </div>

        <h2 class="quickview-title">${product.name}</h2>
        <div class="product-unit font-bold">${product.weight || 'Standard Pack'} • <span class="text-success">In Stock: ${product.stock} units</span></div>

        <div class="product-pricing-row" style="margin: 0.8rem 0;">
          <span class="price-current" style="font-size: 1.8rem;">₹${product.price.toLocaleString('en-IN')}</span>
          ${product.originalPrice ? `
            <span class="price-original" style="font-size: 1.1rem;">₹${product.originalPrice.toLocaleString('en-IN')}</span>
            <span class="price-savings-badge">${savings}% OFF</span>
          ` : ''}
        </div>

        <p class="quickview-desc">${product.description || product.shortDesc}</p>

        ${product.benefits && product.benefits.length ? `
          <div class="quickview-benefits-box">
            <h4>🌿 Verified Health & Ayurvedic Benefits:</h4>
            <ul class="benefits-list">
              ${product.benefits.map(b => `<li><span class="text-success">✓</span> ${b}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${product.nutrition ? `
          <div class="nutrition-grid">
            ${Object.entries(product.nutrition).map(([k, v]) => `
              <div class="nutrition-item">
                <span style="text-transform: capitalize;">${k}:</span>
                <strong>${v}</strong>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="quickview-actions">
          <button 
            class="btn btn-primary btn-block" 
            id="modal-add-to-cart-btn"
            data-id="${product.id}"
            ${isOutOfStock ? 'disabled' : ''}
          >
            ${isOutOfStock ? 'Out of Stock' : 'Add to Basket (Instant Dispatch)'}
          </button>
        </div>
      </div>
    `;

    // Bind modal add to cart button
    const modalAddBtn = this.quickViewContent.querySelector('#modal-add-to-cart-btn');
    if (modalAddBtn) {
      modalAddBtn.addEventListener('click', () => {
        state.addToCart(product.id, 1);
        showToast(`Added <strong>${product.name}</strong> to basket!`);
        this.closeQuickView();
      });
    }

    this.quickViewModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeQuickView() {
    if (this.quickViewModal) {
      this.quickViewModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
}
