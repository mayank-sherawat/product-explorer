import { PlaywrightCrawler, RequestQueue } from "crawlee";

const generateId = () => Math.random().toString(36).substring(2, 15);

export interface ScrapedProduct {
  title: string;
  author: string | null;
  price: number;
  currency: string;
  imageUrl: string;
  sourceUrl: string;
  sourceId: string;
}

export async function scrapeProductsFromCollection(
  collectionUrl: string,
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];
  const requestQueue = await RequestQueue.open(generateId());

  const crawler = new PlaywrightCrawler({
    requestQueue,
    requestHandlerTimeoutSecs: 60, // Give it time to load
    maxRequestsPerCrawl: 5,        
    
    launchContext: {
      launchOptions: {
        // 🟢 CRITICAL FIX: Must be FALSE. WoB hides products from headless bots.
        headless: false, 
        args: ["--disable-blink-features=AutomationControlled"],
      },
    },

    async requestHandler({ page }) {
      console.log(`Visiting: ${page.url()}`);
      
      // 1. Navigate and wait for network to be (mostly) idle
      await page.goto(page.url(), { waitUntil: "domcontentloaded", timeout: 30000 });

      // 🟢 2. SMART WAIT: Wait until product links are actually visible
      try {
        console.log("Waiting for products to render...");
        await page.waitForSelector('a[href*="/products/"]', { timeout: 10000 });
      } catch (e) {
        console.warn("⚠️ Timeout waiting for selectors. The page might be empty or a captcha.");
      }

      // Small extra pause for images/prices to pop in
      await page.waitForTimeout(2000);

      // 3. Extract Products
      const pageProducts = await page.$$eval(
        'a[href*="/products/"]', 
        (links) => {
          const map = new Map<string, any>();
          for (const el of links) {
            const a = el as HTMLAnchorElement;
            const href = a.getAttribute("href");
            const title = a.innerText?.trim() || a.getAttribute("aria-label");
            
            if (!href || !title) continue;

            // Extract Price
            let price = 0;
            const card = a.closest('div, li'); // Find parent container
            if (card) {
               const text = card.textContent || "";
               const match = text.match(/£\s*(\d+(?:\.\d+)?)/);
               if (match) price = parseFloat(match[1]);
            }

            map.set(href, {
              title,
              author: null,
              price,
              currency: "GBP",
              imageUrl: "",
              sourceUrl: `https://www.worldofbooks.com${href}`,
              sourceId: href.split("-").pop() || href,
            });
          }
          return Array.from(map.values());
        },
      );
      
      console.log(`✅ Scraper found ${pageProducts.length} items on ${page.url()}`);
      results.push(...pageProducts);
    },
  });

  // Run on the collection URL
  await crawler.run([collectionUrl]);

  return results;
}