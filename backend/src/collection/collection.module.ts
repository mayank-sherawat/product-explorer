import { Module } from "@nestjs/common";
import { CollectionController } from "./collection.controller";
import { CollectionService } from "./collection.service";
import { PrismaModule } from "../common/prisma/prisma.module";
import { ProductModule } from "../product/product.module"; // Import this

@Module({
  imports: [PrismaModule, ProductModule], 
  controllers: [CollectionController],
  providers: [CollectionService],
})
export class CollectionModule {}