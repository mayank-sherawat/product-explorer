import { Module } from "@nestjs/common";
import { NavigationController } from "./navigation.controller";
import { NavigationService } from "./navigation.service";
import { PrismaModule } from "../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [NavigationController],
  providers: [NavigationService],
})
export class NavigationModule {}
