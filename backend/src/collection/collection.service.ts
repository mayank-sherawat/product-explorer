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
    console.log("Starting Dynamic Discovery (No Hardcoding)...");

    // 🟢 We just point it to the root. The crawler will find the rest.
    const scraped = await scrapeCollections("https://www.worldofbooks.com/en-gb");

    if (scraped.length === 0) {
        console.warn("Warning: No collections found. Check internet or crawler selector logic.");
    }

    // Save whatever we found
    for (const item of scraped) {
      await this.prisma.collection.upsert({
        where: { slug: item.slug },
        update: {
          title: item.title,
          sourceUrl: item.sourceUrl,
          // Update timestamp only if we were scraping details (optional)
        },
        create: {
          title: item.title,
          slug: item.slug,
          sourceUrl: item.sourceUrl,
        },
      });
    }

    return this.findAll();
  }
}