/**
 * FOREVER 21 - Functional Front-End Implementation
 * JavaScript for Interactive Cart, Navigation, Live Search, Modals & Responsive UX
 */

// ==========================================
// 1. PRODUCTS DATABASE & STATE
// ==========================================
const PRODUCTS_DATA = {
  women: [
    {
      id: 'prod-1',
      name: 'Mockneck Ribon Fitted sweater',
      category: 'women',
      price: 29.44,
      image: 'images/Burgundy Sweater Editorial Portrait.png',
      description: 'Ultra-soft ribbed knit mockneck sweater with a flattering contour fit. Perfect for versatile layering.',
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    {
      id: 'prod-2',
      name: 'Not Boring Graphic Baby tee Dress',
      category: 'women',
      price: 19.44,
      image: 'images/Smiling Woman in “I’m Late” Tee.png',
      description: 'Y2K inspired baby tee dress featuring playful retro typography and contrast rib trim.',
      sizes: ['XS', 'S', 'M', 'L']
    },
    {
      id: 'prod-3',
      name: "I'm late Graphic baby tee dress",
      category: 'women',
      price: 9.44,
      image: 'images/Late Again_ Sleeping Cat Streetwear.png',
      description: 'Relaxed streetwear t-shirt dress with iconic sleeping cat front graphic and breathable cotton blend.',
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 'prod-4',
      name: 'Ribed turtleneck mini sweater-dress',
      category: 'women',
      price: 39.44,
      image: 'images/Burgundy Turtleneck Fashion Portrait.png',
      description: 'Chic bodycon ribbed turtleneck dress in deep burgundy, crafted for seamless transition from day to evening.',
      sizes: ['XS', 'S', 'M', 'L']
    }
  ],
  men: [
    {
      id: 'prod-m1',
      name: 'Summer Streetwear Resort Shirt',
      category: 'men',
      price: 24.99,
      image: 'images/Summer Streetwear Portrait.png',
      description: 'Breezy camp-collar button up shirt with modern botanical print and relaxed silhouette.',
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'prod-m2',
      name: 'Botanical Resort Matching Set',
      category: 'men',
      price: 34.50,
      image: 'images/Coordinated Botanical Resort Couple.png',
      description: 'Coordinated resort shirt and shorts duo featuring clean earth tones and breathable linen-cotton.',
      sizes: ['S', 'M', 'L', 'XL']
    },
    {
      id: 'prod-m3',
      name: 'Stadium Style Maroon Hoodie',
      category: 'men',
      price: 39.99,
      image: 'images/Stylish Back-to-Back Streetwear Duo.png',
      description: 'Heavyweight fleece hoodie in rich maroon with drop shoulders and kangaroo pocket.',
      sizes: ['M', 'L', 'XL', 'XXL']
    },
    {
      id: 'prod-m4',
      name: 'Urban Denim Trucker Jacket',
      category: 'men',
      price: 49.99,
      image: 'images/Urban Duo in Denim and Maroon.png',
      description: 'Classic vintage-wash denim jacket with copper hardware and structured streetwear fit.',
      sizes: ['S', 'M', 'L', 'XL']
    }
  ]
};

// All combined products for search
const ALL_PRODUCTS = [...PRODUCTS_DATA.women, ...PRODUCTS_DATA.men];

// Application state
let currentFilter = 'women';
let cart = [];
let quickViewSelectedSize = 'M';
let currentQuickViewProduct = null;

// ==========================================
// 2. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Load Lucide icons
  initializeIcons();

  // Load cart from localStorage
  loadCartFromStorage();

  // Attach event listeners
  setupCartEvents();
  setupMobileNavEvents();
  setupFilterEvents();
  setupSearchEvents();
  setupFooterAccordion();
  setupQuickViewEvents();
  setupAuthModalEvents();
  setupPromoPillEvents();

  // Initial cart render
  renderCart();
});

function initializeIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

// ==========================================
// 3. CART MANAGEMENT
// ==========================================
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('f21_cart');
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    cart = [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem('f21_cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart to localStorage', e);
  }
}

function addToCart(productId, quantity = 1, size = 'M') {
  const product = ALL_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingIndex = cart.findIndex(item => item.id === productId && item.size === size);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size,
      quantity: quantity
    });
  }

  saveCartToStorage();
  renderCart();

  // Animate badge
  const badge = document.getElementById('cart-badge-count');
  if (badge) {
    badge.classList.remove('bump');
    void badge.offsetWidth; // trigger reflow
    badge.classList.add('bump');
  }

  // Show Toast
  showToast(`Added ${product.name} (${size}) to your Cart!`, 'shopping-cart');

  // Open Cart Drawer
  openCartDrawer();
}

function updateCartQuantity(productId, size, delta) {
  const itemIndex = cart.findIndex(item => item.id === productId && item.size === size);
  if (itemIndex === -1) return;

  cart[itemIndex].quantity += delta;

  if (cart[itemIndex].quantity <= 0) {
    cart.splice(itemIndex, 1);
    showToast('Item removed from Cart', 'trash-2');
  }

  saveCartToStorage();
  renderCart();
}

function removeCartItem(productId, size) {
  cart = cart.filter(item => !(item.id === productId && item.size === size));
  saveCartToStorage();
  renderCart();
  showToast('Item removed from Cart', 'trash-2');
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const badge = document.getElementById('cart-badge-count');
  const drawerCount = document.getElementById('drawer-cart-count');
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountEl = document.getElementById('cart-discount');
  const totalEl = document.getElementById('cart-total');
  const shippingText = document.getElementById('shipping-progress-text');
  const shippingFill = document.getElementById('shipping-progress-fill');
  const cartFooter = document.getElementById('cart-drawer-footer');

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Update counters
  if (badge) badge.textContent = totalItemsCount;
  if (drawerCount) drawerCount.textContent = totalItemsCount;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-message">
        <img src="images/icons/cart.svg" alt="Cart" style="width: 42px; height: 42px; margin-bottom: 14px; opacity: 0.6;">
        <h3>Your Cart is Empty</h3>
        <p>Explore our latest arrivals and discover something you love!</p>
      </div>
    `;
    if (cartFooter) cartFooter.style.display = 'none';
    if (shippingFill) shippingFill.style.width = '0%';
    if (shippingText) shippingText.innerHTML = 'Add <strong>$50.00</strong> more for <strong>FREE SHIPPING!</strong>';
    initializeIcons();
    return;
  }

  if (cartFooter) cartFooter.style.display = 'block';

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal * 0.20; // 20% discount as on mockup
  const total = subtotal - discount;

  // Free shipping progress ($50 target)
  const freeShippingThreshold = 50.00;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - total);
  const progressPercent = Math.min(100, Math.round((total / freeShippingThreshold) * 100));

  if (shippingFill) shippingFill.style.width = `${progressPercent}%`;
  if (shippingText) {
    if (remainingForFreeShipping <= 0) {
      shippingText.innerHTML = '🎉 You qualify for <strong>FREE STANDARD SHIPPING!</strong>';
    } else {
      shippingText.innerHTML = `Add <strong>$${remainingForFreeShipping.toFixed(2)}</strong> more for <strong>FREE SHIPPING!</strong>`;
    }
  }

  // Subtotal & Total display
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

  // Render items
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <div>
          <h4 class="cart-item-title">${item.name}</h4>
          <div style="font-size: 11.5px; color: #6b7280; margin-bottom: 4px;">Size: <strong>${item.size}</strong></div>
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-stepper">
            <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', '${item.size}', -1)" aria-label="Decrease quantity">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', '${item.size}', 1)" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-item-remove-btn" onclick="removeCartItem('${item.id}', '${item.size}')" aria-label="Remove item">
            <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  initializeIcons();
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function setupCartEvents() {
  const openBtn = document.getElementById('cart-toggle-btn');
  const closeBtn = document.getElementById('close-cart-btn');
  const backdrop = document.getElementById('cart-backdrop');
  const continueBtn = document.getElementById('continue-shopping-btn');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (openBtn) openBtn.addEventListener('click', openCartDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (backdrop) backdrop.addEventListener('click', closeCartDrawer);
  if (continueBtn) continueBtn.addEventListener('click', closeCartDrawer);

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return;
      showToast('Proceeding to Secure Checkout...', 'lock');
      setTimeout(() => {
        alert('Thank you for shopping at Forever 21!\n\nYour order has been simulated successfully with Extra 20% discount applied.');
        cart = [];
        saveCartToStorage();
        renderCart();
        closeCartDrawer();
      }, 800);
    });
  }

  // Attach direct add-to-cart clicks
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart-action-btn');
    if (addBtn) {
      const id = addBtn.dataset.productId;
      addToCart(id, 1, 'M');
    }
  });
}

// ==========================================
// 4. MOBILE NAVIGATION DRAWER
// ==========================================
function setupMobileNavEvents() {
  const menuBtn = document.getElementById('menu-toggle-btn');
  const closeBtn = document.getElementById('close-mobile-nav-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMobileNav() {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuBtn) menuBtn.addEventListener('click', openMobileNav);
  if (closeBtn) closeBtn.addEventListener('click', closeMobileNav);
  if (backdrop) backdrop.addEventListener('click', closeMobileNav);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });
}

// ==========================================
// 5. "JUST IN" FILTER TABS
// ==========================================
function setupFilterEvents() {
  const pills = document.querySelectorAll('.filter-tab-group .filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      const filter = pill.dataset.filter;
      currentFilter = filter;
      renderProductsGrid(filter);
    });
  });
}

function renderProductsGrid(category) {
  const container = document.getElementById('products-grid');
  if (!container) return;

  const products = PRODUCTS_DATA[category] || PRODUCTS_DATA.women;

  container.innerHTML = products.map(prod => `
    <div class="product-card" data-id="${prod.id}" data-gender="${prod.category}">
      <div class="product-media" onclick="openQuickView('${prod.id}')">
        <img 
          src="${prod.image}" 
          alt="${prod.name}" 
          loading="lazy"
          class="product-img"
        >
        <div class="quick-view-overlay">
          <span>Quick View</span>
        </div>
      </div>
      <div class="product-details">
        <h3 class="product-title" onclick="openQuickView('${prod.id}')">${prod.name}</h3>
        <div class="product-price">$${prod.price.toFixed(2)}</div>
      </div>
      <button 
        class="add-to-cart-action-btn" 
        data-product-id="${prod.id}"
        data-name="${prod.name}"
        data-price="${prod.price}"
        data-image="${prod.image}"
      >
        <span>Add to cart</span>
        <i data-lucide="shopping-bag" class="btn-cart-icon"></i>
      </button>
    </div>
  `).join('');

  initializeIcons();
}

// ==========================================
// 6. LIVE SEARCH (DESKTOP & MOBILE)
// ==========================================
function setupSearchEvents() {
  setupSearchInput('desktop-search-input', 'desktop-search-clear', 'desktop-search-dropdown');
  setupSearchInput('mobile-search-input', 'mobile-search-clear', 'mobile-search-dropdown');

  // Mobile search icon trigger in header
  const mobileSearchTrigger = document.getElementById('mobile-search-trigger');
  const mobileSearchInput = document.getElementById('mobile-search-input');
  if (mobileSearchTrigger && mobileSearchInput) {
    mobileSearchTrigger.addEventListener('click', () => {
      mobileSearchInput.focus();
      mobileSearchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}

function setupSearchInput(inputId, clearBtnId, dropdownId) {
  const input = document.getElementById(inputId);
  const clearBtn = document.getElementById(clearBtnId);
  const dropdown = document.getElementById(dropdownId);

  if (!input || !dropdown) return;

  input.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    if (clearBtn) {
      clearBtn.style.display = query.length > 0 ? 'flex' : 'none';
    }

    if (query.length < 1) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    const matches = ALL_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 16px; text-align: center; color: #6b7280; font-size: 13px;">
          No matching items found for "<strong>${escapeHtml(query)}</strong>"
        </div>
      `;
      dropdown.style.display = 'block';
      return;
    }

    dropdown.innerHTML = matches.map(p => `
      <div class="search-result-item" onclick="openQuickView('${p.id}'); hideAllSearchDropdowns();">
        <img src="${p.image}" alt="${p.name}" class="search-result-img">
        <div class="search-result-info">
          <div class="search-result-name">${highlightMatch(p.name, query)}</div>
          <div class="search-result-price">$${p.price.toFixed(2)}</div>
        </div>
        <span class="search-result-badge">${p.category.toUpperCase()}</span>
      </div>
    `).join('');

    dropdown.style.display = 'block';
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      dropdown.style.display = 'none';
      input.focus();
    });
  }

  // Close search dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

function hideAllSearchDropdowns() {
  const d1 = document.getElementById('desktop-search-dropdown');
  const d2 = document.getElementById('mobile-search-dropdown');
  if (d1) d1.style.display = 'none';
  if (d2) d2.style.display = 'none';
}

function highlightMatch(text, query) {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return escapeHtml(text);
  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);
  return `${escapeHtml(before)}<span style="background-color: var(--color-yellow); font-weight: 700;">${escapeHtml(match)}</span>${escapeHtml(after)}`;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

// ==========================================
// 7. QUICK VIEW MODAL
// ==========================================
function setupQuickViewEvents() {
  const backdrop = document.getElementById('quick-view-backdrop');
  const closeBtn = document.getElementById('close-quick-view-btn');

  function closeQuickView() {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeQuickView);
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeQuickView();
    });
  }
}

function openQuickView(productId) {
  const product = ALL_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  currentQuickViewProduct = product;
  quickViewSelectedSize = product.sizes ? product.sizes[0] : 'M';

  const contentEl = document.getElementById('quick-view-content');
  const backdrop = document.getElementById('quick-view-backdrop');

  contentEl.innerHTML = `
    <div class="qv-media">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="qv-info">
      <h2 class="qv-title">${product.name}</h2>
      <div class="qv-price">$${product.price.toFixed(2)}</div>
      <p style="font-size: 13.5px; color: #4b5563; line-height: 1.5; margin-bottom: 20px;">
        ${product.description}
      </p>

      <div class="qv-sizes">
        <span class="qv-label">Select Size</span>
        <div class="qv-size-buttons">
          ${product.sizes.map(size => `
            <button 
              type="button" 
              class="qv-size-btn ${size === quickViewSelectedSize ? 'active' : ''}" 
              onclick="selectQuickViewSize('${size}')"
            >${size}</button>
          `).join('')}
        </div>
      </div>

      <button type="button" class="qv-add-btn" onclick="addCurrentQuickViewToCart()">
        <i data-lucide="shopping-bag" style="width: 18px; height: 18px;"></i>
        <span>ADD TO BAG</span>
      </button>
    </div>
  `;

  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
  initializeIcons();
}

function selectQuickViewSize(size) {
  quickViewSelectedSize = size;
  const buttons = document.querySelectorAll('.qv-size-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === size);
  });
}

function addCurrentQuickViewToCart() {
  if (!currentQuickViewProduct) return;
  addToCart(currentQuickViewProduct.id, 1, quickViewSelectedSize);

  // Close Quick view modal
  const backdrop = document.getElementById('quick-view-backdrop');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

// ==========================================
// 8. AUTHENTICATION MODAL
// ==========================================
function setupAuthModalEvents() {
  const accountBtn = document.getElementById('account-btn');
  const mobileAuthBtn = document.getElementById('mobile-auth-btn');
  const backdrop = document.getElementById('auth-modal-backdrop');
  const closeBtn = document.getElementById('close-auth-modal-btn');

  function openAuthModal() {
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    // close mobile drawer if open
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    const mobileBackdrop = document.getElementById('mobile-nav-backdrop');
    if (mobileDrawer) mobileDrawer.classList.remove('active');
    if (mobileBackdrop) mobileBackdrop.classList.remove('active');
  }

  function closeAuthModal() {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  window.closeAuthModal = closeAuthModal;

  if (accountBtn) accountBtn.addEventListener('click', openAuthModal);
  if (mobileAuthBtn) mobileAuthBtn.addEventListener('click', openAuthModal);
  if (closeBtn) closeBtn.addEventListener('click', closeAuthModal);
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeAuthModal();
    });
  }
}

function handleAuthSubmit() {
  const emailInput = document.getElementById('auth-email');
  const email = emailInput ? emailInput.value : '';
  showToast(`Welcome back, ${email.split('@')[0]}!`, 'check');
  closeAuthModal();
}

// ==========================================
// 9. FOOTER ACCORDIONS (MOBILE ONLY)
// ==========================================
function setupFooterAccordion() {
  const cols = document.querySelectorAll('.accordion-col');
  cols.forEach(col => {
    const header = col.querySelector('.accordion-header');
    if (header) {
      header.addEventListener('click', () => {
        // only toggle on smaller screens
        if (window.innerWidth <= 768) {
          const isOpen = col.classList.contains('open');
          // Close others
          cols.forEach(c => c.classList.remove('open'));
          if (!isOpen) {
            col.classList.add('open');
          }
        }
      });
    }
  });
}

// ==========================================
// 10. PROMO PILLS INTERACTION (NEW MARKDOWN)
// ==========================================
function setupPromoPillEvents() {
  const pills = document.querySelectorAll('.promo-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => {
        p.classList.remove('pill-dark', 'active');
        p.classList.add('pill-light');
      });
      pill.classList.remove('pill-light');
      pill.classList.add('pill-dark', 'active');
      showToast(`Filtered for: ${pill.textContent.trim()}`, 'tag');
    });
  });
}

// ==========================================
// 11. TOAST NOTIFICATIONS
// ==========================================
function showToast(message, iconName = 'check') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="toast-icon"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  initializeIcons();

  // trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // remove after 3.2 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3200);
}

// Keyboard shortcuts (Escape key closes open modals/drawers)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCartDrawer();
    closeAuthModal();
    const qv = document.getElementById('quick-view-backdrop');
    if (qv) qv.classList.remove('active');
    const mn = document.getElementById('mobile-nav-drawer');
    const mb = document.getElementById('mobile-nav-backdrop');
    if (mn) mn.classList.remove('active');
    if (mb) mb.classList.remove('active');
    document.body.style.overflow = '';
    hideAllSearchDropdowns();
  }
});

