import { PlaywrightCrawler, RequestQueue } from "crawlee";

// Helper to generate a random ID (Replaces uuid)
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

  // 🟢 FIX: Manually create a unique queue to force a fresh scrape
  const requestQueue = await RequestQueue.open(generateId());

  const crawler = new PlaywrightCrawler({
    requestQueue, // 👈 Pass the unique queue here
    requestHandlerTimeoutSecs: 60,
    maxRequestsPerCrawl: 50,
    
    launchContext: {
      launchOptions: {
        headless: false,
        args: ["--disable-blink-features=AutomationControlled"],
      },
    },

    async requestHandler({ page }) {
      await page.setViewportSize({ width: 1280, height: 800 });

      // Wait for load
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);

      // Scrape logic
      const pageProducts = await page.$$eval(
        'a[href*="/en-gb/products/"]',
        (links) => {
          const map = new Map<string, any>();

          for (const el of links) {
            const a = el as HTMLAnchorElement;
            const href = a.getAttribute("href");
            if (!href) continue;

            const title =
              a.getAttribute("aria-label") ||
              a.textContent?.trim() ||
              "";

            if (!title) continue;

            // Attempt to find price
            let price = 0;
            const card = a.closest('div, li'); 
            if (card) {
               const text = card.textContent || "";
               const match = text.match(/£\s*(\d+(?:\.\d+)?)/);
               if (match) {
                  price = parseFloat(match[1]);
               }
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
      
      console.log(`EXTRACTED ${pageProducts.length} PRODUCTS from ${page.url()}`);
      results.push(...pageProducts);
    },
  });

  // Add URLs to our unique queue
  const urlsToCrawl = [];
  for (let pageNum = 1; pageNum <= 5; pageNum++) {
    urlsToCrawl.push(
      pageNum === 1
        ? collectionUrl
        : `${collectionUrl}?shopify_products[page]=${pageNum}`
    );
  }
  await crawler.run(urlsToCrawl);

  return results;
}