export interface StoredTransaction {
  startTime: number;
  buys: number[];
}

export const transactions: { [key: string]: StoredTransaction } = {};
