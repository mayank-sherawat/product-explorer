import { PlaywrightCrawler, RequestQueue } from "crawlee";

const generateId = () => Math.random().toString(36).substring(2, 15);

export interface ScrapedCollection {
  title: string;
  slug: string;
  sourceUrl: string;
}

export async function scrapeCollections(
  startUrl: string = "https://www.worldofbooks.com/en-gb"
): Promise<ScrapedCollection[]> {
  const results = new Map<string, ScrapedCollection>();

  // 1. Create a queue to manage the "Discovery" process
  // We start with the homepage, but we will add more pages (Hubs) as we find them.
  const requestQueue = await RequestQueue.open(generateId());
  await requestQueue.addRequest({ url: startUrl, userData: { type: 'home' } });

  const crawler = new PlaywrightCrawler({
    requestQueue,
    maxRequestsPerCrawl: 20, // Limit to prevent infinite crawling (adjust as needed)
    launchContext: {
      launchOptions: {
        headless: true, // Set false if you want to watch it work
      },
    },
    async requestHandler({ page, request, log }) {
      log.info(`Visiting ${request.url} (${request.userData.type})...`);
      
      await page.goto(request.url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(2000);

      // 🟢 INTERACTION: Try to open the menu to see hidden categories
      // This is often why scrapers return "0" results
      try {
        const menuBtn = await page.$('button[aria-label="Menu"], .burger-menu');
        if (menuBtn) {
            await menuBtn.click();
            await page.waitForTimeout(1000); // Wait for animation
        }
      } catch (e) { /* Ignore if no menu button */ }

      // 🟢 STEP 1: Extract all links
      const links = await page.$$eval('a', (els) => 
        els.map(el => ({
          href: el.getAttribute('href'),
          text: el.innerText?.trim()
        }))
      );

      // 🟢 STEP 2: Process Links
      for (const link of links) {
        if (!link.href || !link.text) continue;
        const fullUrl = link.href.startsWith('http') ? link.href : `https://www.worldofbooks.com${link.href}`;
        
        // A. Is it a COLLECTION? (The goal)
        if (fullUrl.includes('/collections/') || fullUrl.includes('/category/')) {
           const slug = fullUrl.split(/\/collections\/|\/category\//)[1].split('?')[0];
           if (slug && link.text.length > 2) {
             results.set(slug, {
               title: link.text,
               slug,
               sourceUrl: fullUrl
             });
           }
        }

        // B. Is it a HUB Page? (e.g., /pages/fiction)
        // If we are on the Homepage, we want to "dive deeper" into these Hubs to find more collections.
        if (request.userData.type === 'home' && fullUrl.includes('/pages/')) {
            const isRelevantHub = ['fiction', 'non-fiction', 'children', 'rare'].some(k => fullUrl.toLowerCase().includes(k));
            
            if (isRelevantHub) {
                log.info(`Found Hub: ${link.text} -> Queueing for deep scrape.`);
                await requestQueue.addRequest({ 
                    url: fullUrl, 
                    userData: { type: 'hub' } // Mark as Hub so we don't recurse forever
                });
            }
        }
      }
    },
  });

  await crawler.run();
  
  console.log(`Dynamic Discovery Complete: Found ${results.size} collections.`);
  return Array.from(results.values());
}