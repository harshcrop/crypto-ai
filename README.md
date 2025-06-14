# Crypto Chat Assistant

## 🚀 Features

- **Modern Chat Interface**: Clean, mobile-friendly UI with message bubbles and smooth animations
- **Real-time Crypto Data**: Live prices, trending coins, market stats via CoinGecko API
- **Portfolio Tracking**: Add/remove holdings and track live portfolio value
- **Interactive Charts**: 7-day price charts with Chart.js integration
- **Voice Input**: Speech-to-text for hands-free interaction
- **Text-to-Speech**: AI assistant speaks responses aloud
- **Responsive Design**: Works perfectly on desktop and mobile

## 📁 Project Structure

```
.
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── vite-env.d.ts
    ├── components
    │   ├── ChatInput.tsx
    │   ├── Message.tsx
    │   ├── PortfolioChart.tsx
    │   ├── PriceChart.tsx
    │   └── TypingIndicator.tsx
    ├── hooks
    │   └── useChatBot.ts
    ├── services
    │   ├── cryptoApi.ts
    │   ├── portfolioService.ts
    │   └── speechService.ts
    └── types
        └── crypto.ts
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```sh
git clone https://github.com/yourusername/crypto-chat-assistant.git
cd crypto-chat-assistant
npm install
# or
yarn
```

### Running the Development Server

```sh
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```sh
npm run build
# or
yarn build
```

### Linting

```sh
npm run lint
# or
yarn lint
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_COINGECKO_API_KEY=your_api_key_here
```

## 🤖 Usage

- Ask about crypto prices:  
  _"What's BTC trading at?"_
- Show trending coins:  
  _"Show me trending coins"_
- Manage your portfolio:  
  _"I have 2 BTC"_, _"Show my portfolio"_
- Portfolio value:  
  _"What's my portfolio worth?"_
- Portfolio history:  
  _"Show portfolio 7-day chart"_
- Price charts:  
  _"Show BTC chart"_, _"7-day price chart"_
- Clear portfolio:  
  _"Clear my portfolio"_

## 📦 Dependencies

- React
- Recharts
- Tailwind CSS
- CoinGecko API
