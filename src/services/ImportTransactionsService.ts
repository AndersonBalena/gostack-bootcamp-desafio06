import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', filename);
    const lines = await this.loadCSV(csvFilePath);

    const transactions: Transaction[] = [];

    await Promise.all(
      lines
        .filter(lineFilter => {
          return lineFilter[1] === 'income';
        })
        .map(async line => {
          const addedTransaction = await createTransaction.execute({
            title: line[0],
            type: line[1],
            value: line[2],
            categoryName: line[3],
          });

          transactions.push(addedTransaction);
        }),
    );

    await Promise.all(
      lines
        .filter(lineFilter => {
          return lineFilter[1] === 'outcome';
        })
        .map(async line => {
          const addedTransaction = await createTransaction.execute({
            title: line[0],
            type: line[1],
            value: line[2],
            categoryName: line[3],
          });

          transactions.push(addedTransaction);
        }),
    );

    return transactions;
  }

  async loadCSV(filePath: string): Promise<any[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: any[] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }
}

export default ImportTransactionsService;
