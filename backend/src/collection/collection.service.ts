import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { scrapeCollections } from "../scraping/crawlers/collection.crawler";

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  async findByNavigation(navigationId: number) {
    return this.prisma.collection.findMany({
      where: { navigationId },
      orderBy: { title: "asc" },
    });
  }

  async scrapeByNavigation(navigationId: number) {
    const navigation = await this.prisma.navigation.findUnique({
      where: { id: navigationId },
    });

    if (!navigation) {
      throw new Error("Navigation not found");
    }

    const scraped = await scrapeCollections(navigation.sourceUrl);

    for (const item of scraped) {
      await this.prisma.collection.upsert({
        where: {
          slug_navigationId: {
            slug: item.slug,
            navigationId,
          },
        },
        update: {
          title: item.title,
          sourceUrl: item.sourceUrl,
          lastScrapedAt: new Date(),
        },
        create: {
          title: item.title,
          slug: item.slug,
          sourceUrl: item.sourceUrl,
          navigationId,
        },
      });
    }

    return this.findByNavigation(navigationId);
  }
}
