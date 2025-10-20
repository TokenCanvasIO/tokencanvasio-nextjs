import { Client } from 'xrpl';

// XRPL Client setup
const client = new Client('wss://xrplcluster.com');

// Helper: Connect to XRPL if not already connected
export async function ensureConnected() {
  if (!client.isConnected()) {
    await client.connect();
  }
  return client;
}

// Helper: Format amounts from XRPL
export function formatAmount(amount) {
  if (typeof amount === 'string') {
    return {
      currency: 'XRP',
      value: String(Number(amount) / 1_000_000),
      issuer: null
    };
  }
  return {
    currency: amount.currency,
    value: amount.value,
    issuer: amount.issuer
  };
}

// Helper: Create fallback metadata
function createFallbackMetadata(currency) {
  const currencySymbol = currency.length > 3 ? currency.substring(0, 3) : currency;
  return {
    name: currency,
    symbol: currency,
    image: `https://avatar.vercel.sh/${currency}.png?size=128&text=${currencySymbol}`,
    current_price: 0
  };
}

// ============================================
// RATE LIMITING FOR COINGECKO
// ============================================
const metadataCache = new Map();
const requestQueue = [];
let isProcessingQueue = false;

// Free tier: 10-30 calls/minute (be conservative)
// Pro tier: 500 calls/minute
const RATE_LIMIT_DELAY = process.env.COINGECKO_API_KEY ? 150 : 3000; // 150ms for pro, 3s for free

async function processMetadataQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { currency, issuer, resolve } = requestQueue.shift();
    
    try {
      const result = await fetchTokenMetadataFromAPI(currency, issuer);
      
      // Cache the result
      const cacheKey = `${currency}-${issuer || 'null'}`;
      metadataCache.set(cacheKey, result);
      
      resolve(result);
    } catch (error) {
      resolve(createFallbackMetadata(currency));
    }
    
    // Wait before processing next request
    if (requestQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }
  }
  
  isProcessingQueue = false;
}

// Internal function that actually makes the API call
async function fetchTokenMetadataFromAPI(currency, issuer) {
  if (currency === 'XRP' && !issuer) {
    return {
      name: 'XRP',
      symbol: 'XRP',
      image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
      current_price: 0
    };
  }

  // Skip CoinGecko for hex-encoded currency codes (40 chars) - they won't be found
  if (currency.length === 40 && /^[0-9A-F]+$/i.test(currency)) {
    console.log(`⏭️  Skipping CoinGecko for hex currency: ${currency.substring(0, 10)}...`);
    return createFallbackMetadata(currency);
  }

  // List of tokens that ARE on CoinGecko and worth checking
  const knownCoingeckoTokens = [
    'USD', 'USDT', 'USDC', 'EUR', 'CNY', 'JPY', 'GBP',
    'BTC', 'ETH', 'XLM', 'LTC', 'DOGE', 'ADA', 'DOT',
    'XSGD', 'CSC', 'XAH', 'FLR', 'STR', 'RPR'
  ];
  
  // Skip CoinGecko for 3-letter codes that aren't on the known list
  if (currency.length === 3 && !knownCoingeckoTokens.includes(currency.toUpperCase())) {
    console.log(`⏭️  Skipping CoinGecko for unknown token: ${currency}`);
    return createFallbackMetadata(currency);
  }
  
  // Skip for 4+ letter custom tokens (except stablecoins)
  if (currency.length > 3 && currency.length < 40 && !knownCoingeckoTokens.includes(currency.toUpperCase())) {
    console.log(`⏭️  Skipping CoinGecko for custom token: ${currency}`);
    return createFallbackMetadata(currency);
  }

  const apiKey = process.env.COINGECKO_API_KEY;
  const usePro = !!apiKey;
  
  const baseUrl = usePro 
    ? 'https://pro-api.coingecko.com/api/v3' 
    : 'https://api.coingecko.com/api/v3';
  
  const apiKeyParam = usePro ? `x_cg_pro_api_key=${apiKey}` : '';

  // Search for the coin
  const searchUrl = `${baseUrl}/search?query=${encodeURIComponent(currency)}${usePro ? '&' + apiKeyParam : ''}`;
  const searchResponse = await fetch(searchUrl);

  if (!searchResponse.ok) {
    if (searchResponse.status === 429) {
      console.warn(`⚠️ Rate limited by CoinGecko for ${currency}`);
    }
    return createFallbackMetadata(currency);
  }

  const searchData = await searchResponse.json();
  const coin = searchData.coins?.find(c => 
    c.symbol?.toLowerCase() === currency.toLowerCase()
  ) || searchData.coins?.[0];

  if (!coin?.id) {
    return createFallbackMetadata(currency);
  }

  // Get detailed coin info
  const detailUrl = `${baseUrl}/coins/${coin.id}${usePro ? '?' + apiKeyParam : ''}`;
  const detailResponse = await fetch(detailUrl);

  if (!detailResponse.ok) {
    return {
      name: coin.name || currency,
      symbol: coin.symbol?.toUpperCase() || currency,
      image: coin.large || coin.thumb || createFallbackMetadata(currency).image,
      current_price: 0
    };
  }

  const detailData = await detailResponse.json();

  return {
    name: detailData.name || currency,
    symbol: detailData.symbol?.toUpperCase() || currency,
    image: detailData.image?.large || detailData.image?.small || createFallbackMetadata(currency).image,
    current_price: detailData.market_data?.current_price?.usd || 0
  };
}

// Public function with rate limiting and caching
export async function getTokenMetadata(currency, issuer) {
  // Check cache first
  const cacheKey = `${currency}-${issuer || 'null'}`;
  const cached = metadataCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  // Add to queue and return promise
  return new Promise((resolve) => {
    requestQueue.push({ currency, issuer, resolve });
    processMetadataQueue();
  });
}

// Helper: Calculate pool metrics
export function calculatePoolMetrics(ammInfo, asset1Metadata, asset2Metadata) {
  const asset1Amount = parseFloat(ammInfo.amount.value || ammInfo.amount);
  const asset2Amount = parseFloat(ammInfo.amount2.value || ammInfo.amount2);
  const asset1Price = asset1Metadata.current_price || 0;
  const asset2Price = asset2Metadata.current_price || 0;
  const asset1Value = asset1Amount * asset1Price;
  const asset2Value = asset2Amount * asset2Price;
  const totalLiquidity = asset1Value + asset2Value;
  const tradingFee = ammInfo.trading_fee ? ammInfo.trading_fee / 100000 : 0.003;

  return {
    totalLiquidity,
    tradingFee: tradingFee * 100,
    lpTokens: ammInfo.lp_token?.value || '0',
    asset1Value,
    asset2Value
  };
}

// Optional: Clear cache (useful for testing)
export function clearMetadataCache() {
  metadataCache.clear();
  console.log('🧹 Metadata cache cleared');
}