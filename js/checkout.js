(function () {
  'use strict';

  // ===== DARK MODE FUNCTIONALITY =====
  const themeToggleBtns = document.querySelectorAll('.theme-toggle');
  const navbar = document.querySelector('header');

  // Check for saved theme preference or default to 'light'
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Update icon on page load
  updateThemeIcon(currentTheme);

  // Theme toggle event
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }

      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  });

  function updateThemeIcon(theme) {
    themeToggleBtns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        if (theme === 'dark') {
          icon.classList.remove('fa-moon');
          icon.classList.add('fa-sun');
        } else {
          icon.classList.remove('fa-sun');
          icon.classList.add('fa-moon');
        }
      }
    });
  }

  // ===== NAVBAR SCROLL EFFECT =====
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  // ===== HAMBURGER MENU TOGGLE =====
  const hamburger = document.querySelector('.hamberger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      mobileMenu.classList.toggle('mobile-menu-active');
    });
  }

  // ===== CUSTOM LANGUAGE SELECT =====
  const customSelect = document.getElementById('language-custom-select');
  if (customSelect) {
    const selected = customSelect.querySelector('.selected');
    const optionsList = customSelect.querySelector('.options');
    const options = customSelect.querySelectorAll('.options li');

    if (selected && options.length > 0) {
      selected.addEventListener('click', () => {
        customSelect.classList.toggle('open');
        const isOpen = customSelect.classList.contains('open');
        selected.setAttribute('aria-expanded', isOpen);
      });

      options.forEach(option => {
        option.addEventListener('click', () => {
          selected.textContent = option.textContent;
          customSelect.classList.remove('open');
          selected.setAttribute('aria-expanded', 'false');

          // Update all options' aria-selected
          options.forEach(opt => opt.setAttribute('aria-selected', 'false'));
          option.setAttribute('aria-selected', 'true');
        });
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
          customSelect.classList.remove('open');
          selected.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  // ===== BACK TO TOP BUTTON =====
  const backToTop = document.querySelector('.back-to-top');

  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
  }

  // ===== UTILITY FUNCTIONS =====
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function softZoneCheck(lat, lon) {
    const warnId = 'zoneWarning';
    const container = document.querySelector('.checkout-section');
    if (!lat || !lon || !container) return;
    const nashik = { lat: 19.9975, lon: 73.7898 };
    const km = haversineKm(lat, lon, nashik.lat, nashik.lon);
    let warn = document.getElementById(warnId);
    if (!warn) {
      warn = document.createElement('div');
      warn.id = warnId;
      warn.className = 'zone-warning';
      container.appendChild(warn);
    }
    if (km > 30) {
      warn.textContent = `Note: Your address is approximately ${km.toFixed(1)} km from Nashik. Delivery availability may vary.`;
      warn.style.display = 'block';
    } else {
      warn.textContent = '';
      warn.style.display = 'none';
    }
  }

  function initCityAutocomplete() {
    const cityInput = document.getElementById('city');
    const suggestionsEl = document.getElementById('citySuggestions');
    if (!cityInput || !suggestionsEl) return;

    let currentController = null;
    const debouncedSearch = debounce(async (q) => {
      if (!q || q.length < 2) {
        suggestionsEl.innerHTML = '';
        suggestionsEl.classList.remove('open');
        return;
      }
      try {
        if (currentController) currentController.abort();
        currentController = new AbortController();
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&dedupe=1&countrycodes=in&q=${encodeURIComponent(q)}`;

        // Show loading state
        suggestionsEl.innerHTML = '<div class="loading">Searching cities...</div>';
        suggestionsEl.classList.add('open');

        const res = await fetch(url, { headers: { 'Accept-Language': 'en-IN,en' }, signal: currentController.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        renderSuggestions(data || [], q);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('City search error:', error);
        suggestionsEl.innerHTML = '<div class="error">Unable to search cities. Please check your connection and try again.</div>';
        suggestionsEl.classList.add('open');
        setTimeout(() => {
          const retryBtn = document.createElement('button');
          retryBtn.textContent = 'Retry';
          retryBtn.className = 'retry-btn';
          retryBtn.onclick = () => debouncedSearch(q);
          suggestionsEl.appendChild(retryBtn);
        }, 1000);
      }
    }, 250);

    function renderSuggestions(items, query) {
      const uniqueCities = [];
      const seen = new Set();
      items.forEach((it) => {
        const a = it.address || {};
        const cityName = a.city || a.town || a.village || a.hamlet;
        const kind = (it.type || '').toLowerCase();
        const isCityLike = ['city', 'town', 'municipality'].includes(kind) || !!a.city || !!a.town;
        if (cityName) {
          const key = cityName.toLowerCase();
          if (!seen.has(key) && isCityLike) {
            seen.add(key);
            uniqueCities.push({ label: cityName, lat: it.lat, lon: it.lon, importance: it.importance || 0 });
          }
        }
      });

      uniqueCities.sort((a, b) => b.importance - a.importance || a.label.localeCompare(b.label));
      const q = String(query || '').trim().toLowerCase();
      const filtered = q ? uniqueCities.filter(c => c.label.toLowerCase().startsWith(q)) : uniqueCities;
      const results = filtered.length > 0 ? filtered : uniqueCities;

      if (results.length === 0) {
        suggestionsEl.innerHTML = '';
        suggestionsEl.classList.remove('open');
        return;
      }
      suggestionsEl.innerHTML = results.map((it, idx) => `<button type="button" role="option" class="autocomplete-item" data-idx="${idx}">${escapeHtml(it.label)}</button>`).join('');
      suggestionsEl.classList.add('open');

      suggestionsEl.querySelectorAll('.autocomplete-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          const i = parseInt(btn.dataset.idx, 10);
          const chosen = results[i];
          if (!chosen) return;
          cityInput.value = chosen.label;
          suggestionsEl.innerHTML = '';
          suggestionsEl.classList.remove('open');
          softZoneCheck(Number(chosen.lat), Number(chosen.lon));
        });
      });
    }

    cityInput.addEventListener('input', (e) => debouncedSearch(e.target.value.trim()));
    document.addEventListener('click', (e) => {
      if (!suggestionsEl.contains(e.target) && e.target !== cityInput) {
        suggestionsEl.innerHTML = '';
        suggestionsEl.classList.remove('open');
      }
    });
  }

  function initPincodeValidation() {
    const zipInput = document.getElementById('zipCode');
    const cityInput = document.getElementById('city');
    if (!zipInput) return;

    const setError = (msg) => {
      const group = zipInput.closest('.form-group');
      if (group) group.classList.add('error');
      const err = group ? group.querySelector('.error-message') : null;
      if (err) err.textContent = msg || 'Invalid pincode';
      window.__lastPinStatus = 'error';
    };

    const clearError = () => {
      const group = zipInput.closest('.form-group');
      if (group) group.classList.remove('error');
    };

    const validateLength = (pin) => /^\d{6}$/.test(pin);

    const lookupPin = debounce(async (pin) => {
      if (!validateLength(pin)) { setError('Pincode must be 6 digits'); return; }
      try {
        setError('Validating pincode...');

        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        if (!Array.isArray(data) || !data[0] || data[0].Status !== 'Success') { setError('Pincode not found'); return; }
        const postOffices = data[0].PostOffice || [];
        if (postOffices.length === 0) { setError('Pincode not found'); return; }
        const cityFromPin = postOffices[0].District || postOffices[0].Division || postOffices[0].Region || '';

        if (cityInput && !cityInput.value.trim() && cityFromPin) { cityInput.value = cityFromPin; }

        if (cityInput && cityInput.value.trim()) {
          const typed = cityInput.value.trim().toLowerCase();
          const ok = postOffices.some((po) => {
            const district = (po.District || '').toLowerCase();
            const region = (po.Region || '').toLowerCase();
            const division = (po.Division || '').toLowerCase();
            const state = (po.State || '').toLowerCase();
            return district === typed || region === typed || division === typed || state === typed || (po.Name || '').toLowerCase() === typed;
          });
          if (!ok) { setError('Pincode does not match selected city'); return; }
        }

        clearError();
        window.__lastPinStatus = 'ok';
      } catch (error) {
        console.error('Pincode validation error:', error);
        setError('Unable to validate pincode. Please check your connection and try again.');
        const group = zipInput.closest('.form-group');
        if (group) {
          const retryBtn = document.createElement('button');
          retryBtn.textContent = 'Retry';
          retryBtn.className = 'retry-btn';
          retryBtn.onclick = () => {
            retryBtn.remove();
            lookupPin(pin);
          };
          group.appendChild(retryBtn);
        }
      }
    }, 350);

    zipInput.addEventListener('input', (e) => {
      window.__lastPinStatus = undefined;
      const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
      e.target.value = pin;
      if (pin.length === 6) lookupPin(pin);
    });

    if (cityInput) {
      cityInput.addEventListener('input', () => {
        const pin = zipInput.value.trim();
        if (pin.length === 6) lookupPin(pin);
      });
    }
  }

  // ===== CART MANAGEMENT =====
  let cartData = [];
  const deliveryFee = 29.0;
  const taxRate = 0.1;
  let selectedPayment = "card";

  // ===== SKELETON FOR ORDER ITEMS =====
  const createSkeletonOrderItem = () => {
    const div = document.createElement('div');
    div.className = 'skeleton-cart-item';
    div.innerHTML = `
      <div class="skeleton skeleton-cart-image"></div>
      <div class="skeleton-cart-detail">
        <div class="skeleton skeleton-cart-text"></div>
        <div class="skeleton skeleton-cart-total"></div>
      </div>
      <div class="skeleton-cart-quantity">
        <div class="skeleton skeleton-cart-btn"></div>
        <div class="skeleton skeleton-cart-value"></div>
        <div class="skeleton skeleton-cart-btn"></div>
      </div>
    `;
    return div;
  };

  const showSkeletonOrderItems = (count = 3) => {
    const container = document.getElementById('orderItems');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) container.appendChild(createSkeletonOrderItem());
  };

  function loadCartData() {
    let loadedData = null;
    try {
      loadedData = JSON.parse(sessionStorage.getItem("checkoutCart") || "null");
    } catch (_) { loadedData = null; }

    if (!Array.isArray(loadedData) || loadedData.length === 0) {
      try {
        loadedData = JSON.parse(localStorage.getItem('foodie:cart') || '[]');
      } catch (_) { loadedData = []; }
    }
    if (!Array.isArray(loadedData)) loadedData = [];
    cartData = loadedData;
  }

  function saveCartData() {
    try {
      sessionStorage.setItem('checkoutCart', JSON.stringify(cartData));
      localStorage.setItem('foodie:cart', JSON.stringify(cartData));
      const cartValueEl = document.querySelector('.cart-value');
      if (cartValueEl) {
        const totalQuantity = cartData.reduce((sum, item) => sum + (item.quantity || 0), 0);
        cartValueEl.textContent = totalQuantity;
      }
    } catch (e) {
      console.error("Failed to save cart data:", e);
    }
  }

  function displayOrderItems() {
    const container = document.getElementById("orderItems");
    const emptyCartMessage = document.getElementById("emptyCartMessage");
    const checkoutContent = document.getElementById("checkoutContent");

    if (!container) return;

    if (cartData.length === 0) {
      if (emptyCartMessage) emptyCartMessage.style.display = "block";
      if (checkoutContent) checkoutContent.style.display = "none";
      return;
    } else {
      if (emptyCartMessage) emptyCartMessage.style.display = "none";
      if (checkoutContent) checkoutContent.style.display = "grid";
    }

    container.innerHTML = cartData
      .map((item) => {
        const name = item && item.name ? item.name : 'Item';
        const qty = item && item.quantity ? item.quantity : 1;
        const priceRaw = item && item.price ? item.price.toString() : '0';
        const priceNum = parseFloat(priceRaw.replace ? priceRaw.replace(/[₹$]/g, "") : priceRaw) || 0;
        const img = item && item.image ? item.image : '../imgs/placeholder.png';
        return `
          <div class="order-item" data-id="${item.id}">
            <img src="${img}" alt="${name}">
            <div class="order-item-details">
              <div class="order-item-name">${name}</div>
              <div class="quantity-controls">
                <button class="qty-btn minus-btn" data-id="${item.id}" aria-label="Decrease quantity of ${name}">
                  <i class="fa-solid fa-minus"></i>
                </button>
                <span class="qty-display" data-id="${item.id}">${qty}</span>
                <button class="qty-btn plus-btn" data-id="${item.id}" aria-label="Increase quantity of ${name}">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
            <div class="order-item-price" data-id="${item.id}">₹${(qty * priceNum).toFixed(2)}</div>
          </div>
        `;
      })
      .join("");
  }

  function calculateTotals() {
    const subtotalEl = document.getElementById("subtotal");
    const taxEl = document.getElementById("tax");
    const finalTotalEl = document.getElementById("finalTotal");

    if (!subtotalEl || !taxEl || !finalTotalEl) return;

    const subtotal = cartData.reduce((sum, item) => {
      const qty = item && item.quantity ? item.quantity : 1;
      const priceRaw = item && item.price ? item.price.toString() : '0';
      const priceNum = parseFloat(priceRaw.replace ? priceRaw.replace(/[₹$]/g, "") : priceRaw) || 0;
      return sum + qty * priceNum;
    }, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;

    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    taxEl.textContent = `₹${tax.toFixed(2)}`;
    finalTotalEl.textContent = `₹${total.toFixed(2)}`;
  }

  function updateItemUI(item) {
    const itemElement = document.querySelector(`.order-item[data-id="${item.id}"]`);
    if (itemElement) {
      const qtyDisplay = itemElement.querySelector('.qty-display');
      const itemPriceEl = itemElement.querySelector('.order-item-price');
      const priceNum = parseFloat(item.price.replace(/[₹$]/g, "")) || 0;

      if (qtyDisplay) qtyDisplay.textContent = item.quantity;
      if (itemPriceEl) itemPriceEl.textContent = `₹${(item.quantity * priceNum).toFixed(2)}`;
    }
  }

  function handleQuantityChange(itemId, change) {
    const itemIndex = cartData.findIndex(item => item.id == itemId);
    if (itemIndex > -1) {
      cartData[itemIndex].quantity += change;
      if (cartData[itemIndex].quantity <= 0) {
        cartData.splice(itemIndex, 1);
      } else {
        updateItemUI(cartData[itemIndex]);
      }
      saveCartData();
      displayOrderItems();
      calculateTotals();
    }
  }

  function setupEventListeners() {
    const paymentMethods = document.querySelectorAll(".payment-method");
    if (paymentMethods.length > 0) {
      paymentMethods.forEach((method) => {
        method.addEventListener("click", () => {
          paymentMethods.forEach((m) => m.classList.remove("active"));
          method.classList.add("active");
          selectedPayment = method.dataset.method;
        });
      });
    }

    const placeOrderBtn = document.getElementById("placeOrderBtn");
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (validateForm()) {
          if (selectedPayment !== "card") {
            alert("Currently only Card payment is integrated.");
            return;
          }
          placeOrderRazorpay();
        }
      });
    }

    const orderItemsContainer = document.getElementById('orderItems');
    if (orderItemsContainer) {
      orderItemsContainer.addEventListener('click', (e) => {
        const target = e.target.closest('.qty-btn');
        if (target) {
          e.preventDefault();
          const itemId = target.dataset.id;
          if (target.classList.contains('plus-btn')) {
            handleQuantityChange(itemId, 1);
          } else if (target.classList.contains('minus-btn')) {
            handleQuantityChange(itemId, -1);
          }
        }
      });
    }
  }

  function validateForm() {
    const form = document.getElementById("checkoutForm");
    if (!form) return true;

    const inputs = form.querySelectorAll("input[required], textarea[required]");
    let isValid = true;

    inputs.forEach((input) => {
      const formGroup = input.closest(".form-group");
      if (!input.value.trim()) {
        if (formGroup) formGroup.classList.add("error");
        isValid = false;
      } else {
        if (formGroup) formGroup.classList.remove("error");
      }
    });

    const email = document.getElementById("email");
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email.value && !emailRegex.test(email.value)) {
        const formGroup = email.closest(".form-group");
        if (formGroup) formGroup.classList.add("error");
        isValid = false;
      }
    }

    const phone = document.getElementById("phone");
    if (phone) {
      let phoneValue = phone.value.trim();
      if (/^[0-9]{10}$/.test(phoneValue)) {
        phoneValue = "+91 " + phoneValue;
        phone.value = phoneValue;
      }
      const phoneRegex = /^\+91\s?[0-9]{10}$/;

      if (!phoneRegex.test(phone.value)) {
        const formGroup = phone.closest(".form-group");
        if (formGroup) formGroup.classList.add("error");
        const errorMsg = phone.nextElementSibling;
        if (errorMsg) errorMsg.textContent = "Enter valid Indian number";
        isValid = false;
      } else {
        const formGroup = phone.closest(".form-group");
        if (formGroup) formGroup.classList.remove("error");
        const errorMsg = phone.nextElementSibling;
        if (errorMsg) errorMsg.textContent = "Please enter a valid phone number";
      }
    }

    return isValid;
  }

  function placeOrderRazorpay() {
    const finalTotalEl = document.getElementById("finalTotal");
    const orderIdEl = document.getElementById("orderId");

    if (!finalTotalEl || !orderIdEl) return;

    const totalAmount = parseFloat(finalTotalEl.textContent.replace(/[₹$]/g, "")) * 100;
    const orderId = "FD" + Date.now().toString().slice(-8);
    orderIdEl.textContent = orderId;

    const options = {
      key: "rzp_test_RS6EdXdKAxfVLe",
      amount: totalAmount,
      currency: "INR",
      name: "Foodie",
      description: "Order Payment",
      handler: function (response) {
        console.log("Payment Success:", response);

        const orderId = "FD" + Date.now().toString().slice(-8);
        const order = {
          id: orderId,
          items: cartData,
          total: parseFloat(finalTotalEl.textContent.replace(/[₹$]/g, "")),
          timestamp: new Date().toISOString(),
          status: "Pending",
          deliveryInfo: {
            fullName: document.getElementById("fullName")?.value || '',
            email: document.getElementById("email")?.value || '',
            phone: document.getElementById("phone")?.value || '',
            address: document.getElementById("address")?.value || '',
            city: document.getElementById("city")?.value || '',
            zipCode: document.getElementById("zipCode")?.value || '',
            notes: document.getElementById("notes")?.value || ''
          }
        };

        const existingOrders = JSON.parse(localStorage.getItem("foodie:orders") || "[]");
        existingOrders.push(order);
        localStorage.setItem("foodie:orders", JSON.stringify(existingOrders));

        const successModal = document.getElementById("successModal");
        if (successModal) successModal.classList.add("active");

        sessionStorage.removeItem("checkoutCart");
        cartData = [];
        saveCartData();
      },
      prefill: {
        name: document.getElementById("fullName")?.value || '',
        email: document.getElementById("email")?.value || '',
        contact: document.getElementById("phone")?.value || '',
      },
      theme: { color: "#F2BD12" },
    };

    if (typeof Razorpay !== 'undefined') {
      const rzp = new Razorpay(options);
      rzp.open();
    } else {
      console.error("Razorpay not loaded");
      alert("Payment system is not available. Please refresh the page.");
    }
  }

  // ===== INITIALIZATION =====
  document.addEventListener("DOMContentLoaded", () => {
    // Show skeletons right away for perceived performance while we read storage
    showSkeletonOrderItems(3);

    // Load cart data (sync) then render after a short delay so skeleton is visible
    loadCartData();

    const emptyCartMessage = document.getElementById("emptyCartMessage");
    const checkoutContent = document.getElementById("checkoutContent");

    // Small artificial delay (150-300ms) to let skeleton animation be perceived
    setTimeout(() => {
      if (cartData.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = "block";
        if (checkoutContent) checkoutContent.style.display = "none";
      } else {
        displayOrderItems();
        calculateTotals();
      }
    }, 220);

    setupEventListeners();
    initCityAutocomplete();
    initPincodeValidation();
  });

  // Export functions to window
  window.checkout = {
    loadCartData,
    saveCartData,
    displayOrderItems,
    calculateTotals,
    setupEventListeners,
    validateForm,
    placeOrderRazorpay,
    handleQuantityChange
  };

  window.initCityAutocomplete = initCityAutocomplete;
  window.initPincodeValidation = initPincodeValidation;
  window.softZoneCheck = softZoneCheck;
})();