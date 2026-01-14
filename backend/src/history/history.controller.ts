import { Controller, Post, Body } from "@nestjs/common";
import { HistoryService } from "./history.service";

@Controller("history")
export class HistoryController {
  constructor(private readonly service: HistoryService) {}

  @Post()
  logView(@Body() body: { sessionId: string; path: string }) {
    return this.service.logView(body.sessionId, body.path);
  }
}