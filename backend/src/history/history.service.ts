import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async logView(sessionId: string, path: string) {

    const oneMinAgo = new Date(Date.now() - 60000);
    const existing = await this.prisma.viewHistory.findFirst({
        where: {
            sessionId,
            createdAt: { gt: oneMinAgo }
        }
    });

    if (existing) {

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