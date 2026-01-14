import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async logView(sessionId: string, path: string) {
    // Basic deduplication: don't log if same path viewed < 1 min ago by same session
    const oneMinAgo = new Date(Date.now() - 60000);
    const existing = await this.prisma.viewHistory.findFirst({
        where: {
            sessionId,
            createdAt: { gt: oneMinAgo }
        }
    });

    if (existing) {
        // check path inside json
        const paths = existing.pathJson as any;
        if (paths.path === path) return; 
    }

    return this.prisma.viewHistory.create({
      data: {
        sessionId,
        pathJson: { path },
      },
    });
  }
}