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

      try {
        const menuBtn = await page.$('button[aria-label="Menu"], .burger-menu');
        if (menuBtn) {
            await menuBtn.click();
            await page.waitForTimeout(1000);
        }
      } catch (e) { }

      const links = await page.$$eval('a', (els) => 
        els.map(el => ({
          href: el.getAttribute('href'),
          text: el.innerText?.trim()
        }))
      );

      for (const link of links) {
        if (!link.href || !link.text) continue;

        // 🟢 FIX: Ignore generic "View All" buttons
        const lowerText = link.text.toLowerCase();
        if (["view all", "see all", "shop now", "read more", "browse"].includes(lowerText)) {
            continue; 
        }

        const fullUrl = link.href.startsWith('http') ? link.href : `https://www.worldofbooks.com${link.href}`;
        
        if (fullUrl.includes('/collections/') || fullUrl.includes('/category/')) {
           const slug = fullUrl.split(/\/collections\/|\/category\//)[1].split('?')[0];
           
           // Only add if we have a valid slug and title
           if (slug && link.text.length > 2) {
             // 🟢 EXTRA SAFEGUARD: Don't overwrite an existing "Good Title" with a shorter one
             const existing = results.get(slug);
             if (!existing || link.text.length > existing.title.length) {
                results.set(slug, {
                    title: link.text,
                    slug,
                    sourceUrl: fullUrl
                });
             }
           }
        }

        if (request.userData.type === 'home' && fullUrl.includes('/pages/')) {
            const isRelevantHub = ['fiction', 'non-fiction', 'children', 'rare'].some(k => fullUrl.toLowerCase().includes(k));
            if (isRelevantHub) {
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
  return Array.from(results.values());
}