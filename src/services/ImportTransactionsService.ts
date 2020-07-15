import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', filename);
    // const data = this.loadCSV(csvFilePath);
    const transactions: Transaction[] = [];
    const teste = transactionsRepository.create({
      title: 'teste',
      type: 'income',
      value: 3000,
      category_id: '1fab423f-cf17-4ff8-9ea3-efa8b298a778',
    });
    transactions.push(teste);
    /* transactions.push(
      ,
    ); */
  }

  async loadCSV(filePath: string): any[] {
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
