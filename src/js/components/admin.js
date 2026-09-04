// Admin Backoffice Management Portal

import { state } from '../state.js';
import { showToast } from '../toast.js';
import Chart from 'chart.js/auto';

export class AdminPortal {
  constructor(onExitToStore) {
    this.onExitToStore = onExitToStore;

    this.adminView = document.getElementById('view-admin');
    this.storeView = document.getElementById('view-storefront');

    // Tabs
    this.tabButtons = document.querySelectorAll('.admin-tab-btn');
    this.panels = {
      analytics: document.getElementById('admin-panel-analytics'),
      products: document.getElementById('admin-panel-products'),
      stock: document.getElementById('admin-panel-stock'),
      posters: document.getElementById('admin-panel-posters'),
      orders: document.getElementById('admin-panel-orders'),
      automations: document.getElementById('admin-panel-automations')
    };

    // Metrics
    this.revenueMetric = document.getElementById('metric-total-revenue');
    this.ordersMetric = document.getElementById('metric-total-orders');
    this.aovMetric = document.getElementById('metric-aov');
    this.lowStockMetric = document.getElementById('metric-low-stock-count');
    this.ordersCountBadge = document.getElementById('admin-orders-count-badge');
    this.stockAlertPill = document.getElementById('admin-stock-alert-pill');
    this.bestsellersList = document.getElementById('admin-bestsellers-list');

    // Tables
    this.productsTbody = document.getElementById('admin-products-tbody');
    this.stockTbody = document.getElementById('admin-stock-tbody');
    this.ordersTbody = document.getElementById('admin-orders-tbody');
    this.postersGrid = document.getElementById('admin-posters-grid');
    this.automationsList = document.getElementById('admin-automations-list');

    // Modals
    this.productModal = document.getElementById('admin-product-modal');
    this.productModalTitle = document.getElementById('admin-product-modal-title');
    this.productForm = document.getElementById('admin-product-form');
    this.closeProductModalBtn = document.getElementById('close-admin-product-btn');
    this.cancelProductModalBtn = document.getElementById('cancel-admin-prod-btn');
    this.productImagePreset = document.getElementById('admin-prod-image-preset');
    this.productImageCustom = document.getElementById('admin-prod-image-custom');

    this.posterModal = document.getElementById('admin-poster-modal');
    this.posterForm = document.getElementById('admin-poster-form');
    this.closePosterModalBtn = document.getElementById('close-admin-poster-btn');
    this.cancelPosterModalBtn = document.getElementById('cancel-admin-poster-btn');

    // Top Actions
    this.resetDbBtn = document.getElementById('admin-reset-db-btn');
    this.exitBtn = document.getElementById('admin-exit-btn');
    this.addProductBtn = document.getElementById('admin-add-product-btn');
    this.addPosterBtn = document.getElementById('admin-add-poster-btn');
    this.batchRestockBtn = document.getElementById('admin-batch-restock-btn');

    // Product search inside admin
    this.productSearchInput = document.getElementById('admin-product-search');

    this.chartInstance = null;
    this.activeTab = 'analytics';

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderAll();

    state.subscribe((event) => {
      if (['products:changed', 'banners:changed', 'orders:changed', 'automations:changed', 'state:reset'].includes(event)) {
        this.renderAll();
      }
      if (event === 'alert:low-stock') {
        showToast('⚠️ Low Stock Alert triggered by Automation engine!', 'warning');
      }
    });
  }

  bindEvents() {
    // Tab switching
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Exit Admin
    if (this.exitBtn) {
      this.exitBtn.addEventListener('click', () => {
        if (this.onExitToStore) this.onExitToStore();
      });
    }

    // Reset Database
    if (this.resetDbBtn) {
      this.resetDbBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all products, orders, banners, and automations to factory defaults?')) {
          state.resetToDefaults();
          showToast('Database reset to factory seeds successfully 🌱', 'info');
        }
      });
    }

    // Add Product Modal open
    if (this.addProductBtn) {
      this.addProductBtn.addEventListener('click', () => this.openProductModal());
    }
    if (this.closeProductModalBtn) {
      this.closeProductModalBtn.addEventListener('click', () => this.closeProductModal());
    }
    if (this.cancelProductModalBtn) {
      this.cancelProductModalBtn.addEventListener('click', () => this.closeProductModal());
    }

    // Image preset toggle
    if (this.productImagePreset && this.productImageCustom) {
      this.productImagePreset.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          this.productImageCustom.classList.remove('hidden');
        } else {
          this.productImageCustom.classList.add('hidden');
        }
      });
    }

    // Save Product Form
    if (this.productForm) {
      this.productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProduct();
      });
    }

    // Add Poster Modal open
    if (this.addPosterBtn) {
      this.addPosterBtn.addEventListener('click', () => this.openPosterModal());
    }
    if (this.closePosterModalBtn) {
      this.closePosterModalBtn.addEventListener('click', () => this.closePosterModal());
    }
    if (this.cancelPosterModalBtn) {
      this.cancelPosterModalBtn.addEventListener('click', () => this.closePosterModal());
    }

    // Save Poster Form
    if (this.posterForm) {
      this.posterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.savePoster();
      });
    }

    // Batch Restock
    if (this.batchRestockBtn) {
      this.batchRestockBtn.addEventListener('click', () => {
        const products = state.getProducts();
        products.forEach(p => {
          state.updateStock(p.id, p.stock + 10);
        });
        showToast('Restocked +10 units across all healthy products! 📦', 'success');
      });
    }

    // Product Search Filter in Admin table
    if (this.productSearchInput) {
      this.productSearchInput.addEventListener('input', () => {
        this.renderProductsTable();
      });
    }

    // Products table actions (Edit / Delete)
    if (this.productsTbody) {
      this.productsTbody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('[data-action="edit-product"]');
        if (editBtn) {
          const id = editBtn.dataset.id;
          this.openProductModal(id);
          return;
        }

        const delBtn = e.target.closest('[data-action="delete-product"]');
        if (delBtn) {
          const id = delBtn.dataset.id;
          const prod = state.getProductById(id);
          if (confirm(`Remove "${prod.name}" from live catalog?`)) {
            state.deleteProduct(id);
            showToast(`Product "${prod.name}" removed`, 'info');
          }
        }
      });
    }

    // Stock table actions (Inline adjuster)
    if (this.stockTbody) {
      this.stockTbody.addEventListener('click', (e) => {
        const adjustBtn = e.target.closest('[data-action="adjust-stock"]');
        if (adjustBtn) {
          const id = adjustBtn.dataset.id;
          const delta = parseInt(adjustBtn.dataset.delta);
          const prod = state.getProductById(id);
          if (prod) {
            state.updateStock(id, prod.stock + delta);
            showToast(`Updated stock for ${prod.name} to ${prod.stock} units`);
          }
        }
      });

      this.stockTbody.addEventListener('change', (e) => {
        const input = e.target.closest('.stock-input-field');
        if (input) {
          const id = input.dataset.id;
          const val = parseInt(input.value) || 0;
          state.updateStock(id, val);
          showToast(`Stock saved: ${val} units`);
        }
      });
    }

    // Orders table actions (Status change)
    if (this.ordersTbody) {
      this.ordersTbody.addEventListener('change', (e) => {
        const select = e.target.closest('.order-status-select');
        if (select) {
          const orderId = select.dataset.id;
          const newStatus = select.value;
          state.updateOrderStatus(orderId, newStatus);
          showToast(`Order ${orderId} marked as "${newStatus}"!`, 'success');
        }
      });
    }

    // Posters actions (Toggle / Delete)
    if (this.postersGrid) {
      this.postersGrid.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('[data-action="toggle-poster"]');
        if (toggleBtn) {
          const id = toggleBtn.dataset.id;
          const banners = state.getBanners();
          const b = banners.find(item => item.id === id);
          if (b) {
            state.updateBanner(id, { active: !b.active });
            showToast(`Poster "${b.title}" ${!b.active ? 'activated on storefront' : 'deactivated'}`);
          }
          return;
        }

        const delBtn = e.target.closest('[data-action="delete-poster"]');
        if (delBtn) {
          const id = delBtn.dataset.id;
          if (confirm('Delete this promotional poster?')) {
            state.deleteBanner(id);
            showToast('Poster removed from carousel', 'info');
          }
        }
      });
    }

    // Automations toggle
    if (this.automationsList) {
      this.automationsList.addEventListener('change', (e) => {
        const toggle = e.target.closest('.auto-toggle-checkbox');
        if (toggle) {
          const id = toggle.dataset.id;
          const isEnabled = state.toggleAutomation(id);
          showToast(`Automation ${isEnabled ? 'ENABLED' : 'DISABLED'}`, isEnabled ? 'success' : 'info');
        }
      });
    }
  }

  switchTab(tabName) {
    this.activeTab = tabName;

    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    Object.entries(this.panels).forEach(([key, panel]) => {
      if (panel) {
        panel.classList.toggle('hidden', key !== tabName);
        panel.classList.toggle('active', key === tabName);
      }
    });

    if (tabName === 'analytics') {
      this.renderAnalyticsChart();
    }
  }

  renderAll() {
    this.renderMetrics();
    this.renderProductsTable();
    this.renderStockTable();
    this.renderPostersGrid();
    this.renderOrdersTable();
    this.renderAutomationsList();
    if (this.activeTab === 'analytics') {
      this.renderAnalyticsChart();
    }
  }

  renderMetrics() {
    const orders = state.getOrders();
    const products = state.getProducts();

    const totalRev = orders.reduce((sum, o) => sum + o.total, 0);
    const aov = orders.length ? Math.round(totalRev / orders.length) : 0;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;

    if (this.revenueMetric) this.revenueMetric.textContent = `₹${totalRev.toLocaleString('en-IN')}`;
    if (this.ordersMetric) this.ordersMetric.textContent = orders.length;
    if (this.aovMetric) this.aovMetric.textContent = `₹${aov.toLocaleString('en-IN')}`;
    if (this.lowStockMetric) this.lowStockMetric.textContent = lowStockCount;

    if (this.ordersCountBadge) this.ordersCountBadge.textContent = orders.length;

    if (this.stockAlertPill) {
      if (lowStockCount > 0) {
        this.stockAlertPill.textContent = `${lowStockCount} Low`;
        this.stockAlertPill.classList.remove('hidden');
      } else {
        this.stockAlertPill.classList.add('hidden');
      }
    }

    // Bestsellers list
    if (this.bestsellersList) {
      const topItems = products.slice(0, 4);
      this.bestsellersList.innerHTML = topItems.map(item => `
        <div class="bestseller-row">
          <img src="${item.image}" alt="${item.name}" class="bestseller-thumb">
          <div style="flex-grow: 1;">
            <div class="bestseller-title">${item.name}</div>
            <div class="bestseller-sales">₹${item.price} • ${item.stock} in stock</div>
          </div>
          <span class="badge badge-success">⭐ ${item.rating || 5.0}</span>
        </div>
      `).join('');
    }
  }

  renderAnalyticsChart() {
    const canvas = document.getElementById('admin-revenue-chart');
    if (!canvas) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    const orders = state.getOrders();
    const totalRev = orders.reduce((sum, o) => sum + o.total, 0);

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
        datasets: [{
          label: 'Organic Revenue (₹)',
          data: [12400, 18900, 15300, 24800, 29200, 34500, Math.max(38000, totalRev + 12000)],
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.12)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#0d5c3a',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(20, 83, 54, 0.06)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  renderProductsTable() {
    if (!this.productsTbody) return;

    let products = state.getProducts();
    const q = this.productSearchInput?.value?.toLowerCase().trim();
    if (q) {
      products = products.filter(p => p.name.toLowerCase().includes(q) || (p.categoryName && p.categoryName.toLowerCase().includes(q)));
    }

    this.productsTbody.innerHTML = products.map(prod => `
      <tr>
        <td>
          <div class="table-prod-info">
            <img src="${prod.image}" alt="${prod.name}" class="table-prod-img">
            <div>
              <strong>${prod.name}</strong>
              <div class="text-sm text-muted">${prod.weight || 'Standard Pack'}</div>
            </div>
          </div>
        </td>
        <td><span class="badge">${prod.categoryName || prod.category}</span></td>
        <td><strong>₹${prod.price.toLocaleString('en-IN')}</strong></td>
        <td class="text-muted">₹${(prod.originalPrice || prod.price).toLocaleString('en-IN')}</td>
        <td><strong>${prod.stock}</strong> units</td>
        <td>
          ${prod.stock <= 0 ? '<span class="status-pill status-cancelled">Out of Stock</span>' :
            prod.stock <= 5 ? '<span class="status-pill status-pending">Low Stock</span>' :
            '<span class="status-pill status-confirmed">In Stock</span>'}
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm" data-action="edit-product" data-id="${prod.id}" title="Edit Product">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button class="btn btn-outline-danger btn-sm" data-action="delete-product" data-id="${prod.id}" title="Delete Product">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  renderStockTable() {
    if (!this.stockTbody) return;

    const products = state.getProducts();

    this.stockTbody.innerHTML = products.map(prod => {
      let statusBadge = '<span class="status-pill status-confirmed">Healthy Stock</span>';
      if (prod.stock <= 0) {
        statusBadge = '<span class="status-pill status-cancelled">Out of Stock</span>';
      } else if (prod.stock <= 5) {
        statusBadge = '<span class="status-pill status-pending">⚡ Critical Low Stock (&lt;5)</span>';
      }

      return `
        <tr>
          <td>
            <div class="table-prod-info">
              <img src="${prod.image}" alt="${prod.name}" class="table-prod-img">
              <div>
                <strong>${prod.name}</strong>
                <div class="text-sm text-muted">SKU: ${prod.id} • ${prod.weight}</div>
              </div>
            </div>
          </td>
          <td>
            <strong style="font-size: 1.1rem; color: var(--emerald-950);">${prod.stock}</strong> units
          </td>
          <td>${statusBadge}</td>
          <td>
            <div class="stock-adjuster">
              <button class="stock-pill-btn" data-action="adjust-stock" data-id="${prod.id}" data-delta="-5">−5</button>
              <button class="stock-pill-btn" data-action="adjust-stock" data-id="${prod.id}" data-delta="-1">−1</button>
              <input type="number" class="stock-input-field" data-id="${prod.id}" value="${prod.stock}" min="0">
              <button class="stock-pill-btn" data-action="adjust-stock" data-id="${prod.id}" data-delta="1">+1</button>
              <button class="stock-pill-btn" data-action="adjust-stock" data-id="${prod.id}" data-delta="5">+5</button>
            </div>
          </td>
          <td>
            <button class="btn btn-secondary btn-sm" data-action="adjust-stock" data-id="${prod.id}" data-delta="15">
              +15 Batch Restock
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderPostersGrid() {
    if (!this.postersGrid) return;

    const banners = state.getBanners();

    this.postersGrid.innerHTML = banners.map(b => `
      <div class="poster-admin-card" data-id="${b.id}">
        <div class="poster-admin-preview">
          <img src="${b.image}" alt="${b.title}" class="poster-admin-img">
          <span class="poster-status-badge ${b.active ? 'active' : ''}">
            ${b.active ? '● LIVE ON STOREFRONT' : '○ INACTIVE / DRAFT'}
          </span>
        </div>
        <div class="poster-admin-info">
          <div class="section-tag">${b.tag || 'PROMOTION'}</div>
          <h4 class="poster-admin-title">${b.title}</h4>
          <p class="poster-admin-sub">${b.subtitle}</p>
          ${b.discountText ? `<div style="font-size:0.75rem; color:var(--gold-700); margin-bottom: 0.8rem;">🏷️ ${b.discountText}</div>` : ''}

          <div class="poster-admin-actions">
            <button class="btn btn-secondary btn-sm" data-action="toggle-poster" data-id="${b.id}">
              ${b.active ? 'Deactivate' : 'Publish Live'}
            </button>
            <button class="btn btn-outline-danger btn-sm" data-action="delete-poster" data-id="${b.id}">
              Delete Poster
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderOrdersTable() {
    if (!this.ordersTbody) return;

    const orders = state.getOrders();

    this.ordersTbody.innerHTML = orders.map(order => `
      <tr>
        <td>
          <strong style="color: var(--emerald-950);">${order.id}</strong>
          <div class="text-sm text-muted">Trk: ${order.trackingNumber}</div>
        </td>
        <td>
          <strong>${order.customerName}</strong>
          <div class="text-sm text-muted">${order.customerPhone}</div>
          <div class="text-sm text-muted">${order.customerEmail}</div>
        </td>
        <td>
          <div class="text-sm">${new Date(order.createdAt).toLocaleDateString()}</div>
          <div class="text-sm text-muted">${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </td>
        <td>
          <div style="font-size: 0.85rem;">
            ${order.items.map(i => `<div>${i.quantity}x ${i.name}</div>`).join('')}
          </div>
        </td>
        <td>
          <strong style="font-size: 1rem; color: var(--emerald-900);">₹${order.total.toLocaleString('en-IN')}</strong>
        </td>
        <td>
          <span class="text-sm">${order.paymentMethod}</span>
        </td>
        <td>
          <span class="status-pill status-${order.status.toLowerCase().replace(/[^a-z]/g, '')}">
            ${order.status}
          </span>
        </td>
        <td>
          <select class="custom-select order-status-select" data-id="${order.id}" style="padding: 0.35rem 0.6rem; font-size: 0.82rem;">
            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Packed & Shipped" ${order.status === 'Packed & Shipped' ? 'selected' : ''}>Packed & Shipped</option>
            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      </tr>
    `).join('');
  }

  renderAutomationsList() {
    if (!this.automationsList) return;

    const autos = state.getAutomations();

    this.automationsList.innerHTML = autos.map(auto => `
      <div class="automation-rule-card">
        <div class="auto-rule-content">
          <div class="auto-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <h4 class="auto-rule-title">${auto.name}</h4>
            <p class="auto-rule-desc">${auto.description}</p>
            <div style="margin-top: 0.4rem;">
              <span class="badge badge-success">Active Rule</span>
              ${auto.threshold ? `<span class="badge" style="background:#e0f2fe; color:#0369a1;">Threshold: ${auto.threshold}</span>` : ''}
              ${auto.code ? `<span class="badge" style="background:#fef3c7; color:#b45309;">Trigger Code: ${auto.code}</span>` : ''}
            </div>
          </div>
        </div>

        <label class="toggle-switch">
          <input type="checkbox" class="auto-toggle-checkbox" data-id="${auto.id}" ${auto.enabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
    `).join('');
  }

  // --- Product Modal ---
  openProductModal(productId = null) {
    if (!this.productModal) return;

    const idField = document.getElementById('admin-prod-id');
    const nameField = document.getElementById('admin-prod-name');
    const catField = document.getElementById('admin-prod-category');
    const weightField = document.getElementById('admin-prod-weight');
    const priceField = document.getElementById('admin-prod-price');
    const origPriceField = document.getElementById('admin-prod-orig-price');
    const stockField = document.getElementById('admin-prod-stock');
    const descField = document.getElementById('admin-prod-desc');

    if (productId) {
      const prod = state.getProductById(productId);
      if (!prod) return;

      this.productModalTitle.textContent = `Edit Product: ${prod.name}`;
      idField.value = prod.id;
      nameField.value = prod.name;
      catField.value = prod.category;
      weightField.value = prod.weight || '500g Glass Jar';
      priceField.value = prod.price;
      origPriceField.value = prod.originalPrice || '';
      stockField.value = prod.stock;
      descField.value = prod.description || '';
    } else {
      this.productModalTitle.textContent = 'Add New Healthy Harvest Product';
      this.productForm.reset();
      idField.value = '';
      stockField.value = '25';
    }

    this.productModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeProductModal() {
    if (this.productModal) {
      this.productModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  saveProduct() {
    const id = document.getElementById('admin-prod-id')?.value;
    const name = document.getElementById('admin-prod-name')?.value;
    const category = document.getElementById('admin-prod-category')?.value;
    const weight = document.getElementById('admin-prod-weight')?.value;
    const price = parseInt(document.getElementById('admin-prod-price')?.value) || 0;
    const originalPrice = parseInt(document.getElementById('admin-prod-orig-price')?.value) || (price + 200);
    const stock = parseInt(document.getElementById('admin-prod-stock')?.value) || 0;
    const description = document.getElementById('admin-prod-desc')?.value;

    let image = this.productImagePreset?.value;
    if (image === 'custom') {
      image = this.productImageCustom?.value || '/assets/images/product_ghee.jpg';
    }

    const categoryNames = {
      ghee: 'Pure Vedic Ghee',
      oils: 'Wood-Pressed Oils',
      honey: 'Raw Wild Honey',
      spices: 'Organic Spices',
      snacks: 'Healthy Snacks',
      superfoods: 'Ancient Superfoods'
    };

    if (id) {
      state.updateProduct(id, {
        name,
        category,
        categoryName: categoryNames[category] || 'Organic Farm',
        weight,
        price,
        originalPrice,
        stock,
        image,
        description,
        shortDesc: description.slice(0, 100) + '...'
      });
      showToast(`Updated product "${name}"!`);
    } else {
      state.addProduct({
        name,
        category,
        categoryName: categoryNames[category] || 'Organic Farm',
        weight,
        price,
        originalPrice,
        stock,
        image,
        description,
        shortDesc: description.slice(0, 100) + '...'
      });
      showToast(`New product "${name}" added to live storefront! 🌱`, 'success');
    }

    this.closeProductModal();
  }

  // --- Poster Modal ---
  openPosterModal() {
    if (!this.posterModal) return;
    this.posterForm.reset();
    this.posterModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closePosterModal() {
    if (this.posterModal) {
      this.posterModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  savePoster() {
    const title = document.getElementById('admin-poster-title')?.value;
    const subtitle = document.getElementById('admin-poster-subtitle')?.value;
    const tag = document.getElementById('admin-poster-tag')?.value || 'NATURE KA ASLI TOUCH';
    const discountText = document.getElementById('admin-poster-discount')?.value;
    const buttonText = document.getElementById('admin-poster-btn-text')?.value || 'Explore Pure Farm Products';
    const image = document.getElementById('admin-poster-image-select')?.value || '/assets/images/hero_banner_1.jpg';

    state.addBanner({
      title,
      subtitle,
      tag,
      discountText,
      buttonText,
      buttonLink: '#products-catalog',
      image,
      active: true
    });

    showToast(`New promotional poster "${title}" published live to storefront! 🎨`, 'success');
    this.closePosterModal();
  }
}
