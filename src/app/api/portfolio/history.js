import { NextResponse } from 'next/server';

/**
 * Finds the closest price data point from a sorted array for a given timestamp.
 * @param {Array<[number, number]>} priceData - A sorted array of [timestamp, price] tuples.
 * @param {number} targetTimestamp - The timestamp to find the closest price for.
 * @returns {number} The closest price.
 */
const findClosestPrice = (priceData, targetTimestamp) => {
  if (!priceData || priceData.length === 0) return 0;
  
  // A binary search would be more performant, but a linear scan is simpler and effective for this data size.
  let closest = priceData[0];
  let minDiff = Math.abs(targetTimestamp - closest[0]);

  for (let i = 1; i < priceData.length; i++) {
    const diff = Math.abs(targetTimestamp - priceData[i][0]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = priceData[i];
    }
  }
  return closest[1]; // Return the price part of the tuple
};


export async function POST(request) {
  const coingeckoApiKey = process.env.COINGECKO_API_KEY;
  if (!coingeckoApiKey) {
    console.error("FATAL: COINGECKO_API_KEY is not defined in environment variables.");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { transactions, timeframe } = await request.json();

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ prices: [], volumes: [] });
    }

    // --- Step 1: Get unique asset IDs and fetch all required historical data ---
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

    // --- Step 2: Calculate the portfolio's value over time ---
    const portfolioHistory = [];
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;
    
    // Define calculation interval: hourly for up to 90 days, daily for a year
    const interval = days <= 90 ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    for (let timestamp = startTime; timestamp <= now; timestamp += interval) {
      let totalValueForTimestamp = 0;
      const holdingsAtTimestamp = new Map();

      // Determine user's holdings at this specific point in the past
      for (const txn of transactions) {
        if (new Date(txn.date).getTime() <= timestamp) {
          const currentQty = holdingsAtTimestamp.get(txn.assetId) || 0;
          const newQty = txn.type === 'buy' ? currentQty + txn.quantity : currentQty - txn.quantity;
          holdingsAtTimestamp.set(txn.assetId, newQty);
        }
      }

      // Calculate total portfolio value at that point in the past
      for (const [assetId, quantity] of holdingsAtTimestamp.entries()) {
        if (quantity > 0) {
          const priceData = historicalDataMap.get(assetId);
          if (priceData) {
            const price = findClosestPrice(priceData, timestamp);
            totalValueForTimestamp += quantity * price;
          }
        }
      }
      
      // Add data point to our chart array, but only if there's value
      if (totalValueForTimestamp > 0 || portfolioHistory.length > 0) {
         portfolioHistory.push([timestamp, totalValueForTimestamp]);
      }
    }

    // Return the final data set, ready for the chart
    return NextResponse.json({ prices: portfolioHistory, volumes: [] });

  } catch (error) {
    console.error("Error in portfolio history calculation:", error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}