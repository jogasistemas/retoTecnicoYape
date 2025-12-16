import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    const id = await this.service.create(dto);
    return { transactionExternalId: id };
  }

  @Get(':transactionExternalId')
  async get(@Param('transactionExternalId') id: string) {
    const tx = await this.service.getByExternalId(id);
    return {
      transactionExternalId: tx.transactionExternalId,
      transactionType: { name: String(tx.transferTypeId) },
      transactionStatus: { name: tx.status },
      value: tx.value,
      createdAt: tx.createdAt,
    };
  }
}