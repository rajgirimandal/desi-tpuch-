// Navbar & Header Interactions Component

import { showToast } from '../toast.js';

export class Navbar {
  constructor(onSearchChange, onSwitchToAdmin, onSwitchToStore) {
    this.onSearchChange = onSearchChange;
    this.onSwitchToAdmin = onSwitchToAdmin;
    this.onSwitchToStore = onSwitchToStore;

    this.header = document.getElementById('main-header');
    this.searchInput = document.getElementById('global-search-input');
    this.clearSearchBtn = document.getElementById('clear-search-btn');
    this.announceCoupon = document.getElementById('announce-coupon-trigger');
    this.navAdminLink = document.getElementById('nav-admin-link');
    this.brandHomeLink = document.getElementById('brand-home-link');
    this.wishlistBtn = document.getElementById('wishlist-btn');

    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (this.clearSearchBtn) {
          this.clearSearchBtn.classList.toggle('hidden', !val.trim());
        }
        if (this.onSearchChange) {
          this.onSearchChange(val);
        }
      });
    }

    // Clear search
    if (this.clearSearchBtn && this.searchInput) {
      this.clearSearchBtn.addEventListener('click', () => {
        this.searchInput.value = '';
        this.clearSearchBtn.classList.add('hidden');
        if (this.onSearchChange) {
          this.onSearchChange('');
        }
      });
    }

    // Announcement coupon copy
    if (this.announceCoupon) {
      this.announceCoupon.addEventListener('click', () => {
        navigator.clipboard.writeText('DESI20').then(() => {
          showToast('Coupon <strong>DESI20</strong> copied to clipboard! 📋');
        }).catch(() => {
          showToast('Coupon DESI20: Use at checkout for 20% off!');
        });
      });
    }

    // Admin nav pill
    if (this.navAdminLink) {
      this.navAdminLink.addEventListener('click', () => {
        if (this.onSwitchToAdmin) this.onSwitchToAdmin();
      });
    }

    // Brand logo
    if (this.brandHomeLink) {
      this.brandHomeLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.onSwitchToStore) this.onSwitchToStore();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Wishlist click
    if (this.wishlistBtn) {
      this.wishlistBtn.addEventListener('click', () => {
        showToast('❤️ Saved to your organic favorites list!');
      });
    }
  }
}
