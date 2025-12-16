import { Module } from '@nestjs/common';
import { TransactionsModule } from './transactions/transactions.module';
import { KafkaModule } from './kafka/kafka.module';
import { AntifraudModule } from './antifraud/antifraud.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [TransactionsModule, KafkaModule, AntifraudModule],
  providers: [PrismaService],
})
export class AppModule {}