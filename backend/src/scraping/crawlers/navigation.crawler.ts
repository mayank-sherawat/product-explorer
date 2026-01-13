import { PlaywrightCrawler, RequestQueue } from "crawlee";

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export type NavigationItem = {
  title: string;
  url: string;
};

export async function scrapeNavigation(): Promise<NavigationItem[]> {
  const results: NavigationItem[] = [];

  // 🟢 FIX: Create unique queue
  const requestQueue = await RequestQueue.open(generateId());

  const crawler = new PlaywrightCrawler({
    requestQueue, // 👈 Use unique queue
    requestHandlerTimeoutSecs: 60,

    launchContext: {
      launchOptions: {
        headless: true, 
      },
    },

    async requestHandler({ page }) {
      await page.waitForLoadState("domcontentloaded");
      
      const items = await page.$$eval("nav a", (links) =>
        links
          .map((link) => {
            const el = link as HTMLAnchorElement;
            return {
              title: el.innerText.trim(),
              url: el.href,
            };
          })
          .filter((i) => i.title && i.url),
      );

      results.push(...items);
    },
  });

  await crawler.run(["https://www.worldofbooks.com"]);

  return results;
}