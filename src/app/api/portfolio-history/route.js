import { NextResponse } from 'next/server';

// NOTE: We don't need 'node-fetch' as Next.js provides it globally.

// --- PERFORMANCE CONFIGURATION ---
const TIMEOUT_THRESHOLD_MS = 1500; // Note: This is less effective in Next.js runtime
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
    
    // CHANGED: Using the Pro API key as a query parameter for reliability
    const urlWithKey = `${url}&x_cg_pro_api_key=${apiKey}`;

    return fetch(urlWithKey)
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

// CHANGED: Using the Next.js App Router export for the POST method
export async function POST(request) {
  const coingeckoApiKey = process.env.COINGECKO_API_KEY;
  if (!coingeckoApiKey) {
    console.error("FATAL: COINGECKO_API_KEY environment variable was not found or is empty.");
    return NextResponse.json({ message: 'Server configuration error: API key is missing.' }, { status: 500 });
  }

  try {
    // CHANGED: Getting the body from the Next.js request object
    const { transactions, timeframe } = await request.json();

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ pnl: [], value: [], cost: [] }, { status: 200 });
    }

    const firstTransactionTimestamp = transactions.reduce((earliest, txn) => {
        const txnTimestamp = new Date(txn.date).getTime();
        return Math.min(earliest, txnTimestamp);
    }, Date.now());

    const daysMap = { '24h': 1, '7d': 7, '30d': 30, '3m': 90, '1y': 365, 'all': 'max' };
    const days = daysMap[timeframe.toLowerCase()] || 365;

    let startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    if (startDate.getTime() < firstTransactionTimestamp) {
        startDate = new Date(firstTransactionTimestamp);
    }
    if (days === 'max') {
        startDate = new Date(firstTransactionTimestamp);
    }
    
    const endDate = new Date();
    if (startDate.getTime() >= endDate.getTime()) {
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    }
    
    const adjustedDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const uniqueAssetIds = [...new Set(transactions.map(t => t.assetId))];
    const historicalPricesMap = await fetchHistoricalPrices(uniqueAssetIds, adjustedDays > 0 ? adjustedDays : 1, coingeckoApiKey);

    const pnlHistory = [];
    const valueHistory = [];
    const costHistory = [];
    const step = (endDate.getTime() - startDate.getTime()) / MAX_DATA_POINTS;

    for (let i = 0; i <= MAX_DATA_POINTS; i++) {
      // NOTE: context.getRemainingTimeInMillis() is not available in Next.js runtime.
      // This timeout check is removed. For long-running functions, consider Vercel's Hobby plan or higher.
      const currentTimestamp = startDate.getTime() + (i * step);
      let totalPortfolioValue = 0;
      let totalCostBasis = 0;

      for (const assetId of uniqueAssetIds) {
        let currentQuantity = 0;
        let totalBuyCost = 0;
        let totalBuyQuantity = 0;

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
              currentQuantity += quantity;
            }
          }
        }

        if (currentQuantity > 0.0000001) {
          const averageBuyPrice = totalBuyQuantity > 0 ? totalBuyCost / totalBuyQuantity : 0;
          const assetCostBasis = currentQuantity * averageBuyPrice;
          totalCostBasis += assetCostBasis;

          const priceHistory = historicalPricesMap.get(assetId);
          const priceAtTime = findPriceAtTimestamp(priceHistory, currentTimestamp);
          totalPortfolioValue += currentQuantity * priceAtTime;
        }
      }
      
      let pnl = totalPortfolioValue - totalCostBasis;
      
      if (i === 0) {
        pnl = 0;
      }

      pnlHistory.push([currentTimestamp, pnl]);
      valueHistory.push([currentTimestamp, totalPortfolioValue]);
      costHistory.push([currentTimestamp, totalCostBasis]);
    }

    if (pnlHistory.length < 2) {
      return NextResponse.json({ pnl: [], value: [], cost: [], error: "Not enough data to render chart." }, { status: 200 });
    }

    // CHANGED: Using NextResponse to send the JSON response
    return NextResponse.json({ pnl: pnlHistory, value: valueHistory, cost: costHistory }, { status: 200 });

  } catch (error) {
    console.error("Error in portfolio history calculation:", error);
    return NextResponse.json({ message: `An internal server error occurred: ${error.message}` }, { status: 500 });
  }
}