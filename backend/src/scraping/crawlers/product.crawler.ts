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

  console.log(`[ProductCrawler] Starting scrape for: ${collectionUrl}`);

  const crawler = new PlaywrightCrawler({
    requestQueue,
    requestHandlerTimeoutSecs: 60,
    maxRequestsPerCrawl: 5,        
    
    launchContext: {
      launchOptions: {
        headless: false, // Keep false for WoB
        args: ["--disable-blink-features=AutomationControlled"],
      },
    },

    async requestHandler({ page, log }) {
      log.info(`[ProductCrawler] Navigating to ${page.url()}`);
      
      try {
        await page.goto(page.url(), { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(3000); // Initial load wait
        
        // Scroll down to trigger lazy loading
        await page.mouse.wheel(0, 3000);
        await page.waitForTimeout(2000);

        // 🔍 DEBUG: Take a look at what we found
        const title = await page.title();
        log.info(`[ProductCrawler] Page Title: ${title}`);

        // 🟢 ROBUST SELECTOR STRATEGY
        // We try to find product cards using multiple common patterns
        const products = await page.evaluate(() => {
          const items = new Map<string, any>();
          
          // Helper to extract clean price
          const getPrice = (text: string) => {
             const match = text.match(/£\s*(\d+(?:\.\d+)?)/);
             return match ? parseFloat(match[1]) : 0;
          };

          // STRATEGY A: Look for standard Product Cards (Grid items)
          const cards = Array.from(document.querySelectorAll('div[class*="ProductCard"], li[class*="Item"], div[class*="grid-item"]'));
          
          cards.forEach(card => {
            const link = card.querySelector('a[href*="/products/"], a[href*="/book/"]');
            if (!link) return;

            const href = link.getAttribute('href') || "";
            const fullUrl = href.startsWith('http') ? href : `https://www.worldofbooks.com${href}`;
            const title = (card.querySelector('h3, .title, [class*="Title"]') as HTMLElement)?.innerText || link.getAttribute('aria-label') || "";
            const author = (card.querySelector('.author, [class*="Author"]') as HTMLElement)?.innerText || null;
            const priceText = (card.querySelector('.price, [class*="Price"]') as HTMLElement)?.innerText || "";
            
            // Image might be lazy loaded
            const img = card.querySelector('img');
            const imageUrl = img?.getAttribute('src') || img?.getAttribute('data-src') || "";

            if (title && fullUrl) {
                items.set(fullUrl, {
                    title: title.trim(),
                    author: author ? author.replace(/^by\s+/i, '').trim() : null,
                    price: getPrice(priceText),
                    currency: "GBP",
                    imageUrl,
                    sourceUrl: fullUrl,
                    sourceId: fullUrl.split("/").pop() || generateId() // Fallback ID
                });
            }
          });

          // STRATEGY B: Fallback - Scan ALL links with /products/ in href
          if (items.size === 0) {
             document.querySelectorAll('a[href*="/products/"]').forEach(a => {
                const href = a.getAttribute('href') || "";
                const fullUrl = href.startsWith('http') ? href : `https://www.worldofbooks.com${href}`;
                const title = (a as HTMLElement).innerText;
                
                // Try to find price in parent
                const parentText = a.parentElement?.innerText || "";
                
                if (title && title.length > 5) { // Filter out short links like "Buy"
                    items.set(fullUrl, {
                        title: title.trim(),
                        author: null,
                        price: getPrice(parentText),
                        currency: "GBP",
                        imageUrl: "",
                        sourceUrl: fullUrl,
                        sourceId: fullUrl.split("/").pop() || ""
                    });
                }
             });
          }

          return Array.from(items.values());
        });

        console.log(`[ProductCrawler] Found ${products.length} items on page.`);
        results.push(...products);

      } catch (e) {
        log.error(`[ProductCrawler] Error on page: ${e}`);
      }
    },
  });

  await crawler.run([collectionUrl]);

  return results;
}