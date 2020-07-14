import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryName: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryName,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Transaction type must be income or outcome!');
    }

    const existingCategory = await categoryRepository.findOne({
      where: { title: categoryName },
    });

    const category =
      existingCategory ||
      categoryRepository.create({
        title: categoryName,
      });

    if (!existingCategory) await categoryRepository.save(category);

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      id: category.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
