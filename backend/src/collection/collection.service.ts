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

  async scrapeFullSite() {
    console.log("Starting Full Site Update...");

   
    const scrapedCollections = await scrapeCollections("https://www.worldofbooks.com/en-gb");

  
    for (const item of scrapedCollections) {
      await this.prisma.collection.upsert({
        where: { slug: item.slug },
        update: { title: item.title, sourceUrl: item.sourceUrl },
        create: { title: item.title, slug: item.slug, sourceUrl: item.sourceUrl },
      });
    }

    
    const allCollections = await this.prisma.collection.findMany();

    
    for (const collection of allCollections) {
        await this.productService.scrapeProductsForCollection(collection.id, collection.sourceUrl);
        
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log("Full Site Update Complete.");
    return { message: "Update complete", collectionsCount: allCollections.length };
  }
}