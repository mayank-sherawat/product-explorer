import { PlaywrightCrawler } from "crawlee";

export interface ScrapedProductDetail {
  description: string;
  specs: Record<string, string>;
  price: number;
  currency: string;
}

export async function scrapeProductDetail(
  productUrl: string,
): Promise<ScrapedProductDetail> {

  let result: ScrapedProductDetail = {
    description: "",
    specs: {},
    price: 0,
    currency: "GBP",
  };

  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: 1,
    launchContext: {
      launchOptions: {
        headless: false,
      },
    },

    async requestHandler({ page }) {
      await page.goto(productUrl, {
        waitUntil: "networkidle",
        timeout: 60000,
      });

      await page.waitForTimeout(4000);
      await page.mouse.wheel(0, 3000); // Scroll to trigger lazy load
      await page.waitForTimeout(2000);

      /* ================= PRICE ================= */
      const priceText = await page.evaluate(() => {
        const candidates = [
          '[data-testid="price"]',
          '.price', 
          '#price',
          'span[class*="price"]'
        ];
        for (const sel of candidates) {
          const el = document.querySelector(sel);
          if (el?.textContent) return el.textContent;
        }
        return "";
      });
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

      /* ================= DESCRIPTION ================= */
      const description = await page.evaluate(() => {
        const candidates = [
            '[data-testid="product-description"]',
            '.product-description',
            '#description',
            'div[itemprop="description"]',
            // Fallback: look for the "About this product" section
            '.about-product-content' 
        ];
        for (const sel of candidates) {
            const el = document.querySelector(sel);
            if (el?.textContent) return el.textContent.trim();
        }
        return "";
      });

      /* ================= SPECS (Combined Strategy) ================= */
      const specs = await page.evaluate(() => {
        const data: Record<string, string> = {};

        // Strategy 1: Definition Lists (<dl>)
        document.querySelectorAll("dl").forEach(dl => {
          const dts = dl.querySelectorAll("dt");
          const dds = dl.querySelectorAll("dd");
          dts.forEach((dt, i) => {
            const key = dt.textContent?.trim();
            const value = dds[i]?.textContent?.trim();
            if (key && value) data[key] = value;
          });
        });

        // Strategy 2: Tables (<tr>) - Previous strategy fallback
        if (Object.keys(data).length === 0) {
            document.querySelectorAll("table tr").forEach(row => {
                const cells = row.querySelectorAll("td, th");
                if (cells.length === 2) {
                    const key = cells[0].textContent?.trim();
                    const value = cells[1].textContent?.trim();
                    if (key && value) data[key] = value;
                }
            });
        }

        return data;
      });

      console.log("DETAIL SCRAPED:", {
        price,
        descLen: description.length,
        specsKeys: Object.keys(specs),
      });

      result = {
        description,
        specs,
        price: isNaN(price) ? 0 : price,
        currency: "GBP",
      };
    },
  });

  await crawler.run([{ url: productUrl }]);
  return result;
}