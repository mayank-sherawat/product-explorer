import { PlaywrightCrawler, RequestQueue } from "crawlee";

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export interface ScrapedCollection {
  title: string;
  slug: string;
  sourceUrl: string;
}

export async function scrapeCollections(
  navigationUrl: string,
): Promise<ScrapedCollection[]> {
  const results: ScrapedCollection[] = [];

  // 🟢 FIX: Create unique queue
  const requestQueue = await RequestQueue.open(generateId());

  const crawler = new PlaywrightCrawler({
    requestQueue, // 👈 Use unique queue
    requestHandlerTimeoutSecs: 60,
    maxRequestsPerCrawl: 1,

    launchContext: {
      launchOptions: {
        headless: true,
      },
    },
    async requestHandler({ page }) {
      await page.goto(navigationUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      const collections = await page.$$eval(
        "a[href^='/en-gb/collections/']",
        (links) =>
          links
            .map((link) => {
              const a = link as HTMLAnchorElement;
              const href = a.getAttribute("href") || "";
              const title = a.textContent?.trim() || "";

              if (!href || !title) return null;

              const slug = href.split("/collections/")[1]?.split("?")[0];

              if (!slug) return null;

              return {
                title,
                slug,
                sourceUrl: `https://www.worldofbooks.com${href}`,
              };
            })
            .filter(Boolean),
      );

      results.push(...(collections as ScrapedCollection[]));
    },
  });

  await crawler.run([{ url: navigationUrl }]);

  return results;
}