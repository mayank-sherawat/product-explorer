import { Controller, Get, Param } from "@nestjs/common";
import { ProductService } from "./product.service";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  
  @Get("scrape/:slug")
  scrape(@Param("slug") slug: string) {
    return this.productService.scrapeCollectionProducts(slug);
  }

  @Get(":sourceId")
  getDetail(@Param("sourceId") sourceId: string) {
    return this.productService.getProductDetail(sourceId);
  }
}
