// Authentication & Customer Dashboard Component

import { state } from '../state.js';
import { showToast } from '../toast.js';

export class AuthManager {
  constructor(onSwitchToAdmin) {
    this.onSwitchToAdmin = onSwitchToAdmin;

    // Header Trigger & Dropdown
    this.userProfileBtn = document.getElementById('user-profile-btn');
    this.userDropdown = document.getElementById('user-dropdown');
    this.headerUserName = document.getElementById('header-user-name');
    this.dropdownUserName = document.getElementById('dropdown-user-name');
    this.dropdownUserEmail = document.getElementById('dropdown-user-email');
    this.dropdownUserBadge = document.getElementById('dropdown-user-badge');
    this.dropdownUserCoins = document.getElementById('dropdown-user-coins');
    this.dropdownAvatar = document.getElementById('dropdown-avatar');
    this.logoutBtn = document.getElementById('logout-btn');
    this.openOrdersBtn = document.getElementById('open-my-orders-btn');
    this.dropdownAdminBtn = document.getElementById('dropdown-admin-btn');

    // Auth Modal
    this.authModal = document.getElementById('auth-modal');
    this.authBackdrop = document.getElementById('auth-backdrop');
    this.closeAuthBtn = document.getElementById('close-auth-btn');
    this.authTabs = document.querySelectorAll('.auth-tab');
    this.loginForm = document.getElementById('login-form');
    this.registerForm = document.getElementById('register-form');
    this.demoCustomerBtn = document.getElementById('demo-customer-btn');
    this.demoAdminBtn = document.getElementById('demo-admin-btn');
    this.togglePwdBtn = document.getElementById('toggle-pwd-btn');
    this.loginPwdInput = document.getElementById('login-password');

    // Customer Account Modal
    this.accountModal = document.getElementById('account-modal');
    this.accountBackdrop = document.getElementById('account-backdrop');
    this.closeAccountBtn = document.getElementById('close-account-btn');
    this.accountUserEmail = document.getElementById('account-user-email');
    this.accountCoinsVal = document.getElementById('account-coins-val');
    this.accountOrdersCount = document.getElementById('account-orders-count');
    this.accountOrdersList = document.getElementById('account-orders-list');

    this.init();
  }

  init() {
    this.updateUserUI();
    this.bindEvents();

    state.subscribe((event) => {
      if (['auth:changed', 'orders:changed', 'order:status_updated', 'state:reset'].includes(event)) {
        this.updateUserUI();
        this.renderAccountOrders();
      }
    });
  }

  updateUserUI() {
    const user = state.getCurrentUser();

    if (user) {
      if (this.headerUserName) {
        this.headerUserName.textContent = user.name.split(' ')[0];
      }
      if (this.dropdownUserName) this.dropdownUserName.textContent = user.name;
      if (this.dropdownUserEmail) this.dropdownUserEmail.textContent = user.email;
      if (this.dropdownAvatar) this.dropdownAvatar.textContent = user.name.charAt(0).toUpperCase();

      if (this.dropdownUserBadge) {
        this.dropdownUserBadge.textContent = user.role === 'admin' ? 'Store Administrator' : 'Gold Organic Member';
        this.dropdownUserBadge.className = user.role === 'admin' ? 'dropdown-badge text-danger' : 'dropdown-badge text-gold';
      }

      if (this.dropdownUserCoins) {
        const coins = user.coins || 0;
        this.dropdownUserCoins.textContent = `${coins} Coins (₹${Math.floor(coins / 2)} value)`;
      }
    } else {
      if (this.headerUserName) this.headerUserName.textContent = 'Sign In';
      if (this.dropdownUserName) this.dropdownUserName.textContent = 'Guest Visitor';
      if (this.dropdownUserEmail) this.dropdownUserEmail.textContent = 'Sign in to sync your cart';
    }
  }

  bindEvents() {
    // Dropdown toggle
    if (this.userProfileBtn) {
      this.userProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const user = state.getCurrentUser();
        if (!user) {
          this.openAuthModal('login');
        } else {
          if (this.userDropdown) {
            this.userDropdown.classList.toggle('hidden');
          }
        }
      });
    }

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (this.userDropdown && !this.userDropdown.contains(e.target) && !this.userProfileBtn.contains(e.target)) {
        this.userDropdown.classList.add('hidden');
      }
    });

    // Logout
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('click', () => {
        state.logout();
        if (this.userDropdown) this.userDropdown.classList.add('hidden');
        showToast('Logged out successfully');
      });
    }

    // Open Orders from Dropdown
    if (this.openOrdersBtn) {
      this.openOrdersBtn.addEventListener('click', () => {
        if (this.userDropdown) this.userDropdown.classList.add('hidden');
        this.openAccountModal();
      });
    }

    // Admin link from Dropdown
    if (this.dropdownAdminBtn) {
      this.dropdownAdminBtn.addEventListener('click', () => {
        if (this.userDropdown) this.userDropdown.classList.add('hidden');
        if (this.onSwitchToAdmin) this.onSwitchToAdmin();
      });
    }

    // Auth Modal controls
    if (this.closeAuthBtn) this.closeAuthBtn.addEventListener('click', () => this.closeAuthModal());
    if (this.authBackdrop) this.authBackdrop.addEventListener('click', () => this.closeAuthModal());

    // Tabs: Sign in vs Register
    this.authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        this.switchAuthTab(target);
      });
    });

    // Password visibility toggle
    if (this.togglePwdBtn && this.loginPwdInput) {
      this.togglePwdBtn.addEventListener('click', () => {
        const type = this.loginPwdInput.type === 'password' ? 'text' : 'password';
        this.loginPwdInput.type = type;
      });
    }

    // Demo customer click
    if (this.demoCustomerBtn) {
      this.demoCustomerBtn.addEventListener('click', () => {
        const emailInput = document.getElementById('login-email');
        if (emailInput && this.loginPwdInput) {
          emailInput.value = 'priya@example.com';
          this.loginPwdInput.value = 'user';
        }
        this.demoCustomerBtn.classList.add('active');
        if (this.demoAdminBtn) this.demoAdminBtn.classList.remove('active');
      });
    }

    // Demo admin click
    if (this.demoAdminBtn) {
      this.demoAdminBtn.addEventListener('click', () => {
        const emailInput = document.getElementById('login-email');
        if (emailInput && this.loginPwdInput) {
          emailInput.value = 'admin@desitouch.com';
          this.loginPwdInput.value = 'admin';
        }
        this.demoAdminBtn.classList.add('active');
        if (this.demoCustomerBtn) this.demoCustomerBtn.classList.remove('active');
      });
    }

    // Login Form Submit
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email')?.value || '';
        const password = this.loginPwdInput?.value || '';

        const res = state.login(email, password);
        if (res.success) {
          showToast(`Welcome back, ${res.user.name.split(' ')[0]}! 🌱`, 'success');
          this.closeAuthModal();

          if (res.user.role === 'admin' && this.onSwitchToAdmin) {
            this.onSwitchToAdmin();
          }
        } else {
          showToast(res.message, 'error');
        }
      });
    }

    // Register Form Submit
    if (this.registerForm) {
      this.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name')?.value;
        const email = document.getElementById('reg-email')?.value;
        const phone = document.getElementById('reg-phone')?.value;
        const password = document.getElementById('reg-password')?.value;

        const res = state.register({ name, email, phone, password });
        if (res.success) {
          showToast(`Welcome to Desi Touch, ${name}! You claimed 100 Desi Coins! 🎁`, 'success');
          this.closeAuthModal();
        } else {
          showToast(res.message, 'warning');
        }
      });
    }

    // Customer Account Modal controls
    if (this.closeAccountBtn) this.closeAccountBtn.addEventListener('click', () => this.closeAccountModal());
    if (this.accountBackdrop) this.accountBackdrop.addEventListener('click', () => this.closeAccountModal());
  }

  switchAuthTab(tabName) {
    this.authTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));

    if (this.loginForm) this.loginForm.classList.toggle('hidden', tabName !== 'login');
    if (this.registerForm) this.registerForm.classList.toggle('hidden', tabName !== 'register');
  }

  openAuthModal(tab = 'login') {
    this.switchAuthTab(tab);
    if (this.authModal) {
      this.authModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  closeAuthModal() {
    if (this.authModal) {
      this.authModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  openAccountModal() {
    const user = state.getCurrentUser();
    if (!user) {
      this.openAuthModal('login');
      return;
    }

    if (this.accountUserEmail) this.accountUserEmail.textContent = user.email;
    if (this.accountCoinsVal) {
      const coins = user.coins || 0;
      this.accountCoinsVal.textContent = `${coins} Coins (₹${Math.floor(coins / 2)} value)`;
    }

    this.renderAccountOrders();

    if (this.accountModal) {
      this.accountModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  closeAccountModal() {
    if (this.accountModal) {
      this.accountModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  renderAccountOrders() {
    if (!this.accountOrdersList) return;

    const user = state.getCurrentUser();
    const allOrders = state.getOrders();
    // Filter for current customer or show sample orders
    const userOrders = allOrders.filter(o => 
      !user || user.role === 'admin' || o.customerEmail.toLowerCase() === user.email.toLowerCase() || o.customerName === user.name
    );

    if (this.accountOrdersCount) {
      this.accountOrdersCount.textContent = `${userOrders.length} Placed`;
    }

    if (userOrders.length === 0) {
      this.accountOrdersList.innerHTML = `
        <div style="text-align:center; padding: 2rem 0; color: var(--text-muted);">
          <p>No orders yet. Place your first fresh harvest order to start earning Desi Coins!</p>
        </div>
      `;
      return;
    }

    const getTimelineStepIndex = (status) => {
      switch (status) {
        case 'Pending': return 1;
        case 'Confirmed': return 2;
        case 'Packed & Shipped': return 3;
        case 'Delivered': return 4;
        default: return 1;
      }
    };

    this.accountOrdersList.innerHTML = userOrders.map(order => {
      const stepIdx = getTimelineStepIndex(order.status);

      return `
        <div class="user-order-card">
          <div class="user-order-top">
            <div>
              <strong style="font-family: var(--font-heading); color: var(--emerald-950); font-size: 1rem;">${order.id}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(order.createdAt).toLocaleDateString()} • Tracking: ${order.trackingNumber}</div>
            </div>
            <div style="text-align: right;">
              <strong style="color: var(--emerald-900); font-size: 1.05rem;">₹${order.total.toLocaleString('en-IN')}</strong>
              <div><span class="status-pill status-${order.status.toLowerCase().replace(/[^a-z]/g, '')}">${order.status}</span></div>
            </div>
          </div>

          <div class="user-order-items">
            ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
          </div>

          <!-- Real-Time Order Timeline Tracking -->
          <div class="order-tracking-timeline">
            <div class="timeline-step ${stepIdx >= 1 ? 'completed' : ''}">
              <div class="timeline-dot"></div>
              <span>Received</span>
            </div>
            <div class="timeline-step ${stepIdx >= 2 ? 'completed' : (stepIdx === 1 ? 'active' : '')}">
              <div class="timeline-dot"></div>
              <span>Confirmed</span>
            </div>
            <div class="timeline-step ${stepIdx >= 3 ? 'completed' : (stepIdx === 2 ? 'active' : '')}">
              <div class="timeline-dot"></div>
              <span>In Transit</span>
            </div>
            <div class="timeline-step ${stepIdx >= 4 ? 'completed' : (stepIdx === 3 ? 'active' : '')}">
              <div class="timeline-dot"></div>
              <span>Delivered</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}
