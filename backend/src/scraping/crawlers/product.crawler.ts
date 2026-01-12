import { PlaywrightCrawler } from "crawlee";

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

  for (let pageNum = 1; pageNum <= 5; pageNum++) {
    const pageUrl =
      pageNum === 1
        ? collectionUrl
        : `${collectionUrl}?shopify_products[page]=${pageNum}`;

    let pageProducts: ScrapedProduct[] = [];

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: 1,

      launchContext: {
        launchOptions: {
          headless: false,
          args: ["--disable-blink-features=AutomationControlled"],
        },
      },

      browserPoolOptions: {
        useFingerprints: true,
      },

      async requestHandler({ page }) {
        await page.setViewportSize({ width: 1280, height: 800 });

        await page.goto(pageUrl, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });

        await page.waitForTimeout(4000);

        const linkCount = await page.$$eval(
          'a[href*="/en-gb/products/"]',
          (els) => els.length,
        );
        console.log(`PAGE ${pageNum} → LINKS FOUND: ${linkCount}`);

        pageProducts = await page.$$eval(
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

              map.set(href, {
                title,
                author: null,
                price: 0,
                currency: "GBP",
                imageUrl: "",
                sourceUrl: `https://www.worldofbooks.com${href}`,
                sourceId: href.split("-").pop() || href,
              });
            }

            return Array.from(map.values());
          },
        );
      },
    });

    await crawler.run([{ url: pageUrl }]);

    if (pageProducts.length === 0) {
      console.log(`PAGE ${pageNum} → NO PRODUCTS, STOPPING`);
      break;
    }

    console.log(
      `PAGE ${pageNum} → EXTRACTED ${pageProducts.length} PRODUCTS`,
    );

    results.push(...pageProducts);
  }

  return results;
}
