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

// Helper: Get token metadata from CoinGecko
export async function getTokenMetadata(currency, issuer) {
  try {
    if (currency === 'XRP' && !issuer) {
      return {
        name: 'XRP',
        symbol: 'XRP',
        image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
        current_price: 0
      };
    }

    const apiKey = process.env.COINGECKO_API_KEY;
    const usePro = !!apiKey;
    
    // --- CORRECTED SECTION ---
    // Use the correct base URL and API key parameter for the Pro plan
    const baseUrl = usePro ? 'https://pro-api.coingecko.com/api/v3' : 'https://api.coingecko.com/api/v3';
    const apiKeyParam = usePro ? `&x_cg_pro_api_key=${apiKey}` : '';

    const searchUrl = `${baseUrl}/search?query=${encodeURIComponent(currency)}${apiKeyParam}`;
    const searchResponse = await fetch(searchUrl);
    // --- END CORRECTED SECTION ---

    if (!searchResponse.ok) {
      console.warn(`CoinGecko search failed for ${currency}: ${searchResponse.status}`);
      return createFallbackMetadata(currency);
    }

    const searchData = await searchResponse.json();
    const coin = searchData.coins?.find(c => c.symbol?.toLowerCase() === currency.toLowerCase()) || searchData.coins?.[0];

    if (!coin?.id) {
      return createFallbackMetadata(currency);
    }
    
    // --- CORRECTED SECTION ---
    // Use the correct URL parameter format for the details endpoint
    const detailUrl = `${baseUrl}/coins/${coin.id}?${apiKeyParam.substring(1)}`;
    const detailResponse = await fetch(detailUrl);
    // --- END CORRECTED SECTION ---

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

  } catch (error) {
    console.error(`Error fetching metadata for ${currency}:`, error.message);
    return createFallbackMetadata(currency);
  }
}

// Helper: Calculate pool metrics
export function calculatePoolMetrics(ammInfo, asset1Metadata, asset2Metadata) {
  const asset1Amount = parseFloat(ammInfo.amount.value);
  const asset2Amount = parseFloat(ammInfo.amount2.value);
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