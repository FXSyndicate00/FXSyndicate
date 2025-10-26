export enum Position {
  LONG = 'Long',
  SHORT = 'Short',
}

export enum TradeOutcome {
  WIN = 'Win',
  LOSS = 'Loss',
}

export enum AccountType {
  LIVE = 'Live',
  FUNDED = 'Funded',
}

export interface Account {
  id: string;
  name: string;
  initialBalance: number;
  accountType: AccountType;
}

export interface Trade {
  id:string;
  accountId: string;
  pair: string;
  position: Position;
  lotSize: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  pnl: number;
  outcome: TradeOutcome;
  tradeDate: string;
  strategy: string;
  notes: string;
  screenshot?: string; // Base64 encoded image
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface AnalysisResult {
  text: string;
  sources: WebSource[];
}

// FIX: Add EconomicEvent interface for the economic calendar.
export interface EconomicEvent {
  time: string;
  currency: string;
  impact: 'High' | 'Medium' | 'Low';
  event: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
}
