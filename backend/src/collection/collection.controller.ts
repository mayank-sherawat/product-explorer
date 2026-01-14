import { Controller, Get, Post } from "@nestjs/common";
import { CollectionService } from "./collection.service";

@Controller("collections")
export class CollectionController {
  constructor(private readonly service: CollectionService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Post("scrape")
  async scrape() {
    // 🟢 FIXED: Updated method name to match CollectionService
    return this.service.scrapeFullSite();
  }
}