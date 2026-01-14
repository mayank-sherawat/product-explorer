import { PlaywrightCrawler, RequestQueue } from "crawlee";
const generateId = () => Math.random().toString(36).substring(2, 15);

export interface ScrapedReview {
  author: string;
  rating: number;
  text: string;
}

export interface ScrapedProductDetail {
  description: string;
  specs: Record<string, string>;
  price: number;
  currency: string;
  rating?: number;
  reviews: ScrapedReview[];
}

export async function scrapeProductDetail(productUrl: string): Promise<ScrapedProductDetail> {
  let result: ScrapedProductDetail = { 
    description: "", 
    specs: {}, 
    price: 0, 
    currency: "GBP", 
    reviews: [] 
  };

  const requestQueue = await RequestQueue.open(generateId());

  const crawler = new PlaywrightCrawler({
    requestQueue,
    maxRequestsPerCrawl: 1,
    launchContext: { launchOptions: { headless: false } },
    async requestHandler({ page }) {
      await page.goto(productUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);
      
      // Scroll to bottom to trigger any lazy loaded reviews
      await page.mouse.wheel(0, 5000); 
      await page.waitForTimeout(1000);

      const priceText = await page.evaluate(() => {
        const el = document.querySelector('[data-testid="price"]') || document.querySelector('.price');
        return el?.textContent || "";
      });
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

      const description = await page.evaluate(() => {
        const el = document.querySelector('[data-testid="product-description"]') || document.querySelector('.about-product-content');
        return el?.textContent?.trim() || "";
      });

      const specs = await page.evaluate(() => {
        const data: Record<string, string> = {};
        document.querySelectorAll("dl").forEach(dl => {
            const dts = dl.querySelectorAll("dt");
            const dds = dl.querySelectorAll("dd");
            dts.forEach((dt, i) => { data[dt.textContent?.trim() || ""] = dds[i]?.textContent?.trim() || ""; });
        });
        if (Object.keys(data).length === 0) {
            document.querySelectorAll("table tr").forEach(row => {
                const cells = row.querySelectorAll("td");
                if (cells.length === 2) data[cells[0].textContent?.trim() || ""] = cells[1].textContent?.trim() || "";
            });
        }
        return data;
      });

      // 🟢 FEATURE: Scrape Reviews
      // Note: Selectors here are best-guess for Feefo/Trustpilot embeds common on WoB. 
      // You may need to adjust if they use a specific widget.
      const reviews = await page.evaluate(() => {
        const items: any[] = [];
        // Generic selector strategy
        const reviewCards = document.querySelectorAll('.review, [data-testid="review-card"], .feefo-review');
        
        reviewCards.forEach(card => {
            const author = card.querySelector('.author, .name, h4')?.textContent?.trim() || "Anonymous";
            const text = card.querySelector('.text, .description, p')?.textContent?.trim() || "";
            // Try to count stars
            const stars = card.querySelectorAll('.star.filled, .rating .fa-star').length;
            
            if (text) {
                items.push({ author, text, rating: stars > 0 ? stars : 5 });
            }
        });
        return items;
      });

      result = { description, specs, price: isNaN(price) ? 0 : price, currency: "GBP", reviews };
    },
  });

  await crawler.run([{ url: productUrl }]);
  return result;
}