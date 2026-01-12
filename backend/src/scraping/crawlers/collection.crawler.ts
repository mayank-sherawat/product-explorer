import { PlaywrightCrawler } from "crawlee";

export interface ScrapedCollection {
  title: string;
  slug: string;
  sourceUrl: string;
}

export async function scrapeCollections(
  navigationUrl: string,
): Promise<ScrapedCollection[]> {
  const results: ScrapedCollection[] = [];

  const crawler = new PlaywrightCrawler({
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
