import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { scrapeNavigation } from "../scraping/crawlers/navigation.crawler";

@Injectable()
export class NavigationService {
  constructor(private readonly prisma: PrismaService) {}

  
  async getNavigation() {
   
    const existing = await this.prisma.navigation.findMany();
    if (existing.length > 0) return existing;

    const scraped = await scrapeNavigation();

    const data = scraped.map((item) => ({
      title: item.title,
      slug: item.title.toLowerCase().replace(/\s+/g, "-"),
      sourceUrl: item.url,
    }));

    await this.prisma.navigation.createMany({
      data,
      skipDuplicates: true,
    });

    return this.prisma.navigation.findMany();
  }
}
