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
  const pricePromises = assetIds.map(id => {
    const coingeckoId = id === 'xrp' ? 'ripple' : id;
    const url = `https://pro-api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${days}`;
    
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
  if (!coingeckoApiKey) {
    console.error("FATAL: COINGECKO_API_KEY environment variable was not found or is empty.");
    return { statusCode: 500, body: JSON.stringify({ message: 'Server configuration error: API key is missing.' }) };
  }

  try {
    const { transactions, timeframe } = JSON.parse(event.body);

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ pnl: [], value: [] }) };
    }

    const daysMap = { '24h': 1, '7d': 7, '30d': 30, '3m': 90, '1y': 365, 'all': 1825 };
    const days = daysMap[timeframe.toLowerCase()] || 365;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const uniqueAssetIds = [...new Set(transactions.map(t => t.assetId))];
    const historicalPricesMap = await fetchHistoricalPrices(uniqueAssetIds, days, coingeckoApiKey);

    const pnlHistory = [];
    const valueHistory = [];
    const step = (endDate.getTime() - startDate.getTime()) / MAX_DATA_POINTS;

    for (let i = 0; i <= MAX_DATA_POINTS; i++) {
      if (context.getRemainingTimeInMillis() < TIMEOUT_THRESHOLD_MS) {
        console.warn('Approaching timeout, returning partial data.');
        break;
      }

      const currentTimestamp = startDate.getTime() + (i * step);
      let totalPortfolioValue = 0;
      let totalCostBasis = 0; // --- NEW: Variable to track total cost basis

      for (const assetId of uniqueAssetIds) {
        let currentQuantity = 0;
        let totalBuyCost = 0;    // --- NEW: Track cost of buys for this asset
        let totalBuyQuantity = 0; // --- NEW: Track quantity of buys for this asset

        // --- UPDATED: This inner loop now calculates cost basis as well ---
        for (const txn of transactions) {
          if (txn.assetId === assetId && new Date(txn.date).getTime() <= currentTimestamp) {
            const quantity = txn.quantity || 0;
            if (txn.type === 'buy') {
              currentQuantity += quantity;
              totalBuyQuantity += quantity;
              totalBuyCost += quantity * (txn.pricePerCoin || 0);
            } else if (txn.type === 'sell') {
              currentQuantity -= quantity;
            } else if (txn.type === 'transfer') {
              // Transfers in add to quantity but not cost basis
              currentQuantity += quantity;
            }
          }
        }

        if (currentQuantity > 0.0000001) {
          // --- NEW: Calculate the average buy price to determine the cost basis of the current holdings ---
          const averageBuyPrice = totalBuyQuantity > 0 ? totalBuyCost / totalBuyQuantity : 0;
          const assetCostBasis = currentQuantity * averageBuyPrice;
          totalCostBasis += assetCostBasis;

          const priceHistory = historicalPricesMap.get(assetId);
          const priceAtTime = findPriceAtTimestamp(priceHistory, currentTimestamp);
          totalPortfolioValue += currentQuantity * priceAtTime;
        }
      }
      
      const pnl = totalPortfolioValue - totalCostBasis; // --- NEW: The actual PNL calculation
      pnlHistory.push([currentTimestamp, pnl]);
      valueHistory.push([currentTimestamp, totalPortfolioValue]);
    }

    if (pnlHistory.length < 2) {
      return { statusCode: 200, body: JSON.stringify({ pnl: [], value: [], error: "Calculation took too long or API calls failed." }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pnl: pnlHistory, value: valueHistory }), // --- UPDATED: Return both PNL and total value
    };

  } catch (error) {
    console.error("Error in portfolio history calculation:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `An internal server error occurred: ${error.message}` }),
    };
  }
};