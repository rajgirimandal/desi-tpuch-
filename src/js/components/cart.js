// Slide-out Cart Drawer Component

import { state } from '../state.js';
import { showToast } from '../toast.js';

export class CartDrawer {
  constructor(onOpenCheckout) {
    this.onOpenCheckout = onOpenCheckout;

    this.drawerOverlay = document.getElementById('cart-drawer');
    this.backdrop = document.getElementById('cart-backdrop');
    this.closeBtn = document.getElementById('close-cart-btn');
    this.openBtn = document.getElementById('open-cart-btn');

    this.itemsContainer = document.getElementById('cart-items-list');
    this.drawerItemCount = document.getElementById('drawer-item-count');
    this.headerItemCount = document.getElementById('cart-item-count');
    this.headerTotal = document.getElementById('cart-header-total');

    // Free shipping bar elements
    this.shippingProgressText = document.getElementById('shipping-progress-text');
    this.shippingProgressBar = document.getElementById('shipping-progress-bar');

    // Coupon elements
    this.couponInput = document.getElementById('cart-coupon-input');
    this.applyCouponBtn = document.getElementById('apply-coupon-btn');
    this.appliedCouponTag = document.getElementById('applied-coupon-tag');
    this.appliedCouponText = document.getElementById('applied-coupon-text');
    this.removeCouponBtn = document.getElementById('remove-coupon-btn');

    // Summary lines
    this.summarySubtotal = document.getElementById('cart-summary-subtotal');
    this.summaryDiscountRow = document.getElementById('cart-summary-discount-row');
    this.summaryDiscount = document.getElementById('cart-summary-discount');
    this.summaryShipping = document.getElementById('cart-summary-shipping');
    this.summaryTotal = document.getElementById('cart-summary-total');

    // Checkout CTA
    this.checkoutBtn = document.getElementById('checkout-cta-btn');

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    state.subscribe((event) => {
      if (['cart:changed', 'products:changed', 'state:reset'].includes(event)) {
        this.render();
      }
    });
  }

  render() {
    const cart = state.getCart();

    // Update Header
    if (this.headerItemCount) this.headerItemCount.textContent = cart.count;
    if (this.headerTotal) this.headerTotal.textContent = `₹${cart.total.toLocaleString('en-IN')}`;
    if (this.drawerItemCount) this.drawerItemCount.textContent = `${cart.count} item${cart.count === 1 ? '' : 's'}`;

    // Free Shipping Progress
    if (this.shippingProgressText && this.shippingProgressBar) {
      if (cart.subtotal >= cart.freeShippingThreshold) {
        this.shippingProgressText.innerHTML = '🎉 You unlocked <strong>FREE Express Farm Delivery!</strong>';
        this.shippingProgressBar.style.width = '100%';
      } else {
        const remaining = cart.freeShippingThreshold - cart.subtotal;
        const percent = Math.min(100, Math.round((cart.subtotal / cart.freeShippingThreshold) * 100));
        this.shippingProgressText.innerHTML = `Add ₹${remaining} more for <strong>FREE Express Delivery!</strong>`;
        this.shippingProgressBar.style.width = `${percent}%`;
      }
    }

    // Render Items
    if (this.itemsContainer) {
      if (cart.items.length === 0) {
        this.itemsContainer.innerHTML = `
          <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            <div style="font-size: 3.5rem; margin-bottom: 0.8rem;">🧺</div>
            <h4 style="color: var(--emerald-950); margin-bottom: 0.3rem;">Your Basket is Empty</h4>
            <p style="font-size: 0.85rem; margin-bottom: 1.5rem;">Explore our authentic Vedic churned ghee and cold-pressed oils.</p>
            <button class="btn btn-secondary btn-sm" id="cart-empty-shop-btn">Browse Pure Harvest</button>
          </div>
        `;

        const shopBtn = this.itemsContainer.querySelector('#cart-empty-shop-btn');
        if (shopBtn) {
          shopBtn.addEventListener('click', () => {
            this.close();
            const catalog = document.getElementById('products-catalog');
            if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
          });
        }
      } else {
        this.itemsContainer.innerHTML = cart.items.map(item => `
          <div class="cart-item-row" data-id="${item.id}">
            <div class="cart-item-img-box">
              <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-img">
            </div>
            <div class="cart-item-info">
              <div class="cart-item-title">${item.product.name}</div>
              <div class="cart-item-weight">${item.product.weight || 'Standard Pack'}</div>
              <div class="cart-item-actions">
                <div class="qty-stepper">
                  <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
                  <span class="qty-val">${item.quantity}</span>
                  <button class="qty-btn" data-action="increase" data-id="${item.id}" ${item.quantity >= item.product.stock ? 'disabled style="opacity: 0.4"' : ''}>+</button>
                </div>
                <strong class="cart-item-price">₹${item.lineTotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        `).join('');
      }
    }

    // Coupons
    if (cart.appliedCoupon) {
      if (this.appliedCouponTag) this.appliedCouponTag.classList.remove('hidden');
      if (this.appliedCouponText) this.appliedCouponText.textContent = `${cart.appliedCoupon.code} (${cart.appliedCoupon.label})`;
    } else {
      if (this.appliedCouponTag) this.appliedCouponTag.classList.add('hidden');
    }

    // Summary Lines
    if (this.summarySubtotal) this.summarySubtotal.textContent = `₹${cart.subtotal.toLocaleString('en-IN')}`;
    
    if (this.summaryDiscountRow) {
      if (cart.discount > 0) {
        this.summaryDiscountRow.classList.remove('hidden');
        if (this.summaryDiscount) this.summaryDiscount.textContent = `-₹${cart.discount.toLocaleString('en-IN')}`;
      } else {
        this.summaryDiscountRow.classList.add('hidden');
      }
    }

    if (this.summaryShipping) {
      this.summaryShipping.textContent = cart.shipping === 0 ? 'FREE' : `₹${cart.shipping}`;
    }

    if (this.summaryTotal) {
      this.summaryTotal.textContent = `₹${cart.total.toLocaleString('en-IN')}`;
    }

    if (this.checkoutBtn) {
      this.checkoutBtn.disabled = cart.items.length === 0;
    }
  }

  bindEvents() {
    // Open & Close
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.open());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    // Cart Items clicks (Quantity)
    if (this.itemsContainer) {
      this.itemsContainer.addEventListener('click', (e) => {
        const decBtn = e.target.closest('[data-action="decrease"]');
        if (decBtn) {
          const id = decBtn.dataset.id;
          const cart = state.getCart();
          const item = cart.items.find(i => i.id === id);
          if (item) {
            state.updateCartQuantity(id, item.quantity - 1);
          }
          return;
        }

        const incBtn = e.target.closest('[data-action="increase"]');
        if (incBtn) {
          const id = incBtn.dataset.id;
          const cart = state.getCart();
          const item = cart.items.find(i => i.id === id);
          if (item) {
            state.updateCartQuantity(id, item.quantity + 1);
          }
          return;
        }
      });
    }

    // Apply Coupon
    if (this.applyCouponBtn && this.couponInput) {
      this.applyCouponBtn.addEventListener('click', () => {
        const code = this.couponInput.value;
        const res = state.applyCoupon(code);
        if (res.success) {
          showToast(res.message, 'success');
          this.couponInput.value = '';
        } else {
          showToast(res.message, 'warning');
        }
      });
    }

    // Remove Coupon
    if (this.removeCouponBtn) {
      this.removeCouponBtn.addEventListener('click', () => {
        state.removeCoupon();
        showToast('Coupon removed');
      });
    }

    // Quick suggestion coupons
    document.querySelectorAll('.quick-coupon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        const res = state.applyCoupon(code);
        if (res.success) {
          showToast(res.message, 'success');
        } else {
          showToast(res.message, 'warning');
        }
      });
    });

    // Checkout button
    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => {
        this.close();
        if (this.onOpenCheckout) {
          this.onOpenCheckout();
        }
      });
    }
  }

  open() {
    if (this.drawerOverlay) {
      this.drawerOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    if (this.drawerOverlay) {
      this.drawerOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
}
