import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductService } from "./product.service";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  
 
  @Get("collection/:slug")
  getProducts(
    @Param("slug") slug: string,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20"
  ) {
    return this.productService.getProductsByCollection(slug, Number(page), Number(limit));
  }

  
  @Get(":sourceId")
  getDetail(@Param("sourceId") sourceId: string) {
    return this.productService.getProductBySourceId(sourceId);
  }
}