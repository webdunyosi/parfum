const API_URL =
  "https://script.google.com/macros/s/AKfycbz9VAb1L1MAKS3jL_Wh1arkzO2KlncmUANYmgbQjwy85c0UwuTBZfrOCQUn0ATM_skfHw/exec"

const loading = document.getElementById("loading")
const productsContainer = document.getElementById("products")
const cartCount = document.getElementById("cart-count")
const searchInput = document.getElementById("search")
let cart = 0
let allProducts = []

async function fetchProducts() {
  try {
    const res = await fetch(API_URL)
    const data = await res.json()
    console.log("Sheet Data:", data)

    // Hide loading
    loading.style.display = "none"

    // Store and render products
    allProducts = data.map((item) => ({
      brand: item["🌸 Brend"] || "Noma'lum brend",
      name: item["💐 Parfyum nomi"] || "Noma'lum nom",
      price: item["🇺🇿 Narx (UZS)"] || "0",
      madein: item["🌍 Made in"] || "-",
      code: item["🔢 Kod"] || "-",
      image: item["📷 Rasm"] || "https://placehold.co/150x150?text=No+Image",
    }))

    renderProducts(allProducts)
  } catch (error) {
    loading.innerHTML =
      "<p class='text-red-500'>Xatolik yuz berdi! API ishlamadi.</p>"
    console.error(error)
  }
}

fetchProducts()

function renderProducts(list) {
  productsContainer.innerHTML = ""
  list.forEach((item) => {
    const card = document.createElement("div")
    card.className =
      "bg-white rounded-xl shadow-md p-4 flex flex-col items-center"

    card.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="w-32 h-32 object-cover rounded-lg mb-4">
        <h2 class="font-bold text-lg">${item.brand}</h2>
        <p class="text-gray-600">${item.name}</p>
        <p class="text-pink-600 font-semibold">${item.price} so'm</p>
        <p class="text-gray-400 text-sm">Made in: ${item.madein}</p>
        <p class="text-gray-400 text-sm">Kod: ${item.code}</p>
        <button class="mt-3 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">Add to Cart</button>
      `

    card.querySelector("button").addEventListener("click", () => {
      cart++
      cartCount.textContent = cart
    })

    productsContainer.appendChild(card)
  })
}

// Live search with debounce
const debounce = (fn, delay = 250) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(null, args), delay)
  }
}

const handleSearch = () => {
  const q = (searchInput?.value || "").toLowerCase().trim()
  if (!q) {
    renderProducts(allProducts)
    return
  }
  const filtered = allProducts.filter((p) => {
    return (
      p.brand.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      String(p.code).toLowerCase().includes(q) ||
      String(p.price).toLowerCase().includes(q) ||
      String(p.madein).toLowerCase().includes(q)
    )
  })
  renderProducts(filtered)
}

if (searchInput) {
  searchInput.addEventListener("input", debounce(handleSearch, 200))
}
