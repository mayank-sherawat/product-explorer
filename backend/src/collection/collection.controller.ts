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
    return this.service.scrapeFullSite();
  }
}