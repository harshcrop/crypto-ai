import { CoinData, TrendingCoin, PriceHistory } from '../types/crypto';

class CryptoApiService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private apiKey = import.meta.env.VITE_COINGECKO_API_KEY;

  private getApiUrl(endpoint: string): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (this.apiKey) {
      url.searchParams.append('x_cg_demo_api_key', this.apiKey);
    }
    return url.toString();
  }

  async getCurrentPrice(coinId: string): Promise<CoinData> {
    try {
      const response = await fetch(
        this.getApiUrl(`/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        id: data.id,
        symbol: data.symbol.toUpperCase(),
        name: data.name,
        current_price: data.market_data.current_price.usd,
        market_cap: data.market_data.market_cap.usd,
        market_cap_rank: data.market_cap_rank,
        price_change_percentage_24h: data.market_data.price_change_percentage_24h,
        total_volume: data.market_data.total_volume.usd,
        description: data.description?.en?.split('.')[0] + '.' || ''
      };
    } catch (error) {
      console.error('Error fetching current price:', error);
      throw new Error('Unable to fetch price data. Please try again later.');
    }
  }

  async getTrendingCoins(): Promise<TrendingCoin[]> {
    try {
      const response = await fetch(this.getApiUrl('/search/trending'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Get detailed price data for trending coins
      const trendingCoins = data.coins.map((coin: any) => coin.item);
      const coinIds = trendingCoins.slice(0, 5).map((coin: any) => coin.id).join(',');
      
      // Fetch current prices for trending coins
      const priceResponse = await fetch(
        this.getApiUrl(`/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`)
      );
      
      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        
        return trendingCoins.slice(0, 5).map((coin: any) => ({
          ...coin,
          current_price: priceData[coin.id]?.usd || 0,
          price_change_percentage_24h: priceData[coin.id]?.usd_24h_change || 0
        }));
      }
      
      return trendingCoins.slice(0, 5);
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      throw new Error('Unable to fetch trending coins. Please try again later.');
    }
  }

  async getPriceHistory(coinId: string, days: number = 7): Promise<PriceHistory[]> {
    try {
      const response = await fetch(
        this.getApiUrl(`/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`)
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price
      }));
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw new Error('Unable to fetch price history. Please try again later.');
    }
  }

  async searchCoin(query: string): Promise<string | null> {
    try {
      const response = await fetch(this.getApiUrl(`/search?query=${encodeURIComponent(query)}`));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.coins && data.coins.length > 0) {
        return data.coins[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error searching for coin:', error);
      return null;
    }
  }
}

export const cryptoApi = new CryptoApiService();