import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService, KafkaProducerService],
  exports: [TransactionsService],
})
export class TransactionsModule {}