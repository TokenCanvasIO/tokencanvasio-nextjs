// app/api/coingecko/[...path]/route.js

import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db;

// --- ADDED: Helper function to clean data for Firestore ---
// This function recursively removes any keys with 'undefined' values.
const sanitizeForFirestore = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }

  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value !== undefined) {
        newObj[key] = sanitizeForFirestore(value);
      }
    }
  }
  return newObj;
};


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

const CACHE_DURATION_SECONDS = 300;

export async function GET(request, { params }) {
  try {
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
        const response = NextResponse.json(data);
        response.headers.set('X-Source', 'NextJS-API-V2-Cache');
        return response;
      }
    }

    const apiUrl = `https://pro-api.coingecko.com/api/v3/${endpointPath}${searchParams}`;
    
    const apiResponse = await fetch(apiUrl, {
      headers: { 'x-cg-pro-api-key': coingeckoApiKey },
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return NextResponse.json(errorData, { status: apiResponse.status });
    }

    const data = await apiResponse.json();

    // --- UPDATED: Sanitize the data before saving it to the cache ---
    const sanitizedData = sanitizeForFirestore(data);
    await cacheRef.set({
      data: sanitizedData,
      timestamp: new Date(),
    });

    const response = NextResponse.json(data);
    // --- UPDATED VERSION TAG ---
    response.headers.set('X-Source', 'NextJS-API-V2.1-Live');
    return response;

  } catch (error) {
    console.error(`Error in CoinGecko proxy for endpoint "${endpointPath}":`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}