export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
  description?: string;
}

export interface TrendingCoin {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
  current_price?: number;
  price_change_percentage_24h?: number;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
}

export interface Portfolio {
  [symbol: string]: {
    amount: number;
    symbol: string;
    name: string;
    coinId?: string;
  };
}

export interface PortfolioValue {
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  totalValue: number;
  priceChange24h: number;
}

export interface PortfolioHistory {
  date: string;
  totalValue: number;
  holdings: {
    symbol: string;
    value: number;
  }[];
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  data?: any;
  type?: 'text' | 'price' | 'trending' | 'portfolio' | 'portfolio-value' | 'portfolio-history' | 'chart' | 'error';
}