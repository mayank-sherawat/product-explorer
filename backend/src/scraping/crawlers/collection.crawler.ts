import { PlaywrightCrawler, RequestQueue } from "crawlee";

const generateId = () => Math.random().toString(36).substring(2, 15);

export async function scrapeCollections(
  startUrl: string = "https://www.worldofbooks.com/en-gb"
) {
  const results = new Map();

  const requestQueue = await RequestQueue.open(generateId());
  await requestQueue.addRequest({ url: startUrl, userData: { type: "home" } });

  const crawler = new PlaywrightCrawler({
    requestQueue,
    maxRequestsPerCrawl: 20,

launchContext: {
  launchOptions: {
    headless: true,
    executablePath: 0
      ? undefined
      : "/usr/bin/google-chrome",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
    ],
  },
},

    async requestHandler({ page, request, log }) {
      log.info(`Visiting ${request.url}`);

      await page.setExtraHTTPHeaders({
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      });

      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);

      // Menu open (safe)
      try {
        const menuBtn = await page.$('button[aria-label="Menu"], .burger-menu');
        if (menuBtn) {
          await menuBtn.click();
          await page.waitForTimeout(1000);
        }
      } catch {}

      const links = await page.$$eval("a", (els) =>
        els.map((el) => ({
          href: el.getAttribute("href"),
          text: el.innerText?.trim(),
        }))
      );

      for (const link of links) {
        if (!link.href || !link.text) continue;

        if (["view all", "see all", "shop now"].includes(link.text.toLowerCase()))
          continue;

        const fullUrl = link.href.startsWith("http")
          ? link.href
          : `https://www.worldofbooks.com${link.href}`;

        if (fullUrl.includes("/collections/") || fullUrl.includes("/category/")) {
          const slug = fullUrl.split(/\/collections\/|\/category\//)[1]?.split("?")[0];
          if (!slug) continue;

          const existing = results.get(slug);
          if (!existing || link.text.length > existing.title.length) {
            results.set(slug, {
              title: link.text,
              slug,
              sourceUrl: fullUrl,
            });
          }
        }
      }
    },
  });

  await crawler.run();
  return [...results.values()];
}