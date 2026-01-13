import { Controller, Get } from "@nestjs/common";
import { CollectionService } from "./collection.service";

@Controller("collections")
export class CollectionController {
  constructor(private readonly service: CollectionService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }
}
