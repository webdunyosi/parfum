const API_URL =
  "https://script.google.com/macros/s/AKfycbzeSh_PYB7386AFX1IS3_jveB40EkS9-73rdoKUB9ZygyMpBIHSVbHooqwodHUkp9RuEw/exec";

// DOM Elements
const loading = document.getElementById("loading");
const productsContainer = document.getElementById("products");
const cartCount = document.getElementById("cart-count");
const searchInput = document.getElementById("search");
const searchInputMobile = document.getElementById("search-mobile");
const brandFiltersContainer = document.getElementById("brand-filters");
const sortSelect = document.getElementById("sort-select");

// Cart Elements
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const cartPanel = document.getElementById("cart-panel");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const closeCartBtn = document.getElementById("close-cart");
const cartTriggerBtn = document.getElementById("cart-trigger");

// Checkout Elements
const checkoutTrigger = document.getElementById("checkout-trigger");
const checkoutSection = document.getElementById("checkout-section");
const checkoutForm = document.getElementById("checkout-form");
const backToCartBtn = document.getElementById("back-to-cart");
const cartFooter = document.getElementById("cart-footer");
const cartItemsContainer = document.getElementById("cart-items-container");

// Success Modal Elements
const successModal = document.getElementById("success-modal");
const closeSuccessBtn = document.getElementById("close-success");

// App State
let cart = [];
let allProducts = [];
let activeBrand = "All";
let searchQuery = "";
let sortBy = "default";

// Initialize LocalStorage Cart
if (localStorage.getItem("larome_cart")) {
  try {
    cart = JSON.parse(localStorage.getItem("larome_cart"));
    updateCartBadge();
  } catch (e) {
    cart = [];
  }
}

// Fetch products from Google Sheets
async function fetchProducts() {
  try {
    loading.style.display = "grid";
    productsContainer.innerHTML = "";

    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Tarmoq xatosi yuz berdi");
    const data = await res.json();

    loading.style.display = "none";

    allProducts = data.map((item) => ({
      brand: (item["🌸 Brend"] || "Noma'lum brend").trim(),
      name: (item["💐 Parfyum nomi"] || "Noma'lum nom").trim(),
      price: parseInt(item["🇺🇿 Narx (UZS)"]?.toString().replace(/\D/g, "")) || 0,
      madein: (item["🌍 Made in"] || "-").trim(),
      code: (item["🔢 Kod"] || "0000").toString().trim(),
      image: item["📷 Rasm"] || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
    }));

    // Generate brand filter chips dynamically
    renderBrandFilters();
    // Render products initial state
    filterAndRender();

  } catch (error) {
    loading.innerHTML = `
      <div class="col-span-full text-center py-12 space-y-4">
        <span class="text-5xl block">⚠️</span>
        <h3 class="text-xl font-serif text-red-400">Ma'lumot yuklashda xatolik!</h3>
        <p class="text-gray-400 text-sm max-w-md mx-auto">Google Sheets bilan bog'lanish imkoni bo'lmadi. Apps Script sozlamalarini tekshiring.</p>
        <button onclick="fetchProducts()" class="mt-4 px-6 py-2 rounded-full border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-bg transition duration-300 text-xs uppercase font-bold tracking-wider">
          Qayta urinish
        </button>
      </div>
    `;
    console.error("API Error:", error);
  }
}

// Render dynamic Brand Filter chips
function renderBrandFilters() {
  // Extract unique brands
  const uniqueBrands = [...new Set(allProducts.map((p) => p.brand))].sort();
  const brands = ["All", ...uniqueBrands];

  brandFiltersContainer.innerHTML = "";

  brands.forEach((brand) => {
    const chip = document.createElement("button");
    chip.textContent = brand === "All" ? "Barchasi" : brand;
    
    // Set classes based on active state
    if (brand === activeBrand) {
      chip.className = "px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border bg-luxury-gold text-luxury-bg border-luxury-gold shadow-md shadow-luxury-gold/10";
    } else {
      chip.className = "px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 border glass text-gray-300 border-white/5 hover:border-luxury-gold/30 hover:text-luxury-gold";
    }

    chip.addEventListener("click", () => {
      activeBrand = brand;
      renderBrandFilters();
      filterAndRender();
    });

    brandFiltersContainer.appendChild(chip);
  });
}

// Filter and Sort logic
function filterAndRender() {
  let filtered = [...allProducts];

  // 1. Filter by Brand
  if (activeBrand !== "All") {
    filtered = filtered.filter((p) => p.brand === activeBrand);
  }

  // 2. Filter by Search Query
  if (searchQuery) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((p) => {
      return (
        p.brand.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.madein.toLowerCase().includes(query)
      );
    });
  }

  // 3. Sorting
  if (sortBy === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name-asc") {
    filtered.sort((a, b) => (a.brand + a.name).localeCompare(b.brand + b.name));
  }

  renderProducts(filtered);
}

// Render dynamic luxury cards
function renderProducts(list) {
  productsContainer.innerHTML = "";

  if (list.length === 0) {
    productsContainer.innerHTML = `
      <div class="col-span-full text-center py-20 space-y-4">
        <span class="text-5xl block opacity-40">🍃</span>
        <h3 class="text-xl font-serif text-gray-400">Hech qanday parfyum topilmadi</h3>
        <p class="text-zinc-500 text-sm">Qidiruv so'rovingizni yoki brend tanlovini o'zgartirib ko'ring.</p>
      </div>
    `;
    return;
  }

  list.forEach((item) => {
    const card = document.createElement("div");
    card.className = "glass rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:bg-luxury-cardHover border border-white/5 transition-all duration-500 flex flex-col group relative overflow-hidden";
    
    // Format price in clean sum
    const formattedPrice = item.price > 0 ? `${item.price.toLocaleString()} so'm` : "Kelishiladi";

    card.innerHTML = `
      <!-- Made in Badge (Glass pill top right) -->
      <span class="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 py-0.5 px-2 sm:py-1 sm:px-3 rounded-full text-[8px] sm:text-[10px] uppercase font-bold tracking-wider glass text-luxury-accent border-white/5 backdrop-blur-md">
        🌍 ${item.madein}
      </span>

      <!-- Card Image Frame -->
      <div class="aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-zinc-950/60 mb-2 sm:mb-4 relative flex items-center justify-center border border-white/5">
        <img 
          src="${item.image}" 
          alt="${item.name}" 
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1541643600914-78b084683601?w=400';"
        >
        <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      <!-- Perfume Brand -->
      <span class="text-[9px] sm:text-xs font-serif text-luxury-gold font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-0.5 sm:mb-1 block">
        ${item.brand}
      </span>

      <!-- Perfume Name -->
      <h3 class="text-white font-bold text-xs sm:text-lg mb-1 leading-snug tracking-wide group-hover:text-luxury-accent transition duration-300 truncate">
        ${item.name}
      </h3>

      <!-- Code & Details -->
      <div class="flex items-center justify-between text-[9px] sm:text-xs text-luxury-textMuted mb-2 sm:mb-4 border-b border-white/5 pb-2 sm:pb-3">
        <span>Kod: <strong class="text-gray-300 font-medium">${item.code}</strong></span>
      </div>

      <!-- Price and Buy Action Row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-auto pt-2 border-t border-white/5">
        <div class="flex flex-col">
          <span class="text-[9px] sm:text-[10px] uppercase text-zinc-500 tracking-wider">Narxi</span>
          <span class="text-luxury-accent font-bold text-xs sm:text-base font-serif tracking-wide">${formattedPrice}</span>
        </div>

        <button class="bg-white/5 hover:bg-gradient-to-r hover:from-luxury-gold hover:to-luxury-accent hover:text-luxury-bg border border-white/10 hover:border-transparent text-white font-bold text-[9px] sm:text-[10px] uppercase tracking-widest px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all duration-500 flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-black/20 w-full sm:w-auto">
          <span>Savatga</span>
          <span class="text-[12px] sm:text-[14px]">🛒</span>
        </button>
      </div>
    `;

    card.querySelector("button").addEventListener("click", () => {
      addToCart(item);
    });

    productsContainer.appendChild(card);
  });
}

// Add Item to Cart
function addToCart(product) {
  const existing = cart.find((item) => item.code === product.code);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  // Save to localStorage
  localStorage.setItem("larome_cart", JSON.stringify(cart));
  
  // Dynamic badge bounce animation
  triggerCartBadgeAnimation();
  updateCartBadge();
  renderCart();
}

// Bounce Cart Icon on addition
function triggerCartBadgeAnimation() {
  const trigger = document.getElementById("cart-trigger");
  trigger.classList.add("scale-110", "rotate-12", "border-luxury-gold/50");
  cartCount.classList.add("scale-125");
  
  setTimeout(() => {
    trigger.classList.remove("scale-110", "rotate-12", "border-luxury-gold/50");
    cartCount.classList.remove("scale-125");
  }, 300);
}

// Update Nav Cart Count
function updateCartBadge() {
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalQty;
}

// Render Slide-over Cart Items
function renderCart() {
  cartItems.innerHTML = "";
  
  // Disable checkout if empty
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="text-center py-20 space-y-3">
        <span class="text-6xl block grayscale opacity-30">🛍️</span>
        <p class="text-luxury-textMuted text-sm font-light">Savatchangiz hozircha bo'sh</p>
      </div>
    `;
    cartTotal.textContent = "0 so'm";
    checkoutTrigger.disabled = true;
    
    // If we're in checkout section and cart gets emptied, reset back to cart view
    checkoutSection.classList.add("hidden");
    cartItems.classList.remove("hidden");
    cartFooter.classList.remove("hidden");
    return;
  }

  checkoutTrigger.disabled = false;
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const row = document.createElement("div");
    row.className = "flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5 items-center relative overflow-hidden group";

    row.innerHTML = `
      <!-- Product Image -->
      <img src="${item.image}" class="w-16 h-16 rounded-lg object-cover bg-zinc-900 border border-white/5" alt="${item.name}">
      
      <!-- Info Details -->
      <div class="flex-1 min-w-0">
        <span class="text-[9px] uppercase tracking-widest text-luxury-gold block font-serif font-semibold">${item.brand}</span>
        <h4 class="text-white font-semibold text-sm truncate leading-tight mb-1">${item.name}</h4>
        <span class="text-luxury-accent font-bold font-serif text-sm block">${(item.price * item.quantity).toLocaleString()} so'm</span>
      </div>

      <!-- Action Stepper & Delete -->
      <div class="flex flex-col items-end gap-2.5">
        <!-- Delete Button -->
        <button class="text-gray-400 hover:text-red-400 transition-colors duration-300 outline-none p-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h14" />
          </svg>
        </button>
        
        <!-- Quantity Controls -->
        <div class="flex items-center gap-1.5 glass rounded-lg p-0.5 border border-white/5">
          <button class="w-5 h-5 flex items-center justify-center text-xs font-semibold rounded bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition duration-300">-</button>
          <span class="w-5 text-center text-xs text-white font-bold">${item.quantity}</span>
          <button class="w-5 h-5 flex items-center justify-center text-xs font-semibold rounded bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition duration-300">+</button>
        </div>
      </div>
    `;

    // ➖ Quantity Decrement
    row.querySelectorAll("button")[1].addEventListener("click", () => {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        cart.splice(index, 1);
      }
      saveAndSyncCart();
    });

    // ➕ Quantity Increment
    row.querySelectorAll("button")[2].addEventListener("click", () => {
      item.quantity++;
      saveAndSyncCart();
    });

    // 🗑️ Delete Row
    row.querySelectorAll("button")[0].addEventListener("click", () => {
      cart.splice(index, 1);
      saveAndSyncCart();
    });

    cartItems.appendChild(row);
  });

  cartTotal.textContent = `${total.toLocaleString()} so'm`;
}

// Save, sync badge, and render
function saveAndSyncCart() {
  localStorage.setItem("larome_cart", JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

// Cart Sidebar Actions (Open/Close Slide-over)
function openCart() {
  cartSidebar.classList.remove("hidden");
  cartSidebar.classList.add("flex");
  document.body.classList.add("overflow-hidden");

  // Reset checkout section inside cart on open
  checkoutSection.classList.add("hidden");
  cartItems.classList.remove("hidden");
  cartFooter.classList.remove("hidden");

  // Trigger CSS animations after layout paint
  setTimeout(() => {
    cartOverlay.classList.remove("opacity-0");
    cartOverlay.classList.add("opacity-100");
    cartPanel.classList.remove("translate-x-full");
    cartPanel.classList.add("translate-x-0");
  }, 10);
}

function closeCart() {
  cartOverlay.classList.remove("opacity-100");
  cartOverlay.classList.add("opacity-0");
  cartPanel.classList.remove("translate-x-0");
  cartPanel.classList.add("translate-x-full");

  // Wait for slide-out transition to complete
  setTimeout(() => {
    cartSidebar.classList.add("hidden");
    cartSidebar.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
  }, 500);
}

// Debounce for inputs
const debounce = (fn, delay = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(null, args), delay);
  };
};

// Handle Search Sync
const handleSearch = (e) => {
  const query = e.target.value;
  searchQuery = query;
  
  // Sync desktop and mobile search inputs
  if (e.target === searchInput && searchInputMobile) {
    searchInputMobile.value = query;
  } else if (e.target === searchInputMobile && searchInput) {
    searchInput.value = query;
  }
  
  filterAndRender();
};

// Event Listeners for slide-over triggers
cartTriggerBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// Checkout navigation inside Cart panel
checkoutTrigger.addEventListener("click", () => {
  cartItems.classList.add("hidden");
  cartFooter.classList.add("hidden");
  checkoutSection.classList.remove("hidden");
  
  // Smooth scroll to top of sidebar container
  cartItemsContainer.scrollTop = 0;
});

backToCartBtn.addEventListener("click", () => {
  checkoutSection.classList.add("hidden");
  cartItems.classList.remove("hidden");
  cartFooter.classList.remove("hidden");
});

// Checkout Form Submission (Simulates order sending)
checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("client-name").value.trim();
  const phone = document.getElementById("client-phone").value.trim();
  const address = document.getElementById("client-address").value.trim();

  // Create loading button visual feedback
  const submitBtn = checkoutForm.querySelector("button[type='submit']");
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-luxury-bg inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Yuborilmoqda...
  `;

  // Simulating sending data to server (Apps Script or Telegram Bot)
  setTimeout(() => {
    // Reset submit button state
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    // Log the order to console (for development/validation)
    console.log("Order Placed Successfully:", {
      client: { name, phone, address },
      items: cart,
      totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    });

    // Clear cart in state, localStorage & render
    cart = [];
    saveAndSyncCart();

    // Close the cart sidebar pane
    closeCart();

    // Reset Checkout form
    checkoutForm.reset();

    // Open Success Modal
    setTimeout(() => {
      successModal.classList.remove("hidden");
      successModal.classList.add("flex");
    }, 450);

  }, 1200);
});

// Close Success Modal
closeSuccessBtn.addEventListener("click", () => {
  successModal.classList.add("hidden");
  successModal.classList.remove("flex");
});

// Live inputs & search bindings
if (searchInput) {
  searchInput.addEventListener("input", debounce(handleSearch, 150));
}
if (searchInputMobile) {
  searchInputMobile.addEventListener("input", debounce(handleSearch, 150));
}

// Sorting bindings
sortSelect.addEventListener("change", (e) => {
  sortBy = e.target.value;
  filterAndRender();
});

// Run application
fetchProducts();
renderCart();
