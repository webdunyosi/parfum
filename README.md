# 🌸 L'Arôme Parfum — Premium Parfyumeriya Internet Do'koni

🔗 **Jonli Demo (Live Demo)**: [parfum-2xvk.vercel.app](https://parfum-2xvk.vercel.app/)

**L'Arôme Parfum** — bu Google Sheets (Google Jadvallari) ma'lumotlar bazasi asosida ishlaydigan, premium darajadagi, zamonaviy va hashamatli dizaynga ega bir sahifali (Single Page Application) parfyumeriya do'koni.

Ushbu loyiha kichik va o'rta biznes egalari uchun backend (server) yaratmasdan, bevosita Google Sheets orqali tovarlar qoldig'i, narxlari va rasmlarini real vaqt rejimida boshqarish imkonini beradi.

---

## 🌟 Asosiy Imkoniyatlari va Xususiyatlari

1. **Premium & Glassmorphism UI/UX**:
   - Tailwind CSS va maxsus CSS animatsiyalari yordamida yaratilgan hashamatli to'q rangli (luxury dark) dizayn.
   - Oltin rangli (gold) va nafis elementlar, silliq o'tish effektlari (smooth transitions).
   - Mobil qurilmalarga to'liq moslashgan (Fully Responsive) va qulay interfeys.

2. **Google Sheets CMS (Ma'lumotlar Bazasi)**:
   - Tovar ma'lumotlari to'g'ridan-to'g'ri Google Sheets-dan dynamic ravishda olinadi.
   - Yangi tovar qo'shish yoki narxlarni o'zgartirish uchun kodni tahrirlash talab etilmaydi — jadvalni yangilash kifoya!

3. **Kengaytirilgan Qidiruv va Saralash**:
   - **Brendlar filtri**: Mavjud brendlar jadvaldan avtomatik aniqlanib, filtr tugmalari (chips) ko'rinishida hosil bo'ladi.
   - **Aqlli Qidiruv**: Nomi, brendi, kodi yoki ishlab chiqarilgan mamlakati bo'yicha real-vaqtda qidirish (Debouncing texnologiyasi bilan tezlashtirilgan).
   - **Tartiblash**: Narxlar bo'yicha (arzon/qimmat) va nomlar bo'yicha (A-Z) tartiblash.

4. **Savat va Buyurtma Tizimi**:
   - Silliq ochiladigan yon panel (Slide-over Cart Panel).
   - Savat ma'lumotlarini brauzer xotirasida saqlash (`localStorage`).
   - Tovar sonini o'zgartirish va o'chirish funksiyalari.
   - Buyurtmani rasmiylashtirish uchun qulay form (Ism, Telefon, Manzil).
   - Muvaffaqiyatli buyurtmadan so'ng premium modal oynasi.

---

## 📂 Loyiha Tuzilishi

Loyiha juda sodda va toza arxitekturaga ega:

```bash
parfum/
├── index.html          # Bosh sahifa (HTML strukturasi va Tailwind CSS sozlamalari)
├── js/
│   └── script.js       # Dinamik funksionallik, API bilan ishlash va Savat logikasi
└── README.md           # Loyiha qo'llanmasi va hujjatlari
```

---

## 🛠️ Google Sheets-ni sozlash (CMS yaratish)

Loyiha to'liq ishlashi uchun Google Sheets jadvali va Google Apps Script integratsiyasini yo'lga qo'yish lozim.

### 1-Qadam: Jadvalni Yaratish
Yangi Google Sheet yarating va birinchi qatordagi ustun nomlarini (Headers) aynan quyidagicha yozing:

| 🌸 Brend | 💐 Parfyum nomi | 🇺🇿 Narx (UZS) | 🌍 Made in | 🔢 Kod | 📷 Rasm |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Chanel | Bleu de Chanel | 1,800,000 | France | 1001 | https://images.unsplash.com/... |
| Dior | Sauvage | 1,650,000 | France | 1002 | https://images.unsplash.com/... |

> [!IMPORTANT]
> Ustun nomlari (emojilar va harflar) aynan ko'rsatilgandek bo'lishi kerak. Aks holda `script.js` ma'lumotlarni o'qiy olmaydi.

### 2-Qadam: Apps Script Kodini Yozish
1. Google Sheets menyusidan **Extensions > Apps Script** bo'limiga kiring.
2. Ochilgan oynadagi barcha kodni o'chirib, quyidagi kodni joylashtiring:

```javascript
function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    rows.push(obj);
  }
  
  return ContentService.createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Loyihani saqlang (Ctrl + S).

### 3-Qadam: API-ni E'lon Qilish (Deploy)
1. Apps Script oynasining yuqori o'ng burchagidagi **Deploy > New deployment** tugmasini bosing.
2. Select type bo'limidan **Web app** ni tanlang.
3. Sozlamalarni quyidagicha o'rnating:
   - **Description**: `Parfum API`
   - **Execute as**: `Me (sizning emailingiz)`
   - **Who has access**: `Anyone` (Har kim)
4. **Deploy** tugmasini bosing.
5. Agar ruxsat so'ralsa, Google profilingizga kirib, barcha ruxsatlarni tasdiqlang.
6. Berilgan **Web App URL** manzilini nusxalab oling (u `https://script.google.com/...` ko'rinishida bo'ladi).

### 4-Qadam: API URL-ni Kodga Joylashtirish
`js/script.js` faylini oching va 1-qatordagi `API_URL` o'zgaruvchisiga o'zingiz nusxalagan URL-ni qo'ying:

```javascript
const API_URL = "SIZ_NUSXALAGAN_WEB_APP_URL_MANZILI";
```

---

## ⚡ Kelajakda Qo'shish Mumkin Bo'lgan Imkoniyatlar (Roadmap)

Loyihani yanada takomillashtirish va to'liq biznes vositasiga aylantirish uchun quyidagi funksiyalarni integratsiya qilish tavsiya etiladi:

- **Telegram Bot Integratsiyasi**: Buyurtmalar faqat konsolga emas, balki to'g'ridan-to'g'ri administratorning Telegram botiga boradigan qilish.
- **Payme / Click / Uzum Pay**: To'g'ridan-to'g'ri sayt orqali to'lov qilish imkoniyati.
- **Qo'shimcha Filtrlar**: Parfyum hajmi (ml), gender (erkak, ayol, unisex) yoki ifor turi bo'yicha filtrlar qo'shish.
- **Admin Dashboard**: Google Sheets-ga tovar qo'shishni yanada osonlashtiruvchi alohida kirish sahifasi.

---

## 📜 Litsenziya

Ushbu loyiha shaxsiy portfolio va tijorat maqsadlarida foydalanish uchun ochiq hisoblanadi. O'zgartirishlar kiritish va shaxsiy brendingiz ostida ishga tushirishingiz mutlaqo bepul.

---

⭐ **L'Arôme Parfum** — iforlarning hashamatli dunyosini raqamli texnologiyalar bilan birlashtiring!
