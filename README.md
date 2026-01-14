# 📚 Product Explorer

A full-stack product exploration platform built to scrape and present live book data from **World of Books**.  
The app allows users to browse from **navigation → collections → products → product details**, with data fetched on demand and cached for performance.

## ✨ Features

- 🔎 Navigation → Collections → Products → Product Details
- 🕷️ Live scraping using **Playwright + Crawlee**
- 🧠 Smart caching (scraped once, reused later)
- 🗄️ PostgreSQL database with Prisma ORM
- ⚡ NestJS backend (REST APIs)
- 🎨 Next.js App Router frontend
- 💅 Tailwind CSS UI
- 📦 Clean folder structure & separation of concerns

---

## 🧱 Tech Stack

### Backend
- Node.js
- NestJS
- Prisma ORM
- PostgreSQL
- Crawlee + Playwright
- TypeScript

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

---
product-explorer/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── navigation/
│   │   ├── collection/
│   │   ├── product/
│   │   ├── scraping/
│   │   └── common/
│   └── main.ts
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── tailwind.config.ts
│
└── README.md

---

## 🧠 How the System Works

1. **Navigation Scraping**
   - Scrapes top-level navigation from World of Books
   - Stores results in the database

2. **Collection Scraping**
   - Fetches collections under a navigation
   - Uses compound unique keys to avoid duplicates

3. **Product Scraping**
   - Scrapes paginated product listings
   - Handles lazy loading and bot protection

4. **Product Detail Scraping**
   - Scraped only when requested
   - Cached after the first fetch

---

## 🚀 Running the Project Locally

### 1️⃣ Clone the repository
```bash
git clone https://github.com/mayank-sherawat/product-explorer.git
cd product-explorer


2️⃣ Backend Setup
cd backend
npm install

Create a .env file in backend/:
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/product_explorer"

Run Prisma migrations:
npx prisma migrate dev
npx prisma generate

Start backend:
npm run start:dev

Backend runs at:
https://product-explorer-5oji.onrender.com


3️⃣ Frontend Setup
cd frontend
npm install
npm run dev

Frontend runs at:
http://localhost:3000


🔗 API Endpoints
Navigation


GET /navigation


POST /navigation/scrape


Collections


GET /collections?navigationId=1


POST /collections/scrape/:navigationId


Products


POST /products/scrape/:collectionSlug


GET /products/:sourceId



⚠️ Scraping Notes


The target website uses lazy loading and bot detection


Headless mode alone is not sufficient


Scrolling and delays are required for stable scraping


Product pagination uses:
?shopify_products[page]=N



Scraping is rate-limited and cached to ensure reliability



📌 Design Decisions


Prisma compound unique keys prevent duplicates


On-demand scraping keeps the database lean


Next.js App Router enables scalable routing


Strict TypeScript improves reliability


Clear separation between:


scraping logic


database layer


API services





🧪 Project Status
✔ Navigation scraping
✔ Collection scraping
✔ Product scraping
✔ Product detail scraping
✔ Database persistence
✔ Frontend integration

🙌 Author
Mayank Sehrawat
B.Tech CSE
Frontend & Full-Stack Developer
GitHub: https://github.com/mayank-sherawat

