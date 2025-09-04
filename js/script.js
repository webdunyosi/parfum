const API_URL =
  "https://script.google.com/macros/s/AKfycbz9VAb1L1MAKS3jL_Wh1arkzO2KlncmUANYmgbQjwy85c0UwuTBZfrOCQUn0ATM_skfHw/exec";

const loading = document.getElementById("loading");
const productsContainer = document.getElementById("products");
const cartCount = document.getElementById("cart-count");
const searchInput = document.getElementById("search");

// Cart elements
const cartModal = document.getElementById("cart-modal");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const closeCartBtn = document.getElementById("close-cart");
const cartButton = cartCount.parentElement;

let cart = [];
let allProducts = [];

// Fetch products
async function fetchProducts() {
  try {
    const res = await axios.get(API_URL);
    const data = res.data;

    loading.style.display = "none";

    allProducts = data.map((item) => ({
      brand: item["🌸 Brend"] || "Noma'lum brend",
      name: item["💐 Parfyum nomi"] || "Noma'lum nom",
      price:
        parseInt(item["🇺🇿 Narx (UZS)"]?.toString().replace(/\D/g, "")) || 0,
      madein: item["🌍 Made in"] || "-",
      code: item["🔢 Kod"] || Math.random(),
      image:
        item["📷 Rasm"] || "https://placehold.co/150x150?text=No+Image",
    }));

    renderProducts(allProducts);
  } catch (error) {
    loading.innerHTML = "<p class='text-red-500'>Xatolik yuz berdi!</p>";
    console.error("API Error:", error);
  }
}

fetchProducts();

// Render products
function renderProducts(list) {
  productsContainer.innerHTML = "";
  list.forEach((item) => {
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-xl shadow-md p-4 flex flex-col items-center";

    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="w-32 h-32 object-cover rounded-lg mb-4">
      <h2 class="font-bold text-lg">${item.brand}</h2>
      <p class="text-gray-600">${item.name}</p>
      <p class="text-pink-600 font-semibold">${item.price.toLocaleString()} so'm</p>
      <p class="text-gray-400 text-sm">Made in: ${item.madein}</p>
      <p class="text-gray-400 text-sm">Kod: ${item.code}</p>
      <button class="mt-3 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">Add to Cart</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      addToCart(item);
    });

    productsContainer.appendChild(card);
  });
}

// Add to cart
function addToCart(product) {
  const existing = cart.find((item) => item.code === product.code);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
  renderCart();
}

// Render cart
function renderCart() {
  cartItems.innerHTML = "";
  if (cart.length === 0) {
    cartItems.innerHTML = "<p class='text-gray-500'>Savatcha bo'sh</p>";
    cartTotal.textContent = "Jami: 0 so'm";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const row = document.createElement("div");
    row.className = "flex items-center gap-3 border-b pb-2";

    row.innerHTML = `
      <img src="${item.image}" class="w-14 h-14 rounded object-cover">
      <div class="flex-1">
        <p class="font-semibold">${item.brand}</p>
        <p class="text-sm text-gray-500">${item.name}</p>
        <p class="text-pink-600">${(item.price * item.quantity).toLocaleString()} so'm</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">-</button>
        <span class="min-w-[20px] text-center">${item.quantity}</span>
        <button class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">+</button>
      </div>
      <button class="text-red-500 hover:text-red-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h14" />
        </svg>
      </button>
    `;

    // ➖
    row.querySelectorAll("button")[0].addEventListener("click", () => {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        cart.splice(index, 1);
      }
      cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
      renderCart();
    });

    // ➕
    row.querySelectorAll("button")[1].addEventListener("click", () => {
      item.quantity++;
      cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
      renderCart();
    });

    // 🗑️ delete
    row.querySelectorAll("button")[2].addEventListener("click", () => {
      cart.splice(index, 1);
      cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
      renderCart();
    });

    cartItems.appendChild(row);
  });

  cartTotal.textContent = `Jami: ${total.toLocaleString()} so'm`;
}

// Modal open/close
cartButton.addEventListener("click", () => {
  cartModal.classList.remove("hidden");
  cartModal.classList.add("flex");
  document.body.classList.add("overflow-hidden"); // disable body scroll
});

closeCartBtn.addEventListener("click", () => {
  cartModal.classList.add("hidden");
  cartModal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden"); // enable body scroll
});

// Live search with debounce
const debounce = (fn, delay = 250) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(null, args), delay);
  };
};

const handleSearch = () => {
  const q = (searchInput?.value || "").toLowerCase().trim();
  if (!q) {
    renderProducts(allProducts);
    return;
  }
  const filtered = allProducts.filter((p) => {
    return (
      p.brand.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      String(p.code).toLowerCase().includes(q) ||
      String(p.price).toLowerCase().includes(q) ||
      String(p.madein).toLowerCase().includes(q)
    );
  });
  renderProducts(filtered);
};

if (searchInput) {
  searchInput.addEventListener("input", debounce(handleSearch, 200));
}
