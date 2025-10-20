import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const CACHE_DURATION_SECONDS = 300; // 5 minutes
const COINGECKO_BASE_URL = 'https://pro-api.coingecko.com/api/v3';

// Simple Redis REST API client
class RedisCache {
  constructor(url, token) {
    this.url = url;
    this.token = token;
  }

  async get(key) {
    const response = await fetch(`${this.url}/get/${key}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.result;
  }

  async set(key, value, expirySeconds) {
    await fetch(`${this.url}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value, ex: expirySeconds }),
    });
  }
}

export async function GET(request, { params }) {
  // Validate environment variables
  const coingeckoApiKey = process.env.COINGECKO_API_KEY;
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!coingeckoApiKey) {
    return NextResponse.json(
      { error: 'Server configuration error (CoinGecko)' },
      { status: 500 }
    );
  }

  if (!redisUrl || !redisToken) {
    return NextResponse.json(
      { error: 'Server configuration error (Redis)' },
      { status: 500 }
    );
  }

  const cache = new RedisCache(redisUrl, redisToken);
  const endpointPath = params.path.join('/');
  const searchParams = request.nextUrl.search;
  
  // Generate cache key
  const cacheKey = `coingecko:${endpointPath}:${searchParams}`;

  try {
    // Check cache first
    const cachedData = await cache.get(cacheKey);
    
    if (cachedData) {
      const response = NextResponse.json(JSON.parse(cachedData));
      response.headers.set('X-Source', 'Edge-API-V3.0-Cache');
      return response;
    }

    // Fetch from CoinGecko
    const apiUrl = `${COINGECKO_BASE_URL}/${endpointPath}${searchParams}`;
    
    const apiResponse = await fetch(apiUrl, {
      headers: { 'x-cg-pro-api-key': coingeckoApiKey },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: 'CoinGecko API error', details: errorText };
      }
      
      return NextResponse.json(errorData, { status: apiResponse.status });
    }

    const data = await apiResponse.json();

    // Cache the response (fire and forget)
    cache.set(cacheKey, JSON.stringify(data), CACHE_DURATION_SECONDS).catch(error => {
      console.error("Cache write error (non-blocking):", error);
    });

    const response = NextResponse.json(data);
    response.headers.set('X-Source', 'Edge-API-V3.0-Live');
    return response;

  } catch (error) {
    console.error(`Error in CoinGecko proxy for endpoint "${endpointPath}":`, error);
    
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}