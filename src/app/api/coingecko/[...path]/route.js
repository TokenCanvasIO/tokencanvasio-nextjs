import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db;

// The sanitizeForFirestore function is no longer needed with this new approach.

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
      // --- UPDATED: Read the string from the cache ---
      const { timestamp, jsonData } = doc.data();
      const ageSeconds = (Date.now() / 1000) - timestamp.seconds;

      if (ageSeconds < CACHE_DURATION_SECONDS) {
        // --- UPDATED: Parse the string back into JSON before sending ---
        const data = JSON.parse(jsonData);
        const response = NextResponse.json(data);
        // Version bump for definitive testing
        response.headers.set('X-Source', 'NextJS-API-V2.2-Cache'); 
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

    // --- UPDATED: Convert the entire data object to a string before saving ---
    // This bypasses Firestore's validation and guarantees the save will work.
    await cacheRef.set({
      jsonData: JSON.stringify(data),
      timestamp: new Date(),
    });

    const response = NextResponse.json(data);
    // Version bump for definitive testing
    response.headers.set('X-Source', 'NextJS-API-V2.2-Live');
    return response;

  } catch (error) {
    console.error(`Error in CoinGecko proxy for endpoint "${endpointPath}":`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
