const API_URL =
  "https://script.google.com/macros/s/AKfycbz9VAb1L1MAKS3jL_Wh1arkzO2KlncmUANYmgbQjwy85c0UwuTBZfrOCQUn0ATM_skfHw/exec"

const loading = document.getElementById("loading")
const productsContainer = document.getElementById("products")
const cartCount = document.getElementById("cart-count")
let cart = 0

async function fetchProducts() {
  try {
    const res = await fetch(API_URL)
    const data = await res.json()
    console.log("Sheet Data:", data)

    // Hide loading
    loading.style.display = "none"

    // Render products
    data.forEach((item) => {
      const brand = item["🌸 Brend"] || "Noma'lum brend"
      const name = item["💐 Parfyum nomi"] || "Noma'lum nom"
      const price = item["🇺🇿 Narx (UZS)"] || "0"
      const madein = item["🌍 Made in"] || "-"
      const code = item["🔢 Kod"] || "-"
      const image =
        item["📷 Rasm"] || "https://placehold.co/150x150?text=No+Image"

      const card = document.createElement("div")
      card.className =
        "bg-white rounded-xl shadow-md p-4 flex flex-col items-center"

      card.innerHTML = `
            <img src="${image}" alt="${name}" class="w-32 h-32 object-cover rounded-lg mb-4">
            <h2 class="font-bold text-lg">${brand}</h2>
            <p class="text-gray-600">${name}</p>
            <p class="text-pink-600 font-semibold">${price} so'm</p>
            <p class="text-gray-400 text-sm">Made in: ${madein}</p>
            <p class="text-gray-400 text-sm">Kod: ${code}</p>
            <button class="mt-3 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">Add to Cart</button>
          `

      card.querySelector("button").addEventListener("click", () => {
        cart++
        cartCount.textContent = cart
      })

      productsContainer.appendChild(card)
    })
  } catch (error) {
    loading.innerHTML =
      "<p class='text-red-500'>Xatolik yuz berdi! API ishlamadi.</p>"
    console.error(error)
  }
}

fetchProducts()
