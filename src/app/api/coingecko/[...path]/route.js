// app/api/coingecko/[...path]/route.js

import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// --- Firebase Admin SDK Initialization ---
// This ensures we only initialize the app once per function instance.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();
const CACHE_DURATION_SECONDS = 300; // Cache for 5 minutes

export async function GET(request, { params }) {
  const coingeckoApiKey = process.env.COINGECKO_API_KEY;
  if (!coingeckoApiKey) {
    console.error("FATAL ERROR: COINGECKO_API_KEY is not defined.");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Reconstruct the path and query from the request
  const endpointPath = params.path.join('/');
  const searchParams = request.nextUrl.search;

  // Create a stable cache key
  const cacheKey = `coingecko_${endpointPath.replace(/\//g, '_')}_${searchParams}`;
  const cacheRef = db.collection('api_cache').doc(cacheKey);

  try {
    // 1. Check the Firestore cache first
    const doc = await cacheRef.get();
    if (doc.exists) {
      const { timestamp, data } = doc.data();
      const ageSeconds = (Date.now() / 1000) - timestamp.seconds;
      if (ageSeconds < CACHE_DURATION_SECONDS) {
        // Return cached data
        return NextResponse.json(data);
      }
    }

    // 2. If not in cache or stale, fetch from CoinGecko
    const apiUrl = `https://pro-api.coingecko.com/api/v3/${endpointPath}${searchParams}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'x-cg-pro-api-key': coingeckoApiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();

    // 3. Save the new data to the Firestore cache
    await cacheRef.set({
      data: data,
      timestamp: new Date(),
    });

    // 4. Return the new data to the client
    return NextResponse.json(data);

  } catch (error) {
    console.error(`Error in CoinGecko proxy for endpoint "${endpointPath}":`, error.message);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}