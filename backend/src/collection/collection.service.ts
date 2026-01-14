import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { scrapeCollections } from "../scraping/crawlers/collection.crawler";
// We need to inject ProductService to trigger product scraping
import { ProductService } from "../product/product.service";

@Injectable()
export class CollectionService {
  constructor(
    private prisma: PrismaService,
    private productService: ProductService // Inject this
  ) {}

  async findAll() {
    return this.prisma.collection.findMany({
      orderBy: { title: "asc" },
    });
  }

  // This is the "Big Button" logic
  async scrapeFullSite() {
    console.log("Starting Full Site Update...");

    // 1. Scrape Collections
    const scrapedCollections = await scrapeCollections("https://www.worldofbooks.com/en-gb");

    // 2. Save Collections
    for (const item of scrapedCollections) {
      await this.prisma.collection.upsert({
        where: { slug: item.slug },
        update: { title: item.title, sourceUrl: item.sourceUrl },
        create: { title: item.title, slug: item.slug, sourceUrl: item.sourceUrl },
      });
    }

    // 3. Re-fetch all collections from DB to get IDs
    const allCollections = await this.prisma.collection.findMany();

    // 4. Trigger Product Scraping for each collection
    // Note: Doing this sequentially to avoid being banned.
    for (const collection of allCollections) {
        await this.productService.scrapeProductsForCollection(collection.id, collection.sourceUrl);
        
        // Small pause between collections
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log("Full Site Update Complete.");
    return { message: "Update complete", collectionsCount: allCollections.length };
  }
}