const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

// Types needed for caching
interface CachedMarketCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

// Simple cache to avoid rate limits
let globalDataCache: { data: GlobalData | null; timestamp: number } = { data: null, timestamp: 0 };
let marketCapChartCache: { data: MarketCapChartPoint[]; timestamp: number; days: number } = { data: [], timestamp: 0, days: 0 };
let marketsCache: { data: CachedMarketCoin[]; timestamp: number } = { data: [], timestamp: 0 };
let priceCache: { [key: string]: { price: number; timestamp: number } } = {};
let coinDetailCache: { [key: string]: { data: any; timestamp: number } } = {};
let chartCache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_TTL = 120000; // 2 minute cache
const PRICE_CACHE_TTL = 60000; // 1 minute cache for prices
const MARKETS_CACHE_TTL = 120000; // 2 minute cache for markets
const COIN_DETAIL_CACHE_TTL = 120000; // 2 minute cache for coin details
const CHART_CACHE_TTL = 300000; // 5 minute cache for charts

// Map common trading pairs to CoinGecko IDs
const COIN_ID_MAP: { [key: string]: string } = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'LTC': 'litecoin',
  'ATOM': 'cosmos',
  'ETC': 'ethereum-classic',
  'XLM': 'stellar',
  'NEAR': 'near',
  'APT': 'aptos',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'SUI': 'sui',
  'FTM': 'fantom',
  'ALGO': 'algorand',
  'VET': 'vechain',
  'SAND': 'the-sandbox',
  'MANA': 'decentraland',
  'AAVE': 'aave',
  'GRT': 'the-graph',
  'FIL': 'filecoin',
  'HBAR': 'hedera-hashgraph',
  'ICP': 'internet-computer',
  'SHIB': 'shiba-inu',
  'TRX': 'tron',
  'CRO': 'crypto-com-chain',
  'LEO': 'leo-token',
  'DAI': 'dai',
  'TON': 'the-open-network',
  'BCH': 'bitcoin-cash',
  'PEPE': 'pepe',
  'WIF': 'dogwifcoin',
  'RENDER': 'render-token',
  'INJ': 'injective-protocol',
  'IMX': 'immutable-x',
  'TIA': 'celestia',
  'SEI': 'sei-network',
  'STX': 'stacks',
  'RUNE': 'thorchain',
  'FET': 'fetch-ai',
  'PENDLE': 'pendle',
  'JUP': 'jupiter-exchange-solana',
  'PYTH': 'pyth-network',
  'BONK': 'bonk',
  'WLD': 'worldcoin-wld',
  'FLOKI': 'floki',
  'ENA': 'ethena',
  'ORDI': 'ordinals',
  'SATS': '1000sats',
  'W': 'wormhole',
  'STRK': 'starknet',
  'MEME': 'memecoin',
  'NOT': 'notcoin',
  'TURBO': 'turbo',
  'AI16Z': 'ai16z',
  'VIRTUAL': 'virtual-protocol',
  'FARTCOIN': 'fartcoin',
  'TRUMP': 'maga-trump',
};

export function getCoinIdFromPair(pair: string): string | null {
  // Extract base coin from pair (e.g., "BTC/USDT" -> "BTC")
  const baseCoin = pair.split('/')[0].toUpperCase();
  return COIN_ID_MAP[baseCoin] || null;
}

export async function fetchCoinPrice(coinId: string): Promise<number | null> {
  const now = Date.now();
  
  // Check cache first
  if (priceCache[coinId] && (now - priceCache[coinId].timestamp) < PRICE_CACHE_TTL) {
    return priceCache[coinId].price;
  }
  
  try {
    const url = `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 429 && priceCache[coinId]) {
        return priceCache[coinId].price;
      }
      console.error(`CoinGecko price API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const price = data[coinId]?.usd;
    
    if (price !== undefined) {
      priceCache[coinId] = { price, timestamp: now };
      return price;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching coin price:', error);
    return null;
  }
}

export interface GlobalData {
  total_market_cap: number;
  total_volume: number;
  market_cap_percentage: { [key: string]: number };
  market_cap_change_percentage_24h: number;
}

export async function fetchGlobalData(): Promise<GlobalData> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (globalDataCache.data && (now - globalDataCache.timestamp) < CACHE_TTL) {
    return globalDataCache.data;
  }
  
  const url = `${COINGECKO_BASE_URL}/global`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    // Return cached data if available on rate limit
    if (response.status === 429 && globalDataCache.data) {
      return globalDataCache.data;
    }
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data = await response.json();
  const globalData = data.data;
  
  const result = {
    total_market_cap: globalData.total_market_cap.usd,
    total_volume: globalData.total_volume.usd,
    market_cap_percentage: globalData.market_cap_percentage,
    market_cap_change_percentage_24h: globalData.market_cap_change_percentage_24h_usd,
  };
  
  // Cache the result
  globalDataCache = { data: result, timestamp: now };
  
  return result;
}

export interface MarketCapChartPoint {
  date: string;
  value: number;
  timestamp: number;
}

export async function fetchGlobalMarketCapChart(days: number = 30): Promise<MarketCapChartPoint[]> {
  const now = Date.now();
  
  // Return cached data if still valid and same days
  if (marketCapChartCache.data.length > 0 && 
      marketCapChartCache.days === days && 
      (now - marketCapChartCache.timestamp) < CACHE_TTL) {
    return marketCapChartCache.data;
  }
  
  // Use the coins/markets endpoint to estimate market cap history
  // by summing up top coins' market caps over time
  const url = `${COINGECKO_BASE_URL}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    // Return cached data if available on rate limit
    if (response.status === 429 && marketCapChartCache.data.length > 0) {
      return marketCapChartCache.data;
    }
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data = await response.json();
  const marketCaps: [number, number][] = data.market_caps || [];
  
  // Get global data to calculate ratio (uses cache)
  const globalData = await fetchGlobalData();
  const btcDominance = globalData.market_cap_percentage.btc / 100;
  
  // Estimate total market cap based on Bitcoin market cap and dominance
  const chartData: MarketCapChartPoint[] = marketCaps.map(([timestamp, btcMarketCap]) => {
    const date = new Date(timestamp);
    const estimatedTotal = btcMarketCap / btcDominance;
    
    return {
      date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      value: estimatedTotal,
      timestamp,
    };
  });
  
  // Reduce to ~30 points
  const maxPoints = 30;
  let result: MarketCapChartPoint[];
  if (chartData.length > maxPoints) {
    const step = Math.ceil(chartData.length / maxPoints);
    result = chartData.filter((_, i) => i % step === 0 || i === chartData.length - 1);
  } else {
    result = chartData;
  }
  
  // Cache the result
  marketCapChartCache = { data: result, timestamp: now, days };
  
  return result;
}

export interface MarketCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

export interface CoinDetail {
  id: string;
  name: string;
  symbol: string;
  image: {
    large: string;
    small: string;
    thumb: string;
  };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
  };
  description: { en: string };
}

export async function fetchMarkets(): Promise<MarketCoin[]> {
  const now = Date.now();
  
  // Check cache first
  if (marketsCache.data.length > 0 && (now - marketsCache.timestamp) < MARKETS_CACHE_TTL) {
    return marketsCache.data;
  }
  
  const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    // Return cached data if available during rate limit
    if (response.status === 429 && marketsCache.data.length > 0) {
      console.log('CoinGecko rate limited, returning cached markets data');
      return marketsCache.data;
    }
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Update cache
  marketsCache = { data, timestamp: now };
  
  return data;
}

export async function fetchCoinById(id: string): Promise<CoinDetail> {
  const now = Date.now();
  const cacheKey = id;
  
  // Check cache first
  if (coinDetailCache[cacheKey] && (now - coinDetailCache[cacheKey].timestamp) < COIN_DETAIL_CACHE_TTL) {
    console.log(`Returning cached coin data for ${id}`);
    return coinDetailCache[cacheKey].data;
  }
  
  const url = `${COINGECKO_BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    // Return cached data if available during rate limit
    if (response.status === 429 && coinDetailCache[cacheKey]) {
      console.log(`CoinGecko rate limited, returning stale cached coin data for ${id}`);
      return coinDetailCache[cacheKey].data;
    }
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Update cache
  coinDetailCache[cacheKey] = { data, timestamp: now };
  
  return data;
}

export interface ChartDataPoint {
  time: string;
  price: number;
  timestamp: number;
}

export async function fetchCoinChart(id: string, period: string): Promise<ChartDataPoint[]> {
  const now = Date.now();
  const cacheKey = `${id}-${period}`;
  
  // Check cache first
  if (chartCache[cacheKey] && (now - chartCache[cacheKey].timestamp) < CHART_CACHE_TTL) {
    console.log(`Returning cached chart data for ${id} (${period})`);
    return chartCache[cacheKey].data;
  }
  
  let days: string;
  let interval: string | undefined;
  
  switch (period) {
    case "1H":
      days = "1";
      break;
    case "24H":
      days = "1";
      break;
    case "7D":
      days = "7";
      break;
    case "1M":
      days = "30";
      break;
    case "1Y":
      days = "365";
      break;
    case "ALL":
      days = "max";
      break;
    default:
      days = "1";
  }

  const url = `${COINGECKO_BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    // Return cached data if available during rate limit
    if (response.status === 429 && chartCache[cacheKey]) {
      console.log(`CoinGecko rate limited, returning stale cached chart data for ${id}`);
      return chartCache[cacheKey].data;
    }
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data = await response.json();
  let prices: [number, number][] = data.prices || [];
  
  // For 1H, filter to last hour
  if (period === "1H") {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    prices = prices.filter(([timestamp]) => timestamp >= oneHourAgo);
  }
  
  // Format the data for the chart
  const chartData: ChartDataPoint[] = prices.map(([timestamp, price]) => {
    const date = new Date(timestamp);
    let timeStr: string;
    
    if (period === "1H" || period === "24H") {
      timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (period === "7D") {
      timeStr = date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', hour12: false });
    } else if (period === "1M") {
      timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (period === "1Y") {
      timeStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } else {
      timeStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    
    return {
      time: timeStr,
      price: price,
      timestamp: timestamp
    };
  });
  
  // Reduce data points for smoother charts (keep ~50-100 points)
  const maxPoints = period === "1H" ? 30 : period === "24H" ? 48 : 60;
  let result = chartData;
  if (chartData.length > maxPoints) {
    const step = Math.ceil(chartData.length / maxPoints);
    result = chartData.filter((_, i) => i % step === 0 || i === chartData.length - 1);
  }
  
  // Update cache
  chartCache[cacheKey] = { data: result, timestamp: now };
  
  return result;
}
