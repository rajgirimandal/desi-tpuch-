// Desi Touch — Main Application Bootstrap

import { createIcons, icons } from 'lucide';
import { state } from './state.js';
import { showToast } from './toast.js';
import { Navbar } from './components/navbar.js';
import { HeroCarousel } from './components/hero.js';
import { Storefront } from './components/storefront.js';
import { CartDrawer } from './components/cart.js';
import { CheckoutModal } from './components/checkout.js';
import { AuthManager } from './components/auth.js';
import { AdminPortal } from './components/admin.js';

class App {
  constructor() {
    this.storeView = document.getElementById('view-storefront');
    this.adminView = document.getElementById('view-admin');
    this.customerSwitchBtn = document.getElementById('quick-switch-customer');
    this.adminSwitchBtn = document.getElementById('quick-switch-admin');

    this.init();
  }

  init() {
    // 1. Initialize Components
    this.heroCarousel = new HeroCarousel();
    this.storefront = new Storefront();
    
    this.checkoutModal = new CheckoutModal(() => {
      this.authManager.openAccountModal();
    });

    this.cartDrawer = new CartDrawer(() => {
      this.checkoutModal.open();
    });

    this.authManager = new AuthManager(() => {
      this.showAdminView();
    });

    this.adminPortal = new AdminPortal(() => {
      this.showStoreView();
    });

    this.navbar = new Navbar(
      (query) => this.storefront.setSearchQuery(query),
      () => this.showAdminView(),
      () => this.showStoreView()
    );

    // 2. Setup Role Switcher & View Transitions
    this.bindRoleSwitcher();

    // 3. Hydrate Lucide Icons
    this.refreshIcons();

    // Re-hydrate icons on state changes or modal renders
    state.subscribe(() => {
      setTimeout(() => this.refreshIcons(), 50);
    });

    // Check URL Hash on load
    if (window.location.hash === '#admin') {
      this.showAdminView();
    }

    console.log('🌱 Desi Touch ("Nature Ka Asli Touch") Platform Initialized.');
  }

  refreshIcons() {
    try {
      createIcons({ icons });
    } catch (e) {
      console.warn('Lucide icon hydration', e);
    }
  }

  bindRoleSwitcher() {
    if (this.customerSwitchBtn) {
      this.customerSwitchBtn.addEventListener('click', () => {
        state.switchRole('customer');
        this.showStoreView();
        showToast('Switched to <strong>Customer View</strong> (Priya Sharma)');
      });
    }

    if (this.adminSwitchBtn) {
      this.adminSwitchBtn.addEventListener('click', () => {
        state.switchRole('admin');
        this.showAdminView();
        showToast('Switched to <strong>Admin Management Portal</strong> 🛡️');
      });
    }
  }

  showStoreView() {
    if (this.adminView) this.adminView.classList.add('hidden');
    if (this.storeView) this.storeView.classList.remove('hidden');

    if (this.customerSwitchBtn) this.customerSwitchBtn.classList.add('active');
    if (this.adminSwitchBtn) this.adminSwitchBtn.classList.remove('active');

    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.refreshIcons();
  }

  showAdminView() {
    if (this.storeView) this.storeView.classList.add('hidden');
    if (this.adminView) this.adminView.classList.remove('hidden');

    if (this.adminSwitchBtn) this.adminSwitchBtn.classList.add('active');
    if (this.customerSwitchBtn) this.customerSwitchBtn.classList.remove('active');

    window.location.hash = '#admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.adminPortal.renderAll();
    this.refreshIcons();
  }
}

// Bootstrap once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.desiTouchApp = new App();
});
