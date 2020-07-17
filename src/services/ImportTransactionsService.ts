import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

interface CSVTransactions {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', filename);
    const transactions: CSVTransactions[] = await this.loadCSV(csvFilePath);

    const newTransactions: Transaction[] = [];

    await Promise.all(
      transactions
        .filter(transactionsFilter => {
          return transactionsFilter.type === 'income';
        })
        .map(async transaction => {
          const addedTransaction = await createTransaction.execute({
            title: transaction.title,
            type: transaction.type,
            value: transaction.value,
            categoryName: transaction.category,
          });

          newTransactions.push(addedTransaction);
        }),
    );

    await Promise.all(
      transactions
        .filter(transactionsFilter => {
          return transactionsFilter.type === 'outcome';
        })
        .map(async transaction => {
          const addedTransaction = await createTransaction.execute({
            title: transaction.title,
            type: transaction.type,
            value: transaction.value,
            categoryName: transaction.category,
          });

          newTransactions.push(addedTransaction);
        }),
    );

    // await fs.promises.unlink(filename);

    return newTransactions;
  }

  async loadCSV(filePath: string): Promise<CSVTransactions[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransactions[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );
      if (!title || !type || !value) return;

      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return transactions;
  }
}

export default ImportTransactionsService;
