import { PlaywrightCrawler, RequestQueue } from "crawlee";
const generateId = () => Math.random().toString(36).substring(2, 15);

export interface ScrapedProductDetail {
  description: string;
  specs: Record<string, string>;
  price: number;
  currency: string;
}

export async function scrapeProductDetail(productUrl: string): Promise<ScrapedProductDetail> {
  let result: ScrapedProductDetail = { description: "", specs: {}, price: 0, currency: "GBP" };

  // 1. Fix Caching: Use unique queue
  const requestQueue = await RequestQueue.open(generateId());

  const crawler = new PlaywrightCrawler({
    requestQueue,
    maxRequestsPerCrawl: 1,
    launchContext: { launchOptions: { headless: false } },
    async requestHandler({ page }) {
      await page.goto(productUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);
      await page.mouse.wheel(0, 3000); // Trigger lazy load

      // 2. Fix Price: Scrape it here so we don't lose it
      const priceText = await page.evaluate(() => {
        const el = document.querySelector('[data-testid="price"]') || document.querySelector('.price');
        return el?.textContent || "";
      });
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

      // 3. Fix Description
      const description = await page.evaluate(() => {
        const el = document.querySelector('[data-testid="product-description"]') || document.querySelector('.about-product-content');
        return el?.textContent?.trim() || "";
      });

      // 4. Fix Specs: Support both DL and TABLE formats
      const specs = await page.evaluate(() => {
        const data: Record<string, string> = {};
        document.querySelectorAll("dl").forEach(dl => {
            const dts = dl.querySelectorAll("dt");
            const dds = dl.querySelectorAll("dd");
            dts.forEach((dt, i) => { data[dt.textContent?.trim() || ""] = dds[i]?.textContent?.trim() || ""; });
        });
        if (Object.keys(data).length === 0) {
            document.querySelectorAll("table tr").forEach(row => {
                const cells = row.querySelectorAll("td");
                if (cells.length === 2) data[cells[0].textContent?.trim() || ""] = cells[1].textContent?.trim() || "";
            });
        }
        return data;
      });

      result = { description, specs, price: isNaN(price) ? 0 : price, currency: "GBP" };
    },
  });

  await crawler.run([{ url: productUrl }]);
  return result;
}