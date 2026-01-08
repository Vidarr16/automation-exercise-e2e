import fs from 'fs/promises';
import path from 'path';
import { Product } from '../models/product';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'test-data', 'record_items.json');

export const recorder = {
  async writeProducts(products: Product[]): Promise<void> {
    await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');
  },

  async readProducts(): Promise<Product[]> {
    try {
      const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      return JSON.parse(data) as Product[];
    } catch (error) {
      console.error('Error reading record_items.json:', error);
      return [];
    }
  }
};
