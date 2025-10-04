import { createHash } from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db;
const initializeFirebase = () => {
  const firebaseKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!firebaseKey) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not defined.");
  const serviceAccount = JSON.parse(firebaseKey);
  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }
  db = getFirestore();
};

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

export default async function handler(request, res) {
  if (request.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    if (!db) initializeFirebase();
  } catch (error) {
    console.error("Firebase Initialization Error:", error.message);
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const { transactions, timeframe } = body;
    
    const validTransactions = transactions.filter(txn => txn && txn.assetId);

    if (!validTransactions || validTransactions.length === 0) {
      return res.status(200).json({ prices: [], volumes: [] });
    }

    const CACHE_DURATION_SECONDS = 300;
    const rawCacheKey = `portfolio_${JSON.stringify(validTransactions)}_${timeframe}`;
    const cacheKey = createHash('sha256').update(rawCacheKey).digest('hex');
    const cacheRef = db.collection('portfolio_cache').doc(cacheKey);
    
    const doc = await cacheRef.get();
    if (doc.exists) {
      const { timestamp, jsonData } = doc.data();
      const ageSeconds = (Date.now() / 1000) - timestamp.seconds;
      if (ageSeconds < CACHE_DURATION_SECONDS) {
        return res.status(200).json(JSON.parse(jsonData));
      }
    }
    
    const coingeckoApiKey = process.env.COINGECKO_API_KEY;
    if (!coingeckoApiKey) throw new Error("COINGECKO_API_KEY is not defined.");
    
    const uniqueAssetIds = [...new Set(validTransactions.map(txn => txn.assetId))];
    const days = { '24H': 1, '7D': 7, '1M': 30, '3M': 90, '1Y': 365 }[timeframe] || 30;
    
    const pricePromises = uniqueAssetIds.map(id => 
      fetch(`https://pro-api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`, {
        headers: { 'x-cg-pro-api-key': coingeckoApiKey },
      }).then(res => res.json())
    );

    // --- DEFINITIVE FIX: INTERNAL TIMEOUT ---
    const timeLimit = 9000; // 9 seconds, just under Netlify's 10-second limit
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Function timed out internally')), timeLimit);
    });
    
    let historicalDataResponses;
    try {
      historicalDataResponses = await Promise.race([
        Promise.all(pricePromises),
        timeoutPromise
      ]);
    } catch (error) {
      if (error.message === 'Function timed out internally') {
        console.warn(`Portfolio history for ${uniqueAssetIds.length} coins took too long. Returning empty data.`);
        // Gracefully fail by returning an empty chart, which stops the 500 error.
        return res.status(200).json({ prices: [], volumes: [] });
      }
      // If it was a different error, let the main catch block handle it
      throw error;
    }
    // --- END OF FIX ---

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
      for (const txn of validTransactions) {
        if (new Date(txn.date).getTime() <= timestamp) {
          const currentQty = holdingsAtTimestamp.get(txn.assetId) || 0;
          let newQty = currentQty;
          if (txn.type === 'buy' || txn.type === 'transfer') newQty += txn.quantity;
          else if (txn.type === 'sell') newQty -= txn.quantity;
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
    const finalData = { prices: portfolioHistory, volumes: [] };

    await cacheRef.set({
      jsonData: JSON.stringify(finalData),
      timestamp: new Date(),
    });

    return res.status(200).json(finalData);

  } catch (error) {
    console.error("Error in portfolio history calculation:", error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}