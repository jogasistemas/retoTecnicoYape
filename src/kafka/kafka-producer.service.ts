import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({ clientId: 'tx-service', brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'] });
  private producer = this.kafka.producer();

  async onModuleInit() {
    await this.producer.connect();
  }

  async publish(topic: string, payload: Record<string, any>) {
    await this.producer.send({
      topic,
      messages: [{ key: payload.transactionExternalId ?? null, value: JSON.stringify(payload) }],
    });
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }
}