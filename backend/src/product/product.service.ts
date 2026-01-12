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
      await this.prisma.product.upsert({
        where: { sourceId: product.sourceId },
        update: {
          title: product.title,
          author: product.author,
          price: product.price,
          imageUrl: product.imageUrl,
          sourceUrl: product.sourceUrl,
          lastScrapedAt: new Date(),
        },
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

    if (product.detail) {
      return product;
    }

    try {
      const detail = await scrapeProductDetail(product.sourceUrl);

      await this.prisma.productDetail.create({
        data: {
          productId: product.id,
          description: detail.description ?? "",
          specs: detail.specs ?? {},
          ratingsAvg: detail.ratingsAvg ?? null,
          reviewsCount: detail.reviewsCount ?? null,
        },
      });

      return this.prisma.product.findUnique({
        where: { id: product.id },
        include: { detail: true },
      });
    } catch (err) {
      console.error("DETAIL SCRAPE FAILED:", err);
      throw new Error("Failed to scrape product detail");
    }
  }
}
