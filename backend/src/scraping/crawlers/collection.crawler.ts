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

  const requestQueue = await RequestQueue.open(generateId());
  await requestQueue.addRequest({ url: startUrl, userData: { type: 'home' } });

  const crawler = new PlaywrightCrawler({
    requestQueue,
    maxRequestsPerCrawl: 20,
    launchContext: {
      launchOptions: {
        headless: true,
      },
    },
    async requestHandler({ page, request, log }) {
      log.info(`Visiting ${request.url} (${request.userData.type})...`);
      
      await page.goto(request.url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(2000);

      // Try to open menu
      try {
        const menuBtn = await page.$('button[aria-label="Menu"], .burger-menu');
        if (menuBtn) {
            await menuBtn.click();
            await page.waitForTimeout(1000);
        }
      } catch (e) { /* Ignore */ }

      // 🟢 STEP 1: Extract links
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
        
        // A. Is it a COLLECTION?
        if (fullUrl.includes('/collections/') || fullUrl.includes('/category/')) {
           const slug = fullUrl.split(/\/collections\/|\/category\//)[1].split('?')[0];
           
           if (slug && link.text.length > 2) {
             const lowerText = link.text.toLowerCase();
             const isGeneric = ['view all', 'see all', 'read more', 'shop now', 'show more'].includes(lowerText);
             
             // 1. Generate a "Clean" title from the slug as a fallback
             // e.g., "crime-fiction" -> "Crime Fiction"
             const fallbackTitle = slug
                .replace(/-/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase());

             // 2. Determine the best title to use
             let finalTitle = isGeneric ? fallbackTitle : link.text;

             // 3. LOGIC: Don't overwrite a good title with a generic one
             if (results.has(slug)) {
                const existing = results.get(slug)!;
                // If the existing title is generic (e.g. generated) and new one is real, update it.
                // But if existing is real, DON'T update it with "View all".
                if (!isGeneric && existing.title === fallbackTitle) {
                    results.set(slug, {
                        title: finalTitle,
                        slug,
                        sourceUrl: fullUrl
                    });
                }
             } else {
                 // New entry
                 results.set(slug, {
                    title: finalTitle,
                    slug,
                    sourceUrl: fullUrl
                 });
             }
           }
        }

        // B. Hub Processing (unchanged)
        if (request.userData.type === 'home' && fullUrl.includes('/pages/')) {
            const isRelevantHub = ['fiction', 'non-fiction', 'children', 'rare'].some(k => fullUrl.toLowerCase().includes(k));
            if (isRelevantHub) {
                log.info(`Found Hub: ${link.text}`);
                await requestQueue.addRequest({ 
                    url: fullUrl, 
                    userData: { type: 'hub' } 
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