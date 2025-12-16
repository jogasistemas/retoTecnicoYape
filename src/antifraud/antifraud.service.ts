import { Injectable } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class AntifraudService {
  decideStatus(value: number): TransactionStatus {
    return value > 1000 ? TransactionStatus.rejected : TransactionStatus.approved;
  }
}