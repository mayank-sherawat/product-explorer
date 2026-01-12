import { PlaywrightCrawler } from "@crawlee/playwright";

export type NavigationItem = {
  title: string;
  url: string;
};

export async function scrapeNavigation(): Promise<NavigationItem[]> {
  const results: NavigationItem[] = [];

  const crawler = new PlaywrightCrawler({
    async requestHandler({ page }) {
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
