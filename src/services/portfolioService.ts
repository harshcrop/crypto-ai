import { Portfolio, PortfolioValue, PortfolioHistory } from '../types/crypto';
import { cryptoApi } from './cryptoApi';

class PortfolioService {
  private storageKey = 'crypto-portfolio';
  private historyKey = 'crypto-portfolio-history';

  getPortfolio(): Portfolio {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  addHolding(symbol: string, amount: number, name: string, coinId?: string): void {
    const portfolio = this.getPortfolio();
    portfolio[symbol.toUpperCase()] = {
      amount,
      symbol: symbol.toUpperCase(),
      name,
      coinId
    };
    localStorage.setItem(this.storageKey, JSON.stringify(portfolio));
  }

  removeHolding(symbol: string): void {
    const portfolio = this.getPortfolio();
    delete portfolio[symbol.toUpperCase()];
    localStorage.setItem(this.storageKey, JSON.stringify(portfolio));
  }

  clearPortfolio(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.historyKey);
  }

  async getPortfolioValue(): Promise<PortfolioValue[]> {
    const portfolio = this.getPortfolio();
    const portfolioValues: PortfolioValue[] = [];

    for (const holding of Object.values(portfolio)) {
      try {
        let coinId = holding.coinId;
        
        // If we don't have coinId stored, search for it
        if (!coinId) {
          coinId = await cryptoApi.searchCoin(holding.symbol);
        }

        if (coinId) {
          const coinData = await cryptoApi.getCurrentPrice(coinId);
          portfolioValues.push({
            symbol: holding.symbol,
            name: holding.name,
            amount: holding.amount,
            currentPrice: coinData.current_price,
            totalValue: holding.amount * coinData.current_price,
            priceChange24h: coinData.price_change_percentage_24h
          });

          // Update portfolio with coinId for future use
          if (!holding.coinId) {
            this.addHolding(holding.symbol, holding.amount, holding.name, coinId);
          }
        }
      } catch (error) {
        console.error(`Error fetching price for ${holding.symbol}:`, error);
        // Add with zero values if we can't fetch price
        portfolioValues.push({
          symbol: holding.symbol,
          name: holding.name,
          amount: holding.amount,
          currentPrice: 0,
          totalValue: 0,
          priceChange24h: 0
        });
      }
    }

    // Save current portfolio value to history
    await this.savePortfolioSnapshot(portfolioValues);

    return portfolioValues;
  }

  private async savePortfolioSnapshot(portfolioValues: PortfolioValue[]): Promise<void> {
    try {
      const history = this.getPortfolioHistory();
      const today = new Date().toISOString().split('T')[0];
      
      // Check if we already have data for today
      const existingIndex = history.findIndex(entry => entry.date === today);
      
      const totalValue = portfolioValues.reduce((sum, holding) => sum + holding.totalValue, 0);
      const holdings = portfolioValues.map(holding => ({
        symbol: holding.symbol,
        value: holding.totalValue
      }));

      const newEntry: PortfolioHistory = {
        date: today,
        totalValue,
        holdings
      };

      if (existingIndex >= 0) {
        // Update existing entry
        history[existingIndex] = newEntry;
      } else {
        // Add new entry
        history.push(newEntry);
      }

      // Keep only last 30 days
      const sortedHistory = history
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 30);

      localStorage.setItem(this.historyKey, JSON.stringify(sortedHistory));
    } catch (error) {
      console.error('Error saving portfolio snapshot:', error);
    }
  }

  getPortfolioHistory(): PortfolioHistory[] {
    try {
      const stored = localStorage.getItem(this.historyKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getPortfolioHistory7Days(): PortfolioHistory[] {
    const history = this.getPortfolioHistory();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return history
      .filter(entry => new Date(entry.date) >= sevenDaysAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

export const portfolioService = new PortfolioService();