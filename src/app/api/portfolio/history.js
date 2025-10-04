import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// DEBUGGING: Catch any error that would otherwise crash the process
process.on('uncaughtException', (error) => {
  console.error('--- UNCAUGHT EXCEPTION ---');
  console.error(error);
  process.exit(1); // Exit gracefully
});

let db;
const initializeFirebase = () => {
  console.log('DEBUG: Attempting to initialize Firebase...');
  const firebaseKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!firebaseKey) {
    console.error('DEBUG: FIREBASE_SERVICE_ACCOUNT_KEY is NOT defined.');
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not defined.");
  }
  
  try {
    const serviceAccount = JSON.parse(firebaseKey);
    console.log(`DEBUG: Service account parsed. Project ID: ${serviceAccount.project_id}`);
    if (getApps().length === 0) {
      initializeApp({ credential: cert(serviceAccount) });
    }
    db = getFirestore();
    console.log('DEBUG: Firebase initialization and Firestore connection successful.');
  } catch (e) {
    console.error('DEBUG: CRITICAL ERROR during Firebase parsing or initialization.', e);
    throw e; // Re-throw to be caught by the handler's catch block
  }
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
  console.log('DEBUG: Handler started.'); // First line of execution
  
  if (request.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    if (!db) initializeFirebase();
  } catch (error) {
    console.error("DEBUG: Firebase Initialization Error caught in handler:", error.message);
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const { transactions, timeframe } = body;
    console.log(`DEBUG: Received ${transactions?.length || 0} transactions for timeframe ${timeframe}.`);

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(200).json({ prices: [], volumes: [] });
    }

    const CACHE_DURATION_SECONDS = 300;
    const cacheKey = `portfolio_${JSON.stringify(transactions)}_${timeframe}`;
    
    // DEBUG: Check for a very common Firestore error source
    console.log(`DEBUG: Generated cache key length: ${cacheKey.length}`);
    if (cacheKey.length > 1500) {
        console.error(`DEBUG: Cache key is too long (${cacheKey.length} bytes), which is not a valid Firestore document ID. This is likely the error.`);
        // Note: We are not stopping execution, just logging the warning.
        // A real fix would be to hash the key if it's too long.
    }

    const cacheRef = db.collection('portfolio_cache').doc(cacheKey);
    console.log('DEBUG: Cache reference created.');
    
    const doc = await cacheRef.get();
    if (doc.exists) {
      console.log('DEBUG: Cache hit. Returning cached data.');
      const { timestamp, jsonData } = doc.data();
      const ageSeconds = (Date.now() / 1000) - timestamp.seconds;
      if (ageSeconds < CACHE_DURATION_SECONDS) {
        return res.status(200).json(JSON.parse(jsonData));
      }
    }
    console.log('DEBUG: Cache miss or expired. Proceeding with calculation.');

    const coingeckoApiKey = process.env.COINGECKO_API_KEY;
    if (!coingeckoApiKey) throw new Error("COINGECKO_API_KEY is not defined.");
    
    const uniqueAssetIds = [...new Set(transactions.map(txn => txn.assetId))];
    const days = { '24H': 1, '7D': 7, '1M': 30, '3M': 90, '1Y': 365 }[timeframe] || 30;
    
    console.log(`DEBUG: Fetching historical data from CoinGecko for ${uniqueAssetIds.length} assets.`);
    const pricePromises = uniqueAssetIds.map(id => 
      fetch(`https://pro-api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`, {
        headers: { 'x-cg-pro-api-key': coingeckoApiKey },
      }).then(res => res.json())
    );
    const historicalDataResponses = await Promise.all(pricePromises);
    console.log('DEBUG: CoinGecko data fetched.');

    // ... [rest of the calculation logic is the same]
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
    console.log('DEBUG: Calculation complete. Caching result...');
    await cacheRef.set({
      jsonData: JSON.stringify(finalData),
      timestamp: new Date(),
    });
    console.log('DEBUG: Result cached. Sending response.');
    return res.status(200).json(finalData);

  } catch (error) {
    console.error("--- HANDLER ERROR ---");
    console.error(error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
}