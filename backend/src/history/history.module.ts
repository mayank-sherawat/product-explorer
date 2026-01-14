import { Module } from "@nestjs/common";
import { HistoryService } from "./history.service";
import { HistoryController } from "./history.controller";
import { PrismaModule } from "../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}