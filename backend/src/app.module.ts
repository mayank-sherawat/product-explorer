import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
// REMOVED: import { NavigationModule } ...
import { CollectionModule } from './collection/collection.module'; // Ensure capital C
import { ProductModule } from "./product/product.module";

@Module({
  imports: [
    ProductModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 30,
      },
    ]),
    PrismaModule,
    // REMOVED: NavigationModule,
    CollectionModule, 
  ],
})
export class AppModule {}