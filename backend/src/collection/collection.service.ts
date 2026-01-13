import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { scrapeCollections } from "../scraping/crawlers/collection.crawler";

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.collection.findMany({
      orderBy: { title: "asc" },
    });
  }

async scrapeAll() {
  try {
    console.log("Starting Dynamic Discovery...");
    const scraped = await scrapeCollections(
      "https://www.worldofbooks.com/en-gb"
    );

    for (const item of scraped) {
      await this.prisma.collection.upsert({
        where: { slug: item.slug },
        update: item,
        create: item,
      });
    }

    console.log("Scraping finished");
  } catch (e) {
    console.error("Scraping failed", e);
  }
}

}