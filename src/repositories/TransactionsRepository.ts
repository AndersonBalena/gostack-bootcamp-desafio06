import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getRepository(Transaction);
    const incomeTransactions = await transactionsRepository.find({
      select: ['value'],
      where: { type: 'income' },
    });

    const balance: Balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    balance.income = incomeTransactions.reduce((sum, transaction) => {
      return sum + Number(transaction.value);
    }, 0);

    const outcomeTransactions = await transactionsRepository.find({
      select: ['value'],
      where: { type: 'outcome' },
    });

    balance.outcome = outcomeTransactions.reduce((sum, transaction) => {
      return sum + Number(transaction.value);
    }, 0);

    balance.total = balance.income - balance.outcome;

    return balance;
  }
}

export default TransactionsRepository;
