import { Controller, Get, Query, BadRequestException } from "@nestjs/common";
import { CollectionService } from "./collection.service";

@Controller("collections")
export class CollectionController {
  constructor(private readonly service: CollectionService) {}

  @Get()
  async findByNavigation(@Query("navigationId") navigationId?: string) {
    if (!navigationId) {
      throw new BadRequestException("navigationId is required");
    }

    return this.service.findByNavigation(Number(navigationId));
  }
}
