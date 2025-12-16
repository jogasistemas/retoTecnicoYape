import { Module } from '@nestjs/common';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConsumersService } from './kafka-consumers.service';
import { TransactionsService } from '../transactions/transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { AntifraudService } from '../antifraud/antifraud.service';

@Module({
  providers: [
    KafkaProducerService,
    KafkaConsumersService,
    TransactionsService,
    PrismaService,
    AntifraudService,
  ],
  exports: [KafkaProducerService, KafkaConsumersService],
})
export class KafkaModule {}