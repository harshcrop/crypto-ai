import React from 'react';
import { Message as MessageType } from '../types/crypto';
import { TrendingUp, TrendingDown, Wallet, BarChart3, AlertCircle, DollarSign } from 'lucide-react';
import PriceChart from './PriceChart';
import PortfolioChart from './PortfolioChart';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'price':
        const coin = message.data;
        const isPositive = coin.price_change_percentage_24h >= 0;
        
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="text-lg font-semibold">{coin.symbol}</div>
              <div className="text-sm text-gray-600">{coin.name}</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold">{formatPrice(coin.current_price)}</div>
              <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="font-medium">{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Market Cap</div>
                <div className="font-medium">{formatMarketCap(coin.market_cap)}</div>
              </div>
              <div>
                <div className="text-gray-600">Rank</div>
                <div className="font-medium">#{coin.market_cap_rank}</div>
              </div>
            </div>
            
            {coin.description && (
              <div className="text-sm text-gray-700 italic border-l-2 border-gray-200 pl-3">
                {coin.description}
              </div>
            )}
          </div>
        );

      case 'trending':
        const trending = message.data;
        
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="text-green-600" size={20} />
              <span className="font-semibold">Trending Coins Today</span>
            </div>
            
            <div className="space-y-2">
              {trending.slice(0, 5).map((coin: any, index: number) => {
                const hasPrice = coin.current_price && coin.current_price > 0;
                const isPositive = coin.price_change_percentage_24h >= 0;
                
                return (
                  <div key={coin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <div>
                        <div className="font-medium">{coin.symbol.toUpperCase()}</div>
                        <div className="text-sm text-gray-600">{coin.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {hasPrice ? (
                        <div>
                          <div className="font-medium">{formatPrice(coin.current_price)}</div>
                          <div className={`text-sm flex items-center justify-end space-x-1 ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span>{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">Rank #{coin.market_cap_rank}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'portfolio':
        const portfolio = message.data;
        
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <Wallet className="text-blue-600" size={20} />
              <span className="font-semibold">Your Portfolio</span>
            </div>
            
            {Object.keys(portfolio).length === 0 ? (
              <p className="text-gray-600 italic">No holdings found. Add some by saying "I have X BTC" or similar.</p>
            ) : (
              <div className="space-y-2">
                {Object.values(portfolio).map((holding: any) => (
                  <div key={holding.symbol} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{holding.symbol}</div>
                      <div className="text-sm text-gray-600">{holding.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{holding.amount} {holding.symbol}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'portfolio-value':
        const portfolioValues = message.data;
        const totalValue = portfolioValues.reduce((sum: number, holding: any) => sum + holding.totalValue, 0);
        const totalChange24h = portfolioValues.reduce((sum: number, holding: any) => {
          const yesterdayValue = holding.totalValue / (1 + holding.priceChange24h / 100);
          return sum + (holding.totalValue - yesterdayValue);
        }, 0);
        const totalChangePercent = totalValue > 0 ? (totalChange24h / (totalValue - totalChange24h)) * 100 : 0;
        const isTotalPositive = totalChangePercent >= 0;
        
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="text-green-600" size={20} />
              <span className="font-semibold">Portfolio Value</span>
            </div>
            
            {portfolioValues.length === 0 ? (
              <p className="text-gray-600 italic">No holdings found. Add some by saying "I have X BTC" or similar.</p>
            ) : (
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold">Total Value</span>
                    <div className={`flex items-center space-x-1 ${isTotalPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isTotalPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span className="font-medium">{Math.abs(totalChangePercent).toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{formatPrice(totalValue)}</div>
                  <div className={`text-sm ${isTotalPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isTotalPositive ? '+' : ''}{formatPrice(totalChange24h)} (24h)
                  </div>
                </div>
                
                <div className="space-y-2">
                  {portfolioValues.map((holding: any) => {
                    const isPositive = holding.priceChange24h >= 0;
                    return (
                      <div key={holding.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-medium">{holding.symbol}</div>
                            <div className="text-sm text-gray-600">{holding.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatPrice(holding.totalValue)}</div>
                          <div className="text-sm text-gray-600">
                            {holding.amount} × {formatPrice(holding.currentPrice)}
                          </div>
                          <div className={`text-sm flex items-center justify-end space-x-1 ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            <span>{Math.abs(holding.priceChange24h).toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      case 'portfolio-history':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="text-purple-600" size={20} />
              <span className="font-semibold">Portfolio 7-Day History</span>
            </div>
            <PortfolioChart data={message.data} />
          </div>
        );

      case 'chart':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="text-purple-600" size={20} />
              <span className="font-semibold">7-Day Price Chart</span>
            </div>
            <PriceChart data={message.data} />
          </div>
        );

      case 'error':
        return (
          <div className="flex items-start space-x-2 text-red-600">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <div>{message.text}</div>
          </div>
        );

      default:
        return <div>{message.text}</div>;
    }
  };

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
          message.isUser
            ? 'bg-black text-white rounded-br-md'
            : 'bg-white border border-gray-200 text-black rounded-bl-md'
        }`}
      >
        {renderMessageContent()}
        <div
          className={`text-xs mt-2 ${
            message.isUser ? 'text-gray-300' : 'text-gray-500'
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default Message;