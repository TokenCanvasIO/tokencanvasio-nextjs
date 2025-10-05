const fetch = require('node-fetch');

// --- PERFORMANCE CONFIGURATION ---
const TIMEOUT_THRESHOLD_MS = 1500;
const MAX_DATA_POINTS = 80;

const findPriceAtTimestamp = (priceHistory, timestamp) => {
  if (!priceHistory || priceHistory.length === 0) return 0;
  let closestPrice = 0;
  for (const [ts, price] of priceHistory) {
    if (ts <= timestamp) {
      closestPrice = price;
    } else {
      break;
    }
  }
  return closestPrice;
};

const fetchHistoricalPrices = async (assetIds, days, apiKey) => {
  const interval = days <= 90 ? 'hourly' : 'daily';

  const pricePromises = assetIds.map(id => {
    const coingeckoId = id === 'ripple' ? 'xrp' : id;
    const url = `https://pro-api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`;
    
    return fetch(url, {
      headers: { 'x-cg-pro-api-key': apiKey },
    })
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => {
            throw new Error(`CoinGecko API error for ${coingeckoId}: ${res.status} ${res.statusText} - ${text}`);
          });
        }
        return res.json();
      })
      .then(data => ({ id, prices: data.prices || [] }))
      .catch(error => {
        console.warn(error.message);
        return { id, prices: [] };
      });
  });
  
  const results = await Promise.all(pricePromises);
  const priceMap = new Map();
  results.forEach(result => priceMap.set(result.id, result.prices));
  return priceMap;
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  const coingeckoApiKey = process.env.COINGECKO_API_KEY;

  // --- KEY DEBUGGING CHANGE ---
  // This will log a masked version of the key to prove if it's being read.
  if (coingeckoApiKey) {
    const maskedKey = `${coingeckoApiKey.substring(0, 6)}...${coingeckoApiKey.substring(coingeckoApiKey.length - 4)}`;
    console.log(`Authenticating with Key: ${maskedKey}`);
  } else {
    console.error("FATAL: COINGECKO_API_KEY environment variable was not found or is empty.");
    return { statusCode: 500, body: JSON.stringify({ message: 'Server configuration error: API key is missing.' }) };
  }

  try {
    const { transactions, timeframe } = JSON.parse(event.body);

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ prices: [], volumes: [] }) };
    }

    const daysMap = { '24H': 1, '7D': 7, '1M': 30, '3M': 90, '1Y': 365, 'All': 1825 };
    const days = daysMap[timeframe] || 365;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const uniqueAssetIds = [...new Set(transactions.map(t => t.assetId))];
    const historicalPricesMap = await fetchHistoricalPrices(uniqueAssetIds, days, coingeckoApiKey);

    const portfolioHistory = [];
    const step = (endDate.getTime() - startDate.getTime()) / MAX_DATA_POINTS;

    for (let i = 0; i <= MAX_DATA_POINTS; i++) {
      if (context.getRemainingTimeInMillis() < TIMEOUT_THRESHOLD_MS) {
        console.warn('Approaching timeout, returning partial data.');
        break;
      }

      const currentTimestamp = startDate.getTime() + (i * step);
      let totalPortfolioValue = 0;

      for (const assetId of uniqueAssetIds) {
        let currentQuantity = 0;
        for (const txn of transactions) {
          if (txn.assetId === assetId && new Date(txn.date).getTime() <= currentTimestamp) {
            const quantity = txn.quantity || 0;
            if (txn.type === 'buy' || txn.type === 'transfer') {
              currentQuantity += quantity;
            } else if (txn.type === 'sell') {
              currentQuantity -= quantity;
            }
          }
        }

        if (currentQuantity > 0) {
          const priceHistory = historicalPricesMap.get(assetId);
          const priceAtTime = findPriceAtTimestamp(priceHistory, currentTimestamp);
          totalPortfolioValue += currentQuantity * priceAtTime;
        }
      }
      portfolioHistory.push([currentTimestamp, totalPortfolioValue]);
    }

    if (portfolioHistory.length < 2) {
      return { statusCode: 200, body: JSON.stringify({ prices: [], volumes: [], error: "Calculation took too long or API calls failed." }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prices: portfolioHistory, volumes: [] }),
    };

  } catch (error) {
    console.error("Error in portfolio history calculation:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `An internal server error occurred: ${error.message}` }),
    };
  }
};
