export type SniperType = "maestro" | "unibot" | "banana";

export interface SniperTxn {
  amount: number;
  sniper: SniperType;
}

export interface StoredTransaction {
  startTime: number;
  buys: SniperTxn[];
  totalBuy: number;
}

export const transactions: { [key: string]: StoredTransaction } = {};
