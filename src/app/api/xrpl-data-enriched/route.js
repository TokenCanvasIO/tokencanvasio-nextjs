import { NextResponse } from 'next/server';
import redis from '../redis';
import {
  fetchOnthedexAggregator,
  enrichTokenWithCoinGecko
} from '../market-data-logic';

// Cache duration: 5 minutes
const CACHE_DURATION_SECONDS = 300;

// Helper function to add delay between requests
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('query');

  if (!searchQuery) {
    return NextResponse.json(
      { message: 'Search query parameter is required.' },
      { status: 400 }
    );
  }

  // Create cache key
  const cacheKey = `xrpl-enriched:${searchQuery.toLowerCase()}`;

  try {
    // Check cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`[XRPL Enriched] Cache hit for "${searchQuery}"`);
      return NextResponse.json(JSON.parse(cachedData), {
        headers: { 'X-Source': 'Redis-Cache' }
      });
    }

    console.log(`[XRPL Enriched] Cache miss for "${searchQuery}" - fetching fresh data`);

    // 1. Fetch the complete list of all tokens
    const onthedexAggregatorData = await fetchOnthedexAggregator();

    if (!onthedexAggregatorData?.tokens) {
      return NextResponse.json([], {
        headers: { 'X-Source': 'Live-Fetch-Empty' }
      });
    }

    // 2. Filter the list to find potential matches
    const term = searchQuery.toLowerCase();
    const searchResults = onthedexAggregatorData.tokens.filter(token => {
      const currencyMatch = token.currency?.toLowerCase().includes(term);
      const nameMatch = token.name?.toLowerCase().includes(term);
      const pairNameMatch = token.dex?.pairs?.some(pair =>
        pair.name?.toLowerCase().includes(term)
      );
      return currencyMatch || nameMatch || pairNameMatch;
    }).slice(0, 20); // Limit to 20 results

    console.log(`[XRPL Enriched] Found ${searchResults.length} matching tokens`);

    // 3. Sequentially enrich each result with CoinGecko data
    const enrichedResults = [];
    for (let i = 0; i < searchResults.length; i++) {
      const token = searchResults[i];

      // Wait 1.2 seconds between requests (except for the first one)
      if (i > 0) {
        await sleep(1200);
      }

      try {
        const enrichedToken = await enrichTokenWithCoinGecko(token);
        
        // ✅ CRITICAL FIX: isXrpl MUST come AFTER the spread to prevent overwriting
        enrichedResults.push({
          ...enrichedToken,
          isXrpl: true,  // ← This MUST be after the spread
          id: enrichedToken.id || `${token.currency}-${token.issuer}`,
          image: enrichedToken.large || enrichedToken.image || null,
          large: enrichedToken.large || null,
          thumb: enrichedToken.thumb || null
        });
        
        console.log(`[XRPL Enriched] ✓ Token "${token.currency}" enriched with isXrpl: true`);
      } catch (error) {
        console.error(`[XRPL Enriched] Failed to enrich token ${token.currency}:`, error);
        
        // On error, still add the token with isXrpl flag
        enrichedResults.push({
          ...token,
          isXrpl: true,
          id: `${token.currency}-${token.issuer}`,
          large: null,
          image: null,
          thumb: null,
          market_cap_rank: null
        });
      }
    }

    console.log(`[XRPL Enriched] Successfully enriched ${enrichedResults.length} tokens`);
    
    // Debug: Log first result to verify isXrpl flag
    if (enrichedResults.length > 0) {
      console.log(`[XRPL Enriched] First result check:`, {
        name: enrichedResults[0].name,
        isXrpl: enrichedResults[0].isXrpl,
        hasImage: !!enrichedResults[0].image,
        issuer: enrichedResults[0].issuer
      });
    }

    // 4. Cache the results for 5 minutes
    await redis.set(cacheKey, JSON.stringify(enrichedResults), 'EX', CACHE_DURATION_SECONDS);

    // 5. Return the enriched results
    return NextResponse.json(enrichedResults, {
      headers: { 'X-Source': 'Live-Fetch' }
    });
  } catch (error) {
    console.error('[XRPL Enriched] Error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.', error: error.message },
      { status: 500 }
    );
  }
}