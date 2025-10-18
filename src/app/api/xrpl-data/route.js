import { NextResponse } from 'next/server';
import redis from '../redis';
import { fetchNftsForAccount } from '../xrpl-nft-logic';
import { 
  fetchOnthedexAggregator,
  fetchXrpscanTokenomics
} from '../market-data-logic';

const CACHE_DURATION_SECONDS = 300; 

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('search');
  const tokenomicsToken = searchParams.get('tokenomics');

  const cacheKey = `xrpl-aggregator-v5-final:${searchQuery || ''}:${tokenomicsToken || ''}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData), { headers: { 'X-Source': 'Redis-Cache' } });
    }

    const testAccount = 'rsLFad8YFVeyycCSDZFhQjDkXynHM5Ct7o';

    const [
      processedNftData,
      onthedexAggregatorData,
      tokenomicsData
    ] = await Promise.all([
      fetchNftsForAccount(testAccount),
      fetchOnthedexAggregator(),
      fetchXrpscanTokenomics(tokenomicsToken)
    ]);

    // THIS IS THE FIX: Perform search filtering on the backend.
    let searchResults = null;
    if (searchQuery && onthedexAggregatorData?.tokens) {
      const searchTerm = searchQuery.toLowerCase();
      searchResults = onthedexAggregatorData.tokens.filter(token => 
        token.name?.toLowerCase().includes(searchTerm) || 
        token.currency?.toLowerCase().includes(searchTerm)
      ).slice(0, 50); // Limit to 50 results
    }

    const liveData = {
      timestamp: new Date().toISOString(),
      nfts: processedNftData,
      // All market data is now from the reliable aggregator endpoint
      market_data: onthedexAggregatorData, 
      search_results: searchResults,
      tokenomics: tokenomicsData
    };

    await redis.set(cacheKey, JSON.stringify(liveData), 'EX', CACHE_DURATION_SECONDS);

    return NextResponse.json(liveData, { headers: { 'X-Source': 'Live-Fetch' } });

  } catch (error) {
    console.error('Error in /api/xrpl-data:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}