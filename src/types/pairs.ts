interface Pair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels: string[];
  baseToken: Token;
  quoteToken: Token;
  priceNative: string;
  priceUsd: string;
  txns: Txns;
  volume: Volume;
  priceChange: PriceChange;
  liquidity: Liquidity;
  fdv: number;
  pairCreatedAt: number;
}

interface Token {
  address: string;
  name: string;
  symbol: string;
}

interface Txns {
  m5: TxnData;
  h1: TxnData;
  h6: TxnData;
  h24: TxnData;
}

interface TxnData {
  buys: number;
  sells: number;
}

interface Volume {
  h24: number;
  h6: number;
  h1: number;
  m5: number;
}

interface PriceChange {
  m5: number;
  h1: number;
  h6: number;
  h24: number;
}

interface Liquidity {
  usd: number;
  base: number;
  quote: number;
}

export interface PairData {
  schemaVersion: string;
  pairs: Pair[];
}
