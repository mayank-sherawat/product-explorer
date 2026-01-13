import { Controller, Get, Param } from "@nestjs/common";
import { ProductService } from "./product.service";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  
  // 🟢 CHANGE: Use @Get so the frontend can trigger it easily when loading the page
  @Get("scrape/:slug")
  scrape(@Param("slug") slug: string) {
    return this.productService.scrapeCollectionProducts(slug);
  }

  @Get(":sourceId")
  getDetail(@Param("sourceId") sourceId: string) {
    return this.productService.getProductDetail(sourceId);
  }
}