import { NextResponse } from 'next/server';
import redis from '../redis';
import { fetchNftsForAccount } from '../xrpl-nft-logic';
import {
  fetchOnthedexAggregator,
  fetchXrpscanTokenomics,
  enrichTokenWithCoinGecko
} from '../market-data-logic';

const CACHE_DURATION_SECONDS = 300;

// Helper function to add delay between requests
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('search');
  const tokenomicsToken = searchParams.get('tokenomics');
  
  const cacheKey = `xrpl-aggregator-enriched-v1:${searchQuery || ''}:${tokenomicsToken || ''}`;
  
  try {
    // Check cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData), { 
        headers: { 'X-Source': 'Redis-Cache' } 
      });
    }
    
    const testAccount = 'rsLFad8YFVeyycCSDZFhQjDkXynHM5Ct7o';
    
    // Fetch base data
    const [
      processedNftData,
      onthedexAggregatorData,
      tokenomicsData
    ] = await Promise.all([
      fetchNftsForAccount(testAccount),
      fetchOnthedexAggregator(),
      fetchXrpscanTokenomics(tokenomicsToken)
    ]);
    
    // Filter search results
    let searchResults = null;
    if (searchQuery && onthedexAggregatorData?.tokens) {
      const term = searchQuery.toLowerCase();
      searchResults = onthedexAggregatorData.tokens.filter(token => {
        const currencyMatch = token.currency?.toLowerCase().includes(term);
        const nameMatch = token.name?.toLowerCase().includes(term);
        const pairNameMatch = token.dex?.pairs?.some(pair => 
          pair.name?.toLowerCase().includes(term)
        );
        return currencyMatch || nameMatch || pairNameMatch;
      }).slice(0, 20); // Limit to 20 for enrichment performance
      
      // === ENRICH EACH RESULT WITH COINGECKO DATA ===
      const enrichedResults = [];
      
      for (const token of searchResults) {
        // Wait 1.2 seconds between CoinGecko requests to avoid rate limiting
        if (enrichedResults.length > 0) {
          await sleep(1200);
        }
        
        try {
          const enrichedToken = await enrichTokenWithCoinGecko(token);
  
          // ✅ CRITICAL FIX: Force isXrpl and other properties AFTER spreading
          enrichedResults.push({
            ...enrichedToken,
            isXrpl: true,
            id: enrichedToken.id || `${token.currency}-${token.issuer}`,
            image: enrichedToken.large || enrichedToken.image || null,
            large: enrichedToken.large || null,
            thumb: enrichedToken.thumb || null
          });

          console.log(`[XRPL Data] ✓ Token "${token.currency}" enriched with isXrpl: true`);

        } catch (error) {
          console.error(`Failed to enrich token ${token.currency}:`, error); 
          // Add token without enrichment on failure
          enrichedResults.push({
            ...token,
            id: `${token.currency}-${token.issuer}`,
            large: null,
            image: null,
            thumb: null,
            market_cap_rank: null,
            isXrpl: true
          });
        }
      }
      
      searchResults = enrichedResults;
    }
    
    const liveData = {
      timestamp: new Date().toISOString(),
      nfts: processedNftData,
      market_data: onthedexAggregatorData,
      search_results: searchResults,
      tokenomics: tokenomicsData
    };
    
    // Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(liveData), 'EX', CACHE_DURATION_SECONDS);
    
    return NextResponse.json(liveData, { 
      headers: { 'X-Source': 'Live-Fetch' } 
    });
    
  } catch (error) {
    console.error('Error in /api/xrpl-data:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' }, 
      { status: 500 }
    );
  }
}