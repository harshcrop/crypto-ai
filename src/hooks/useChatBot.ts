import { useState, useCallback } from 'react';
import { Message } from '../types/crypto';
import { cryptoApi } from '../services/cryptoApi';
import { portfolioService } from '../services/portfolioService';
import { speechService } from '../services/speechService';

export const useChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hi! I'm your crypto assistant. I can help you check prices, see trending coins, manage your portfolio, and more. Try asking me something like 'What's BTC trading at?' or 'Show me trending coins'.",
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const processMessage = useCallback(async (userInput: string) => {
    const userMessage = addMessage({
      text: userInput,
      isUser: true,
      type: 'text'
    });

    setIsLoading(true);

    try {
      const input = userInput.toLowerCase();

      // Greetings and basic interactions
      if (input.includes('hello') || input.includes('hi') || input.includes('hey') || 
          input.includes('good morning') || input.includes('good afternoon') || input.includes('good evening')) {
        const greetings = [
          "Hello! 👋 Ready to dive into the crypto world? Ask me about prices, trends, or your portfolio!",
          "Hi there! 🚀 What crypto information can I help you with today?",
          "Hey! 💰 I'm here to help with all your crypto needs. What would you like to know?",
          "Hello! 📈 Let's explore the crypto markets together. What can I help you with?"
        ];
        
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        
        addMessage({
          text: randomGreeting,
          isUser: false,
          type: 'text'
        });
        
        speechService.speak("Hello! What crypto information can I help you with today?");
      }

      // Thank you responses
      else if (input.includes('thank') || input.includes('thanks')) {
        const thankYouResponses = [
          "You're welcome! 😊 Anything else you'd like to know about crypto?",
          "Happy to help! 🎉 Feel free to ask me anything else about cryptocurrencies.",
          "No problem! 👍 I'm here whenever you need crypto insights.",
          "Glad I could help! 💪 What else would you like to explore?"
        ];
        
        const randomResponse = thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
        
        addMessage({
          text: randomResponse,
          isUser: false,
          type: 'text'
        });
        
        speechService.speak("You're welcome! Anything else you'd like to know?");
      }

      // Portfolio value queries
      else if (input.includes('portfolio value') || input.includes('portfolio worth') || 
               input.includes('how much is my portfolio') || input.includes('portfolio total')) {
        const portfolioValues = await portfolioService.getPortfolioValue();
        
        if (portfolioValues.length === 0) {
          addMessage({
            text: "You don't have any holdings in your portfolio yet. Add some by saying 'I have X BTC' or similar.",
            isUser: false,
            type: 'text'
          });
        } else {
          const totalValue = portfolioValues.reduce((sum, holding) => sum + holding.totalValue, 0);
          
          addMessage({
            text: `Your portfolio is currently worth ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(totalValue)}:`,
            isUser: false,
            type: 'portfolio-value',
            data: portfolioValues
          });
          
          speechService.speak(`Your portfolio is currently worth ${totalValue.toFixed(0)} dollars`);
        }
      }

      // Portfolio history queries
      else if (input.includes('portfolio history') || input.includes('portfolio chart') || 
               input.includes('portfolio 7 day') || input.includes('portfolio performance') ||
               input.includes('last 7 days portfolio') || input.includes('portfolio trend')) {
        const portfolioHistory = portfolioService.getPortfolioHistory7Days();
        
        if (portfolioHistory.length === 0) {
          addMessage({
            text: "No portfolio history available yet. Portfolio values are tracked daily, so check back tomorrow to see your 7-day performance!",
            isUser: false,
            type: 'text'
          });
        } else {
          addMessage({
            text: "Here's your portfolio performance over the last 7 days:",
            isUser: false,
            type: 'portfolio-history',
            data: portfolioHistory
          });
          
          speechService.speak("Here's your portfolio performance over the last 7 days");
        }
      }

      // Price chart - improved pattern matching
      else if (input.includes('chart') || input.includes('graph') || input.includes('history') || 
          input.includes('7-day') || input.includes('7 day') || input.includes('seven day') ||
          input.includes('last 7 days') || input.includes('past 7 days') || input.includes('week')) {
        
        const symbols = ['btc', 'bitcoin', 'eth', 'ethereum', 'ada', 'cardano', 'dot', 'polkadot', 'sol', 'solana'];
        let coinId = null;
        let coinName = '';

        for (const symbol of symbols) {
          if (input.includes(symbol)) {
            if (symbol === 'btc' || symbol === 'bitcoin') {
              coinId = 'bitcoin';
              coinName = 'Bitcoin';
            } else if (symbol === 'eth' || symbol === 'ethereum') {
              coinId = 'ethereum';
              coinName = 'Ethereum';
            } else if (symbol === 'ada' || symbol === 'cardano') {
              coinId = 'cardano';
              coinName = 'Cardano';
            } else if (symbol === 'dot' || symbol === 'polkadot') {
              coinId = 'polkadot';
              coinName = 'Polkadot';
            } else if (symbol === 'sol' || symbol === 'solana') {
              coinId = 'solana';
              coinName = 'Solana';
            }
            break;
          }
        }

        if (!coinId) {
          coinId = 'bitcoin'; // Default to Bitcoin
          coinName = 'Bitcoin';
        }

        const priceHistory = await cryptoApi.getPriceHistory(coinId, 7);
        addMessage({
          text: `${coinName} 7-day price chart:`,
          isUser: false,
          type: 'chart',
          data: priceHistory
        });
        
        speechService.speak(`Here's the ${coinName} 7-day price chart`);
      }

      // Price queries
      else if (input.includes('price') || input.includes('trading at') || input.includes('worth') || input.includes('cost')) {
        const symbols = ['btc', 'eth', 'ada', 'dot', 'sol', 'matic', 'avax', 'atom', 'link', 'uni'];
        let coinId = null;

        for (const symbol of symbols) {
          if (input.includes(symbol)) {
            coinId = symbol === 'btc' ? 'bitcoin' : 
                   symbol === 'eth' ? 'ethereum' :
                   symbol === 'ada' ? 'cardano' :
                   symbol === 'dot' ? 'polkadot' :
                   symbol === 'sol' ? 'solana' :
                   symbol === 'matic' ? 'polygon' :
                   symbol === 'avax' ? 'avalanche-2' :
                   symbol === 'atom' ? 'cosmos' :
                   symbol === 'link' ? 'chainlink' :
                   symbol === 'uni' ? 'uniswap' : null;
            break;
          }
        }

        if (!coinId) {
          // Try to extract coin name and search
          const words = userInput.split(' ');
          for (const word of words) {
            if (word.length > 2) {
              coinId = await cryptoApi.searchCoin(word);
              if (coinId) break;
            }
          }
        }

        if (coinId) {
          const coinData = await cryptoApi.getCurrentPrice(coinId);
          const botMessage = addMessage({
            text: `Here's the current price for ${coinData.name}:`,
            isUser: false,
            type: 'price',
            data: coinData
          });
          
          speechService.speak(`${coinData.name} is currently trading at ${coinData.current_price.toFixed(2)} dollars`);
        } else {
          addMessage({
            text: "I couldn't find that cryptocurrency. Try mentioning a popular coin like BTC, ETH, or ADA.",
            isUser: false,
            type: 'error'
          });
        }
      }

      // Trending coins
      else if (input.includes('trending') || input.includes('hot') || input.includes('popular')) {
        const trendingData = await cryptoApi.getTrendingCoins();
        const botMessage = addMessage({
          text: "Here are today's trending cryptocurrencies:",
          isUser: false,
          type: 'trending',
          data: trendingData
        });
        
        speechService.speak("Here are today's trending cryptocurrencies");
      }

      // Portfolio management
      else if (input.includes('i have') || input.includes('i own') || input.includes('holding')) {
        const match = userInput.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/);
        if (match) {
          const amount = parseFloat(match[1]);
          const symbol = match[2].toUpperCase();
          
          try {
            const coinId = await cryptoApi.searchCoin(symbol);
            if (coinId) {
              const coinData = await cryptoApi.getCurrentPrice(coinId);
              portfolioService.addHolding(symbol, amount, coinData.name, coinId);
              
              addMessage({
                text: `Added ${amount} ${symbol} to your portfolio!`,
                isUser: false,
                type: 'text'
              });
              
              speechService.speak(`Added ${amount} ${symbol} to your portfolio`);
            } else {
              addMessage({
                text: `I couldn't find information for ${symbol}. Please check the symbol and try again.`,
                isUser: false,
                type: 'error'
              });
            }
          } catch (error) {
            addMessage({
              text: `I couldn't find information for ${symbol}. Please check the symbol and try again.`,
              isUser: false,
              type: 'error'
            });
          }
        } else {
          addMessage({
            text: "Please specify the amount and coin, like 'I have 2 BTC' or 'I own 10 ETH'.",
            isUser: false,
            type: 'text'
          });
        }
      }

      // Show portfolio
      else if (input.includes('portfolio') || input.includes('my coins') || input.includes('my holdings')) {
        const portfolio = portfolioService.getPortfolio();
        const botMessage = addMessage({
          text: "Here's your current portfolio:",
          isUser: false,
          type: 'portfolio',
          data: portfolio
        });
        
        speechService.speak("Here's your current portfolio");
      }

      // Clear portfolio
      else if (input.includes('clear portfolio') || input.includes('reset portfolio')) {
        portfolioService.clearPortfolio();
        addMessage({
          text: "Your portfolio has been cleared.",
          isUser: false,
          type: 'text'
        });
        
        speechService.speak("Your portfolio has been cleared");
      }

      // Help
      else if (input.includes('help') || input.includes('what can you do')) {
        const helpText = `I can help you with:
• Check crypto prices: "What's BTC trading at?"
• Show trending coins: "Show me trending coins"
• Manage portfolio: "I have 2 BTC" or "Show my portfolio"
• Portfolio value: "What's my portfolio worth?"
• Portfolio history: "Show portfolio 7-day chart"
• Price charts: "Show BTC chart" or "7-day price chart"
• Clear portfolio: "Clear my portfolio"

Just ask me naturally!`;
        
        addMessage({
          text: helpText,
          isUser: false,
          type: 'text'
        });
        
        speechService.speak("I can help you check prices, see trends, manage your portfolio, and show price charts");
      }

      // Default response
      else {
        const defaultResponses = [
          "I didn't quite catch that. Try asking about crypto prices, trending coins, or your portfolio. Type 'help' to see what I can do! 🤔",
          "Hmm, I'm not sure about that. I specialize in crypto! Ask me about prices, trends, or portfolio management. 📊",
          "I didn't understand that request. I'm great with crypto questions though! Try asking about Bitcoin prices or trending coins. 💡",
          "That's not something I can help with, but I'm excellent with cryptocurrency questions! What would you like to know about crypto? 🚀"
        ];
        
        const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        
        addMessage({
          text: randomResponse,
          isUser: false,
          type: 'text'
        });
      }

    } catch (error) {
      console.error('Error processing message:', error);
      addMessage({
        text: error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again.",
        isUser: false,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  return {
    messages,
    isLoading,
    processMessage
  };
};