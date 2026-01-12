import { PlaywrightCrawler } from "crawlee";

export interface ScrapedProductDetail {
  description: string;
  ratingsAvg: number | null;
  reviewsCount: number | null;
  specs: Record<string, string>;
}

export async function scrapeProductDetail(
  productUrl: string,
): Promise<ScrapedProductDetail> {
  let result: ScrapedProductDetail = {
    description: "",
    ratingsAvg: null,
    reviewsCount: null,
    specs: {},
  };

  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: 1,

    launchContext: {
      launchOptions: {
        headless: false,
        args: ["--disable-blink-features=AutomationControlled"],
      },
    },

    async requestHandler({ page }) {
      await page.goto(productUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      await page.waitForTimeout(4000);

      result.description =
        (await page.$eval(
          "[data-testid='product-description']",
          (el) => el.textContent?.trim() || "",
        ).catch(() => "")) || "";

      const ratingText = await page
        .$eval("[data-testid='rating-value']", (el) =>
          el.textContent?.trim(),
        )
        .catch(() => null);

      result.ratingsAvg = ratingText
        ? parseFloat(ratingText)
        : null;

      const reviewText = await page
        .$eval("[data-testid='review-count']", (el) =>
          el.textContent?.trim(),
        )
        .catch(() => null);

      result.reviewsCount = reviewText
        ? parseInt(reviewText.replace(/\D/g, ""))
        : null;

      const specs = await page.$$eval(
        "table tr",
        (rows) => {
          const obj: Record<string, string> = {};
          for (const row of rows) {
            const cells = row.querySelectorAll("td");
            if (cells.length === 2) {
              obj[cells[0].textContent?.trim() || ""] =
                cells[1].textContent?.trim() || "";
            }
          }
          return obj;
        },
      );

      result.specs = specs;
    },
  });

  await crawler.run([{ url: productUrl }]);

  return result;
}
