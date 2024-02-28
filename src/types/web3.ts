import { Transaction } from "web3";

export interface TransactionExtended extends Transaction {
  hash: string;
}
