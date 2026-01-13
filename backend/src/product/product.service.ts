import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { scrapeProductsFromCollection } from "../scraping/crawlers/product.crawler";
import { scrapeProductDetail } from "../scraping/crawlers/product-detail.crawler";

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async scrapeCollectionProducts(slug: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { slug },
    });

    if (!collection) {
      throw new Error("Collection not found");
    }

    const products = await scrapeProductsFromCollection(
      collection.sourceUrl,
    );

    for (const product of products) {
      // Logic: Only update price if the scraper found one
      const updateData: any = {
        title: product.title,
        author: product.author,
        imageUrl: product.imageUrl,
        sourceUrl: product.sourceUrl,
        lastScrapedAt: new Date(),
      };

      if (product.price > 0) {
        updateData.price = product.price;
      }

      await this.prisma.product.upsert({
        where: { sourceId: product.sourceId },
        update: updateData,
        create: {
          sourceId: product.sourceId,
          title: product.title,
          author: product.author,
          price: product.price,
          currency: product.currency,
          imageUrl: product.imageUrl,
          sourceUrl: product.sourceUrl,
          collectionId: collection.id,
        },
      });
    }

    return this.prisma.product.findMany({
      where: { collectionId: collection.id },
    });
  }

  async getProductDetail(sourceId: string) {
    const product = await this.prisma.product.findUnique({
      where: { sourceId },
      include: { detail: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // CHECK: Only return cached data if it actually has a description
    if (product.detail && product.detail.description.length > 5) {
      return product;
    }

    console.log(`Scraping details for ${sourceId}...`);

    try {
      const detail = await scrapeProductDetail(product.sourceUrl);

      // 🛑 FIX: Only update price if the detail scraper actually found one!
      if (detail.price > 0) {
        await this.prisma.product.update({
          where: { id: product.id },
          data: {
            price: detail.price,
            currency: detail.currency,
          },
        });
      }

      await this.prisma.productDetail.upsert({
        where: { productId: product.id },
        update: {
          description: detail.description ?? "",
          specs: detail.specs ?? {},
        },
        create: {
          productId: product.id,
          description: detail.description ?? "",
          specs: detail.specs ?? {},
          ratingsAvg: null,
          reviewsCount: null,
        },
      });

      return this.prisma.product.findUnique({
        where: { id: product.id },
        include: { detail: true },
      });
    } catch (err) {
      console.error("DETAIL SCRAPE FAILED:", err);
      return product;
    }
  }
}