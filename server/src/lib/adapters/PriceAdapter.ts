export interface PriceResult {
  tickerSymbol: string;
  exchangeCode: string;
  name?: string;
  currentPrice: number;
  previousClose?: number;
  dayChange?: number;
  dayChangePercent?: number;
  currency: string;
}

export interface PriceAdapter {
  readonly name: string;
  fetchPrices(symbols: string[]): Promise<PriceResult[]>;
  fetchPrice(symbol: string): Promise<PriceResult>;
  isAvailable(): Promise<boolean>;
}
