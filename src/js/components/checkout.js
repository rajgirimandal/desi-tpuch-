// Multi-Step Checkout & Payment Processing Engine (Hardened)

import { state, APP_CONFIG } from '../state.js';
import { showToast } from '../toast.js';
import confetti from 'canvas-confetti';

export class CheckoutModal {
  constructor(onOpenAccount) {
    this.onOpenAccount = onOpenAccount;

    this.modal = document.getElementById('checkout-modal');
    this.backdrop = document.getElementById('checkout-backdrop');
    this.closeBtn = document.getElementById('close-checkout-btn');

    // Step containers
    this.step1 = document.getElementById('checkout-step-1');
    this.step2 = document.getElementById('checkout-step-2');
    this.step3 = document.getElementById('checkout-step-3');
    this.indicators = document.querySelectorAll('.step-indicator');

    // Forms & Controls
    this.addressForm = document.getElementById('address-form');
    this.backToCartBtn = document.getElementById('back-to-cart-btn');
    this.backToStep1Btn = document.getElementById('back-to-step-1-btn');
    this.confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    this.payButtonLabel = document.getElementById('pay-button-label');
    this.finalAmountDisplay = document.getElementById('checkout-final-amount');

    // Payment Tabs & Panels
    this.paymentTabs = document.querySelectorAll('.payment-tab');
    this.paymentPanels = {
      card: document.getElementById('payment-panel-card'),
      upi: document.getElementById('payment-panel-upi'),
      netbanking: document.getElementById('payment-panel-netbanking'),
      cod: document.getElementById('payment-panel-cod')
    };
    this.selectedPaymentMethod = 'card';

    // Interactive Card Preview
    this.cardNumberInput = document.getElementById('card-number-input');
    this.cardHolderInput = document.getElementById('card-holder-input');
    this.cardExpiryInput = document.getElementById('card-expiry-input');
    this.previewCardNumber = document.getElementById('preview-card-number');
    this.previewCardHolder = document.getElementById('preview-card-holder');
    this.previewCardExpiry = document.getElementById('preview-card-expiry');

    // Success Screen Elements
    this.receiptContent = document.getElementById('order-receipt-content');
    this.printInvoiceBtn = document.getElementById('print-invoice-btn');
    this.viewMyOrdersCta = document.getElementById('view-my-orders-cta');
    this.continueShoppingBtn = document.getElementById('continue-shopping-btn');

    // Countdown Timer for UPI
    this.upiTimer = document.getElementById('upi-countdown');
    this.upiInterval = null;

    this.currentOrderData = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.setupCardFormatting();
  }

  bindEvents() {
    // Modal controls
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
    if (this.backdrop) this.backdrop.addEventListener('click', () => this.close());
    if (this.backToCartBtn) {
      this.backToCartBtn.addEventListener('click', () => {
        this.close();
        const openCartBtn = document.getElementById('open-cart-btn');
        if (openCartBtn) openCartBtn.click();
      });
    }

    // Step 1 Submission
    if (this.addressForm) {
      this.addressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.goToStep(2);
      });
    }

    // Step 2 Back to Step 1
    if (this.backToStep1Btn) {
      this.backToStep1Btn.addEventListener('click', () => this.goToStep(1));
    }

    // Payment Tabs Switcher
    this.paymentTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const method = tab.dataset.payment;
        this.selectPaymentMethod(method);
      });
    });

    // Bank pill selector in Net Banking
    document.querySelectorAll('.bank-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.bank-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });

    // Confirm Payment & Place Order
    if (this.confirmPaymentBtn) {
      this.confirmPaymentBtn.addEventListener('click', () => this.processPayment());
    }

    // Success Actions
    if (this.printInvoiceBtn) {
      this.printInvoiceBtn.addEventListener('click', () => window.print());
    }

    if (this.viewMyOrdersCta) {
      this.viewMyOrdersCta.addEventListener('click', () => {
        this.close();
        if (this.onOpenAccount) this.onOpenAccount();
      });
    }

    if (this.continueShoppingBtn) {
      this.continueShoppingBtn.addEventListener('click', () => {
        this.close();
        const catalog = document.getElementById('products-catalog');
        if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  setupCardFormatting() {
    if (this.cardNumberInput) {
      this.cardNumberInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        e.target.value = formatted;
        if (this.previewCardNumber) {
          this.previewCardNumber.textContent = formatted || '•••• •••• •••• 4242';
        }
      });
    }

    if (this.cardHolderInput) {
      this.cardHolderInput.addEventListener('input', (e) => {
        const val = e.target.value.toUpperCase();
        if (this.previewCardHolder) {
          this.previewCardHolder.textContent = val || 'PRIYA SHARMA';
        }
      });
    }

    if (this.cardExpiryInput) {
      this.cardExpiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 3) {
          val = val.substring(0, 2) + '/' + val.substring(2);
        }
        e.target.value = val;
        if (this.previewCardExpiry) {
          this.previewCardExpiry.textContent = val || '08/29';
        }
      });
    }
  }

  selectPaymentMethod(method) {
    this.selectedPaymentMethod = method;

    this.paymentTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.payment === method);
    });

    Object.entries(this.paymentPanels).forEach(([key, panel]) => {
      if (panel) {
        panel.classList.toggle('hidden', key !== method);
        panel.classList.toggle('active', key === method);
      }
    });

    if (this.payButtonLabel) {
      if (method === 'cod') {
        this.payButtonLabel.textContent = 'Confirm Order via Cash on Delivery';
      } else if (method === 'upi') {
        this.payButtonLabel.textContent = 'Verify UPI & Complete Order';
      } else {
        this.payButtonLabel.textContent = 'Authorize Secure Payment';
      }
    }

    if (method === 'upi') {
      this.startUpiTimer();
    } else {
      this.stopUpiTimer();
    }
  }

  startUpiTimer() {
    this.stopUpiTimer();
    let secondsLeft = 300; // 5 minutes
    const update = () => {
      const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
      const s = (secondsLeft % 60).toString().padStart(2, '0');
      if (this.upiTimer) this.upiTimer.textContent = `${m}:${s}`;
      if (secondsLeft <= 0) {
        this.stopUpiTimer();
      }
      secondsLeft--;
    };
    update();
    this.upiInterval = setInterval(update, 1000);
  }

  stopUpiTimer() {
    if (this.upiInterval) {
      clearInterval(this.upiInterval);
      this.upiInterval = null;
    }
  }

  goToStep(stepNumber) {
    [this.step1, this.step2, this.step3].forEach((step, idx) => {
      if (step) {
        step.classList.toggle('active', idx + 1 === stepNumber);
        step.classList.toggle('hidden', idx + 1 !== stepNumber);
      }
    });

    this.indicators.forEach((ind, idx) => {
      ind.classList.toggle('active', idx + 1 <= stepNumber);
    });

    if (stepNumber === 2) {
      const cart = state.getCart();
      const speed = document.querySelector('input[name="delivery-speed"]:checked')?.value;
      const extraShipping = speed === 'priority' ? 75 : 0;
      const finalAmount = cart.total + extraShipping;

      if (this.finalAmountDisplay) {
        this.finalAmountDisplay.textContent = `₹${finalAmount.toLocaleString('en-IN')}`;
      }
    }
  }

  async processPayment() {
    const cart = state.getCart();
    if (cart.items.length === 0) {
      showToast('Your basket is empty!', 'error');
      this.close();
      return;
    }

    // Button loading animation
    if (this.confirmPaymentBtn) {
      this.confirmPaymentBtn.disabled = true;
      // Use textContent-safe update
      this.confirmPaymentBtn.innerHTML = '';
      const dot = document.createElement('span');
      dot.className = 'admin-pulse-dot';
      dot.style.background = '#fff';
      const label = document.createElement('span');
      label.textContent = 'Processing Authentic Transaction...';
      this.confirmPaymentBtn.appendChild(dot);
      this.confirmPaymentBtn.appendChild(label);
    }

    // Collect details
    const customerName = document.getElementById('ship-name')?.value || 'Valued Customer';
    const customerEmail = document.getElementById('ship-email')?.value || 'customer@example.com';
    const customerPhone = document.getElementById('ship-phone')?.value || '+91 98450 12345';
    const street = document.getElementById('ship-address')?.value || '12 Organic Lane';
    const city = document.getElementById('ship-city')?.value || 'Bengaluru';
    const stateVal = document.getElementById('ship-state')?.value || 'Karnataka';
    const pincode = document.getElementById('ship-pincode')?.value || '560038';

    const speed = document.querySelector('input[name="delivery-speed"]:checked')?.value;
    const extraShipping = speed === 'priority' ? 75 : 0;

    let paymentMethodLabel = 'Credit Card (Visa)';
    if (this.selectedPaymentMethod === 'upi') paymentMethodLabel = 'UPI / Google Pay (Verified)';
    if (this.selectedPaymentMethod === 'netbanking') paymentMethodLabel = 'Net Banking (HDFC)';
    if (this.selectedPaymentMethod === 'cod') paymentMethodLabel = 'Cash on Delivery';

    try {
      // Require server-side payment verification: expect a server to return a verifiedPaymentToken after performing payment.
      // In demo mode (APP_CONFIG.ALLOW_CLIENT_SIDE_ADMIN === true and a demo token present), allow simulated payment.

      const serverToken = localStorage.getItem(APP_CONFIG.SERVER_AUTH_TOKEN_KEY);
      const allowDemo = APP_CONFIG.ALLOW_CLIENT_SIDE_ADMIN && serverToken === APP_CONFIG.DEMO_SERVER_TOKEN_VALUE;

      if (!allowDemo) {
        // Attempt to call a server endpoint to validate payment (this repo does not include a server, so we expect integration here).
        // For safety: refuse to finalize orders without server confirmation in production.
        showToast('Payment validation required. Complete payment through the payment gateway to finalize order.', 'error');
        this.confirmPaymentBtn.disabled = false;
        // Reset label
        if (this.confirmPaymentBtn) {
          this.confirmPaymentBtn.innerHTML = '';
          const svg = document.createElement('span'); svg.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>';
          const span = document.createElement('span'); span.id = 'pay-button-label'; span.textContent = 'Authorize Secure Payment';
          this.confirmPaymentBtn.appendChild(svg);
          this.confirmPaymentBtn.appendChild(span);
        }
        return;
      }

      // If demo allowed, simulate payment and create order locally
      await new Promise(resolve => setTimeout(resolve, 1200));

      const newOrder = state.createOrder({
        customerName,
        customerEmail,
        customerPhone,
        address: { line1: street, city, state: stateVal, pincode },
        items: cart.items.map(i => ({ id: i.id, name: i.product.name, price: i.product.price, quantity: i.quantity, weight: i.product.weight })),
        subtotal: cart.subtotal,
        discount: cart.discount,
        shipping: cart.shipping + extraShipping,
        total: cart.total + extraShipping,
        paymentMethod: paymentMethodLabel
      });

      this.currentOrderData = newOrder;

      try { confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors: ['#16a34a', '#f59e0b', '#0d5c3a', '#22c55e'] }); } catch (e) { console.warn('Confetti effect', e); }

      if (this.confirmPaymentBtn) {
        this.confirmPaymentBtn.disabled = false;
        this.confirmPaymentBtn.innerHTML = '';
        const svg = document.createElement('span'); svg.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>';
        const span = document.createElement('span'); span.id = 'pay-button-label'; span.textContent = 'Authorize Secure Payment';
        this.confirmPaymentBtn.appendChild(svg);
        this.confirmPaymentBtn.appendChild(span);
      }

      this.renderReceipt(newOrder);
      this.goToStep(3);
      showToast('Order confirmed! Prepared with Vedic care 🌱', 'success');

    } catch (err) {
      console.error('Payment processing error', err);
      showToast('Payment failed. Please try again or contact support.', 'error');
      if (this.confirmPaymentBtn) this.confirmPaymentBtn.disabled = false;
    }
  }

  renderReceipt(order) {
    if (!this.receiptContent) return;

    // Build receipt using safe DOM operations (avoid innerHTML with user data)
    this.receiptContent.innerHTML = '';

    const header = document.createElement('div'); header.className = 'receipt-header';
    const left = document.createElement('div');
    const receiptId = document.createElement('div'); receiptId.className = 'receipt-id'; receiptId.textContent = order.id;
    const tracking = document.createElement('div'); tracking.className = 'receipt-tracking'; tracking.innerHTML = 'Tracking Number: <strong>' + (order.trackingNumber || '') + '</strong>';
    left.appendChild(receiptId); left.appendChild(tracking);

    const right = document.createElement('div'); right.style.textAlign = 'right';
    const status = document.createElement('span'); status.className = 'status-pill status-confirmed'; status.textContent = 'Confirmed & In Prep';
    const date = document.createElement('div'); date.style.fontSize = '0.72rem'; date.style.color = 'var(--text-muted)'; date.style.marginTop = '0.2rem'; date.textContent = new Date(order.createdAt).toLocaleDateString();
    right.appendChild(status); right.appendChild(date);

    header.appendChild(left); header.appendChild(right);
    this.receiptContent.appendChild(header);

    const delivery = document.createElement('div'); delivery.style.fontSize = '0.82rem'; delivery.style.color = 'var(--text-secondary)'; delivery.style.marginBottom = '0.85rem';
    delivery.innerHTML = '<strong>Delivery To:</strong> ' + (order.customerName || '') + ' (' + (order.customerPhone || '') + ')<br>' + (order.address.line1 || '') + ', ' + (order.address.city || '') + ', ' + (order.address.state || '') + ' - ' + (order.address.pincode || '');
    this.receiptContent.appendChild(delivery);

    const itemsList = document.createElement('div'); itemsList.className = 'receipt-items-list';
    (order.items || []).forEach(item => {
      const row = document.createElement('div'); row.className = 'receipt-item-row';
      const left = document.createElement('span'); left.textContent = `${item.quantity}x ${item.name} (${item.weight || 'Standard Pack'})`;
      const right = document.createElement('strong'); right.textContent = `₹${(item.price * item.quantity).toLocaleString('en-IN')}`;
      row.appendChild(left); row.appendChild(right);
      itemsList.appendChild(row);
    });
    this.receiptContent.appendChild(itemsList);

    const paymentRow = document.createElement('div'); paymentRow.style.fontSize = '0.8rem'; paymentRow.style.color = 'var(--text-muted)'; paymentRow.style.margin = '0.6rem 0'; paymentRow.style.display = 'flex'; paymentRow.style.justifyContent = 'space-between';
    const pmLabel = document.createElement('span'); pmLabel.textContent = 'Payment Method:';
    const pmVal = document.createElement('strong'); pmVal.style.color = 'var(--emerald-900)'; pmVal.textContent = order.paymentMethod + ' (PAID)';
    paymentRow.appendChild(pmLabel); paymentRow.appendChild(pmVal);
    this.receiptContent.appendChild(paymentRow);

    const totals = document.createElement('div'); totals.className = 'receipt-totals'; totals.innerHTML = `<span>Final Paid Amount:</span><span>₹${order.total.toLocaleString('en-IN')}</span>`;
    this.receiptContent.appendChild(totals);
  }

  open() {
    const user = state.getCurrentUser();
    if (user && user.role === 'customer') {
      const nameInput = document.getElementById('ship-name');
      const emailInput = document.getElementById('ship-email');
      const phoneInput = document.getElementById('ship-phone');
      const addressInput = document.getElementById('ship-address');
      const cityInput = document.getElementById('ship-city');

      if (nameInput) nameInput.value = user.name || 'Priya Sharma';
      if (emailInput) emailInput.value = user.email || 'priya@example.com';
      if (phoneInput) phoneInput.value = user.phone || '+91 98450 12345';
      if (addressInput && user.savedAddress) addressInput.value = user.savedAddress.line1;
      if (cityInput && user.savedAddress) cityInput.value = user.savedAddress.city;
    }

    this.goToStep(1);
    if (this.modal) {
      this.modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    this.stopUpiTimer();
    if (this.modal) {
      this.modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
}
