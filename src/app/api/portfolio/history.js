const fetch = require('node-fetch');

// --- CONFIGURATION ---
const TIMEOUT_THRESHOLD_MS = 1000; // Stop processing 1 sec before Netlify's limit
const MAX_DATA_POINTS = 120; // How many points to calculate for the chart

// Helper function to get the start date based on the timeframe
const getStartDate = (timeframe) => {
  const now = new Date();
  const daysMap = { '24H': 1, '7D': 7, '1M': 30, '3M': 90, '1Y': 365, 'All': 1825 }; // 'All' is 5 years
  const days = daysMap[timeframe] || 365;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
};

// Fetches historical price data for a list of assets from CoinGecko
const fetchHistoricalPrices = async (assetIds, days) => {
  const pricePromises = assetIds.map(id => {
    const coingeckoId = id === 'xrp' ? 'ripple' : id;
    const url = `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
    return fetch(url)
      .then(res => res.json())
      .then(data => ({ id, prices: data.prices || [] }))
      .catch(error => {
        console.warn(`Failed to fetch history for asset: ${id}`, error);
        return { id, prices: [] }; // Return empty array on failure
      });
  });
  
  const results = await Promise.all(pricePromises);
  const priceMap = new Map();
  results.forEach(result => priceMap.set(result.id, result.prices));
  return priceMap;
};

// Finds the closest price for an asset at a specific timestamp
const findPriceAtTimestamp = (priceHistory, timestamp) => {
  if (!priceHistory || priceHistory.length === 0) return 0;
  // Find the last known price before or at the given timestamp
  let closestPrice = 0;
  for (const [ts, price] of priceHistory) {
    if (ts <= timestamp) {
      closestPrice = price;
    } else {
      break; // Prices are sorted, so we can stop
    }
  }
  return closestPrice;
};


// --- MAIN FUNCTION HANDLER FOR NETLIFY ---
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  let transactions;
  let timeframe;
  try {
    const body = JSON.parse(event.body);
    transactions = body.transactions;
    timeframe = body.timeframe;
    if (!Array.isArray(transactions)) {
      throw new Error('"transactions" must be an array.');
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return { statusCode: 400, body: JSON.stringify({ message: 'Invalid request body.', error: error.message }) };
  }
  
  // If there are no transactions, return an empty chart
  if (transactions.length === 0) {
    return { statusCode: 200, body: JSON.stringify({ prices: [], volumes: [] }) };
  }

  try {
    const startDate = getStartDate(timeframe);
    const endDate = new Date();
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // 1. Get unique asset IDs and fetch all price histories in parallel
    const uniqueAssetIds = [...new Set(transactions.map(t => t.assetId))];
    const historicalPricesMap = await fetchHistoricalPrices(uniqueAssetIds, days);

    // 2. Calculate portfolio value at different points in time
    const chartData = [];
    const step = (endDate.getTime() - startDate.getTime()) / MAX_DATA_POINTS;

    for (let i = 0; i <= MAX_DATA_POINTS; i++) {
      // --- CRITICAL TIMEOUT PROTECTION ---
      if (context.getRemainingTimeInMillis() < TIMEOUT_THRESHOLD_MS) {
        console.warn('Approaching timeout, returning partial data.');
        break; // Exit the loop to avoid a 502 error
      }

      const currentTimestamp = startDate.getTime() + (i * step);
      let totalPortfolioValue = 0;

      // For each asset we hold...
      for (const assetId of uniqueAssetIds) {
        let currentQuantity = 0;
        // ...calculate the quantity based on transactions up to this point in time
        for (const txn of transactions) {
          if (txn.assetId === assetId && new Date(txn.date).getTime() <= currentTimestamp) {
            if (txn.type === 'buy' || txn.type === 'transfer') {
              currentQuantity += txn.quantity;
            } else if (txn.type === 'sell') {
              currentQuantity -= txn.quantity;
            }
          }
        }

        if (currentQuantity > 0) {
          const priceHistory = historicalPricesMap.get(assetId);
          const priceAtTime = findPriceAtTimestamp(priceHistory, currentTimestamp);
          totalPortfolioValue += currentQuantity * priceAtTime;
        }
      }
      chartData.push([currentTimestamp, totalPortfolioValue]);
    }
    
    // Return the calculated data
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prices: chartData, volumes: [] }), // Volumes are not calculated for simplicity
    };

  } catch (error) {
    console.error('Error during portfolio calculation:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'An error occurred during calculation.', error: error.message }),
    };
  }
};