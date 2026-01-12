import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { NavigationModule } from './navigation/navigation.module';
import { collectionModule } from './collection/collection.module';
import { ProductModule } from "./product/product.module";

@Module({
  imports: [ProductModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 30,
      },
    ]),
    PrismaModule,
    NavigationModule,
    collectionModule,
  ],
})
export class AppModule {}
