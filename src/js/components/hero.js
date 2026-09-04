// Hero Showcase Carousel Component

import { state } from '../state.js';

export class HeroCarousel {
  constructor() {
    this.track = document.getElementById('hero-carousel-track');
    this.indicatorsContainer = document.getElementById('hero-indicators');
    this.prevBtn = document.getElementById('hero-prev-btn');
    this.nextBtn = document.getElementById('hero-next-btn');
    this.currentIndex = 0;
    this.autoPlayInterval = null;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.startAutoPlay();

    // Re-render when banners change in state
    state.subscribe((event) => {
      if (event === 'banners:changed' || event === 'state:reset') {
        this.render();
      }
    });
  }

  getActiveBanners() {
    const banners = state.getBanners();
    const active = banners.filter(b => b.active);
    return active.length ? active : banners;
  }

  render() {
    const banners = this.getActiveBanners();
    if (!this.track || !banners.length) return;

    this.track.innerHTML = banners.map((b, idx) => `
      <div class="hero-slide" style="background-image: url('${b.image}')">
        <div class="hero-slide-overlay"></div>
        <div class="content-container" style="width: 100%;">
          <div class="hero-slide-content">
            <div class="hero-tag-badge">
              <span>🌱</span> ${b.tag || 'NATURE KA ASLI TOUCH'}
            </div>
            <h1 class="hero-title">${b.title}</h1>
            <p class="hero-subtitle">${b.subtitle}</p>
            <div class="hero-actions">
              <a href="${b.buttonLink || '#products-catalog'}" class="btn btn-primary">
                ${b.buttonText || 'Explore Pure Farm Products'}
              </a>
              ${b.discountText ? `
                <div class="hero-ribbon">
                  <span>✨</span> ${b.discountText}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Indicators
    if (this.indicatorsContainer) {
      this.indicatorsContainer.innerHTML = banners.map((_, idx) => `
        <div class="indicator-dot ${idx === this.currentIndex ? 'active' : ''}" data-index="${idx}"></div>
      `).join('');
    }

    this.updatePosition();
  }

  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.prev();
        this.startAutoPlay();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.stopAutoPlay();
        this.next();
        this.startAutoPlay();
      });
    }

    if (this.indicatorsContainer) {
      this.indicatorsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.indicator-dot');
        if (dot) {
          const index = parseInt(dot.dataset.index);
          this.goTo(index);
        }
      });
    }

    // Pause on hover
    if (this.track) {
      this.track.addEventListener('mouseenter', () => this.stopAutoPlay());
      this.track.addEventListener('mouseleave', () => this.startAutoPlay());
    }
  }

  updatePosition() {
    const banners = this.getActiveBanners();
    if (this.currentIndex >= banners.length) this.currentIndex = 0;
    if (this.currentIndex < 0) this.currentIndex = banners.length - 1;

    if (this.track) {
      this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }

    if (this.indicatorsContainer) {
      const dots = this.indicatorsContainer.querySelectorAll('.indicator-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === this.currentIndex);
      });
    }
  }

  next() {
    const banners = this.getActiveBanners();
    this.currentIndex = (this.currentIndex + 1) % banners.length;
    this.updatePosition();
  }

  prev() {
    const banners = this.getActiveBanners();
    this.currentIndex = (this.currentIndex - 1 + banners.length) % banners.length;
    this.updatePosition();
  }

  goTo(index) {
    this.currentIndex = index;
    this.updatePosition();
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.next();
    }, 6000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}
