import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { scrapeProductsFromCollection } from "../scraping/crawlers/product.crawler";
import { scrapeProductDetail } from "../scraping/crawlers/product-detail.crawler";

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async scrapeCollectionProducts(slug: string) {
    console.log(`[ProductService] Incoming request for slug: "${slug}"`);
    
    const collection = await this.prisma.collection.findFirst({
      where: { slug },
    });

    if (!collection) {
      console.error(`[ProductService] Collection NOT FOUND for slug: ${slug}`);
      throw new NotFoundException(`Collection not found: ${slug}`);
    }

    // 🟢 STRATEGY: Scrape First (Fresh Data), Fallback to DB on error
    try {
      console.log(`[ProductService] Starting scraper for: ${collection.title}`);
      
      const products = await scrapeProductsFromCollection(collection.sourceUrl);

      if (products.length > 0) {
        console.log(`[ProductService] Scraper found ${products.length} products. Updating DB...`);
        
        for (const product of products) {
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
      } else {
        console.warn(`[ProductService] Scraper returned 0 products. Using cached data.`);
      }
    } catch (error) {
      console.error("[ProductService] SCRAPE FAILED (Using Cache):", error);
    }

    // 🟢 Return the data (Fresh or Cache)
    const finalProducts = await this.prisma.product.findMany({
      where: { collectionId: collection.id },
      orderBy: { id: 'asc' },
    });

    console.log(`[ProductService] Returning ${finalProducts.length} products.`);
    return finalProducts;
  }

  // Keep existing getProductDetail logic...
  async getProductDetail(sourceId: string) {
    const product = await this.prisma.product.findUnique({
      where: { sourceId },
      include: { detail: true },
    });

    if (!product) throw new NotFoundException("Product not found");

    if (product.detail && product.detail.description.length > 5) {
      return product;
    }

    try {
      const detail = await scrapeProductDetail(product.sourceUrl);
      if (detail.price > 0) {
        await this.prisma.product.update({
          where: { id: product.id },
          data: { price: detail.price },
        });
      }
      await this.prisma.productDetail.upsert({
        where: { productId: product.id },
        update: { description: detail.description, specs: detail.specs },
        create: {
          productId: product.id,
          description: detail.description,
          specs: detail.specs,
          ratingsAvg: null,
          reviewsCount: null,
        },
      });
      return this.prisma.product.findUnique({
        where: { id: product.id },
        include: { detail: true },
      });
    } catch (err) {
      return product;
    }
  }
}