import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
// 1. Import our new NFT fetcher function
import { fetchNftsForAccount } from '@/lib/xrpl-nft-logic';

const CACHE_DURATION_SECONDS = 300; 

export async function GET(request) {
  const cacheKey = 'xrpl-smart-aggregator-data';

  try {
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      const data = JSON.parse(cachedData);
      const response = NextResponse.json(data);
      response.headers.set('X-Source', 'Redis-Cache');
      return response;
    }

    // 2. Fetch the live NFT data using our new function
    // For now, we are hardcoding the test account.
    const testAccount = 'rsLFad8YFVeyycCSDZFhQjDkXynHM5Ct7o';
    const nftData = await fetchNftsForAccount(testAccount);

    const liveData = {
      message: "This is live data from the Smart Aggregator.",
      timestamp: new Date().toISOString(),
      // 3. Add the fetched NFT data to our response object
      nfts: nftData, 
    };

    await redis.set(cacheKey, JSON.stringify(liveData), 'EX', CACHE_DURATION_SECONDS);

    const response = NextResponse.json(liveData);
    response.headers.set('X-Source', 'Live-Fetch');
    return response;

  } catch (error) {
    console.error('Error in /api/xrpl-data:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' }, 
      { status: 500 }
    );
  }
}