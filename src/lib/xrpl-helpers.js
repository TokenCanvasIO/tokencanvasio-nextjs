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

// Helper: Get token metadata from CoinGecko
export async function getTokenMetadata(currency, issuer) {
  try {
    if (currency === 'XRP') {
      return {
        name: 'XRP',
        symbol: 'XRP',
        image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
        current_price: null
      };
    }
    const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${currency}`);
    const searchData = await searchResponse.json();
    const match = searchData.coins?.find(coin => coin.symbol.toLowerCase() === currency.toLowerCase());

    if (match) {
      const detailsResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${match.id}`);
      const details = await detailsResponse.json();
      return {
        name: details.name,
        symbol: details.symbol.toUpperCase(),
        image: details.image?.large || details.image?.small,
        current_price: details.market_data?.current_price?.usd
      };
    }
    return { name: currency, symbol: currency, image: null, current_price: null };
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return { name: currency, symbol: currency, image: null, current_price: null };
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
  const tradingFee = ammInfo.trading_fee ? ammInfo.trading_fee / 100000 : 0.003; // Corrected division
  
  return {
    totalLiquidity,
    tradingFee: tradingFee * 100,
    lpTokens: ammInfo.lp_token?.value || '0',
    asset1Value,
    asset2Value
  };
}