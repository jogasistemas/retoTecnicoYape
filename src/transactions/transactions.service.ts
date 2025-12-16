import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly producer: KafkaProducerService,
  ) {}

  async create(dto: {
    accountExternalIdDebit: string;
    accountExternalIdCredit: string;
    tranferTypeId: number;
    value: number;
  }): Promise<string> {
    const externalId = randomUUID();

    const tx = await this.prisma.transaction.create({
      data: {
        transactionExternalId: externalId,
        accountExternalIdDebit: dto.accountExternalIdDebit,
        accountExternalIdCredit: dto.accountExternalIdCredit,
        transferTypeId: dto.tranferTypeId,
        value: dto.value,
        status: TransactionStatus.pending,
      },
    });

    await this.producer.publish('transaction-created', {
      transactionExternalId: tx.transactionExternalId,
      accountExternalIdDebit: tx.accountExternalIdDebit,
      accountExternalIdCredit: tx.accountExternalIdCredit,
      transferTypeId: tx.transferTypeId,
      value: tx.value,
      createdAt: tx.createdAt.toISOString(),
    });

    return externalId;
  }

  async getByExternalId(externalId: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { transactionExternalId: externalId },
    });
    if (!tx) throw new Error('Transaction not found');
    return tx;
  }

  async updateStatus(externalId: string, status: TransactionStatus) {
    await this.prisma.transaction.update({
      where: { transactionExternalId: externalId },
      data: { status },
    });
  }
}