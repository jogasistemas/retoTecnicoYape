import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { TransactionsService } from '../transactions/transactions.service';
import { AntifraudService } from '../antifraud/antifraud.service';
import { KafkaProducerService } from './kafka-producer.service';

@Injectable()
export class KafkaConsumersService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({ clientId: 'anti-fraud', brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'] });
  private createdConsumer = this.kafka.consumer({ groupId: 'anti-fraud-group' });
  private statusConsumer = this.kafka.consumer({ groupId: 'tx-status-group' });

  constructor(
    private readonly antifraud: AntifraudService,
    private readonly txService: TransactionsService,
    private readonly producer: KafkaProducerService,
  ) {}

  async onModuleInit() {
    // Consume TransactionCreated → decide status and publish TransactionStatusUpdated
    await this.createdConsumer.connect();
    await this.createdConsumer.subscribe({ topic: 'transaction-created', fromBeginning: false });
    await this.createdConsumer.run({
      eachMessage: async ({ message }) => {
        const evt = JSON.parse(message.value!.toString());
        const decided = this.antifraud.decideStatus(evt.value);
        await this.producer.publish('transaction-status-updated', {
          transactionExternalId: evt.transactionExternalId,
          status: decided,
        });
      },
    });

    // Consume TransactionStatusUpdated → persist status in DB
    await this.statusConsumer.connect();
    await this.statusConsumer.subscribe({ topic: 'transaction-status-updated', fromBeginning: false });
    await this.statusConsumer.run({
      eachMessage: async ({ message }) => {
        const evt = JSON.parse(message.value!.toString());
        await this.txService.updateStatus(evt.transactionExternalId, evt.status);
      },
    });
  }

  async onModuleDestroy() {
    await this.createdConsumer.disconnect();
    await this.statusConsumer.disconnect();
  }
}