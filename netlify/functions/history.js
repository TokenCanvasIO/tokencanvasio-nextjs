const fetch = require('node-fetch');

// --- PERFORMANCE OPTIMIZATIONS ---
const TIMEOUT_THRESHOLD_MS = 1500; // Stop processing 1.5s before Netlify's limit
const MAX_DATA_POINTS = 80; // Reduced from 120 to run faster

// Helper function to find the closest price for an asset at a specific timestamp
const findPriceAtTimestamp = (priceHistory, timestamp) => {
  if (!priceHistory || priceHistory.length === 0) return 0;
  let closestPrice = 0;
  // Find the last known price before or at the given timestamp
  for (const [ts, price] of priceHistory) {
    if (ts <= timestamp) {
      closestPrice = price;
    } else {
      break; // Prices are sorted, so we can stop searching early
    }
  }
  return closestPrice;
};

// Fetches historical price data for a list of assets from CoinGecko
const fetchHistoricalPrices = async (assetIds, days) => {
  // --- OPTIMIZATION: Request hourly data for shorter timeframes ---
  const interval = days <= 90 ? 'hourly' : 'daily';

  const pricePromises = assetIds.map(id => {
    // Note: The free CoinGecko API is used here as a fallback.
    // Replace with your Pro API URL structure if needed.
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`;
    return fetch(url)
      .then(res => {
        if (!res.ok) {
          // If CoinGecko returns an error (e.g., 404), handle it gracefully
          console.warn(`CoinGecko API error for asset ${id}: ${res.statusText}`);
          return { prices: [] };
        }
        return res.json();
      })
      .then(data => ({ id, prices: data.prices || [] }))
      .catch(error => {
        console.warn(`Failed to fetch history for asset: ${id}`, error);
        return { id, prices: [] }; // Always return a valid object
      });
  });
  
  const results = await Promise.all(pricePromises);
  const priceMap = new Map();
  results.forEach(result => priceMap.set(result.id, result.prices));
  return priceMap;
};

// --- Main Netlify Function Handler ---
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
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
    const historicalPricesMap = await fetchHistoricalPrices(uniqueAssetIds, days);

    const portfolioHistory = [];
    const step = (endDate.getTime() - startDate.getTime()) / MAX_DATA_POINTS;

    for (let i = 0; i <= MAX_DATA_POINTS; i++) {
      if (context.getRemainingTimeInMillis() < TIMEOUT_THRESHOLD_MS) {
        console.warn('Approaching timeout, returning partial data.');
        break; // Exit loop to prevent 502 error
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

    // Ensure we don't return an empty chart if it timed out on the first point
    if (portfolioHistory.length < 2) {
      console.warn('Calculation timed out before enough data could be generated.');
      return { statusCode: 200, body: JSON.stringify({ prices: [], volumes: [], error: "Calculation took too long." }) };
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
