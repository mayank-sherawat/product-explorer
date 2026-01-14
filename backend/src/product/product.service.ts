import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { scrapeProductsFromCollection } from "../scraping/crawlers/product.crawler";
import { scrapeProductDetail } from "../scraping/crawlers/product-detail.crawler";

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  // 🟢 READ-ONLY: Get Products from DB
  async getProductsByCollection(slug: string, page: number = 1, limit: number = 20) {
    const collection = await this.prisma.collection.findFirst({
      where: { slug },
    });

    if (!collection) {
      throw new NotFoundException(`Collection not found: ${slug}`);
    }

    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { collectionId: collection.id },
        orderBy: { id: 'asc' },
        take: limit,
        skip: skip,
      }),
      this.prisma.product.count({ where: { collectionId: collection.id } })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  // 🟢 READ-ONLY: Get Detail from DB
  async getProductBySourceId(sourceId: string) {
    const product = await this.prisma.product.findUnique({
      where: { sourceId },
      include: { detail: true, reviews: true },
    });

    if (!product) throw new NotFoundException("Product not found");

    const relatedProducts = await this.prisma.product.findMany({
        where: { 
            collectionId: product.collectionId,
            id: { not: product.id }
        },
        take: 4,
    });

    return { ...product, relatedProducts };
  }

  // 🔴 WRITE: Scrape Products for a Collection
  async scrapeProductsForCollection(collectionId: number, url: string) {
    console.log(`[ProductService] Starting scrape for Collection ID: ${collectionId} | URL: ${url}`);
    
    try {
      const products = await scrapeProductsFromCollection(url);
      
      if (products.length > 0) {
        // Update Timestamp
        await this.prisma.collection.update({
             where: { id: collectionId },
             data: { lastScrapedAt: new Date() }
        });

        let savedCount = 0;
        for (const product of products) {
          // Validate product has ID
          if (!product.sourceId || product.sourceId.length < 2) continue;

          const updateData: any = {
            title: product.title,
            author: product.author,
            imageUrl: product.imageUrl,
            sourceUrl: product.sourceUrl,
            lastScrapedAt: new Date(),
          };

          if (product.price > 0) updateData.price = product.price;

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
              collectionId: collectionId,
            },
          });
          savedCount++;
        }
        console.log(`[ProductService] ✅ Successfully saved ${savedCount} products for Collection ${collectionId}`);
      } else {
        console.warn(`[ProductService] ⚠️ Scraper found 0 products for URL: ${url}. Check selectors or block status.`);
      }
    } catch (error) {
      console.error(`[ProductService] ❌ Failed to scrape collection ${collectionId}:`, error);
    }
  }
}