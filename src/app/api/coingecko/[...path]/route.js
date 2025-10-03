// app/api/coingecko/[...path]/route.js

import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// We will initialize Firebase inside the handler to ensure environment variables are available.
let db;

const initializeFirebase = () => {
  const firebaseKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!firebaseKey) {
    throw new Error("FATAL ERROR: FIREBASE_SERVICE_ACCOUNT_KEY is not defined.");
  }
  
  const serviceAccount = JSON.parse(firebaseKey);

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  db = getFirestore();
};


const CACHE_DURATION_SECONDS = 300; // Cache for 5 minutes

export async function GET(request, { params }) {
  // --- UPDATED: All initialization logic is now safely inside the handler ---
  try {
    // Initialize Firebase only on the first run of the function instance.
    if (!db) {
      initializeFirebase();
    }
  } catch (error) {
    console.error("Firebase Initialization Error:", error.message);
    return NextResponse.json({ error: 'Server configuration error (Firebase)' }, { status: 500 });
  }

  const coingeckoApiKey = process.env.COINGECKO_API_KEY;
  if (!coingeckoApiKey) {
    console.error("FATAL ERROR: COINGECKO_API_KEY is not defined.");
    return NextResponse.json({ error: 'Server configuration error (CoinGecko)' }, { status: 500 });
  }

  const endpointPath = params.path.join('/');
  const searchParams = request.nextUrl.search;

  const cacheKey = `coingecko_${endpointPath.replace(/\//g, '_')}_${searchParams}`;
  const cacheRef = db.collection('api_cache').doc(cacheKey);

  try {
    const doc = await cacheRef.get();
    if (doc.exists) {
      const { timestamp, data } = doc.data();
      const ageSeconds = (Date.now() / 1000) - timestamp.seconds;
      if (ageSeconds < CACHE_DURATION_SECONDS) {
        return NextResponse.json(data);
      }
    }

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

    await cacheRef.set({
      data: data,
      timestamp: new Date(),
    });

    return NextResponse.json(data);

  } catch (error) {
    console.error(`Error in CoinGecko proxy for endpoint "${endpointPath}":`, error.message);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}