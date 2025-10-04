// This is the corrected version for Netlify

// Helper function to find the closest price (remains the same)
const findClosestPrice = (priceData, targetTimestamp) => {
  if (!priceData || priceData.length === 0) return 0;
  let closest = priceData[0];
  let minDiff = Math.abs(targetTimestamp - closest[0]);
  for (let i = 1; i < priceData.length; i++) {
    const diff = Math.abs(targetTimestamp - priceData[i][0]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = priceData[i];
    }
  }
  return closest[1];
};

// --- THIS IS THE NETLIFY-SPECIFIC CHANGE ---
// We export a single 'handler' function instead of separate methods.
export default async function handler(request, res) {
  // We check the method inside the handler.
  if (request.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const coingeckoApiKey = process.env.COINGECKO_API_KEY;
  if (!coingeckoApiKey) {
    console.error("FATAL: COINGECKO_API_KEY is not defined.");
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const { transactions, timeframe } = JSON.parse(request.body);

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      res.status(200).json({ prices: [], volumes: [] });
      return;
    }

    const uniqueAssetIds = [...new Set(transactions.map(txn => txn.assetId))];
    const days = { '24H': 1, '7D': 7, '1M': 30, '3M': 90, '1Y': 365 }[timeframe] || 30;
    
    const pricePromises = uniqueAssetIds.map(id => 
      fetch(`https://pro-api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`, {
        headers: { 'x-cg-pro-api-key': coingeckoApiKey },
      }).then(res => res.json())
    );

    const historicalDataResponses = await Promise.all(pricePromises);
    const historicalDataMap = new Map();
    uniqueAssetIds.forEach((id, index) => {
      if (historicalDataResponses[index]?.prices) {
        historicalDataMap.set(id, historicalDataResponses[index].prices);
      }
    });

    const portfolioHistory = [];
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;
    const interval = days <= 90 ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    for (let timestamp = startTime; timestamp <= now; timestamp += interval) {
      let totalValueForTimestamp = 0;
      const holdingsAtTimestamp = new Map();

      for (const txn of transactions) {
        if (new Date(txn.date).getTime() <= timestamp) {
          const currentQty = holdingsAtTimestamp.get(txn.assetId) || 0;
          const newQty = txn.type === 'buy' ? currentQty + txn.quantity : currentQty - txn.quantity;
          holdingsAtTimestamp.set(txn.assetId, newQty);
        }
      }

      for (const [assetId, quantity] of holdingsAtTimestamp.entries()) {
        if (quantity > 0) {
          const priceData = historicalDataMap.get(assetId);
          if (priceData) {
            const price = findClosestPrice(priceData, timestamp);
            totalValueForTimestamp += quantity * price;
          }
        }
      }
      
      if (totalValueForTimestamp > 0 || portfolioHistory.length > 0) {
         portfolioHistory.push([timestamp, totalValueForTimestamp]);
      }
    }

    res.status(200).json({ prices: portfolioHistory, volumes: [] });

  } catch (error) {
    console.error("Error in portfolio history calculation:", error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
}