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

  const cacheKey = `xrpl-enriched:${searchQuery.toLowerCase()}`;

  try {
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

    // 🔍 ADD THIS DEBUG BLOCK
    console.log('========================================');
    console.log('🔍 ONTHEDEX AGGREGATOR DEBUG');
    console.log('========================================');
    console.log('Total tokens from OnTheDex:', onthedexAggregatorData?.tokens?.length || 0);

    if (onthedexAggregatorData?.tokens) {
      // Check if specific tokens exist
      const soloToken = onthedexAggregatorData.tokens.find(t =>
        t.currency?.toLowerCase() === 'solo' || t.name?.toLowerCase().includes('sologenic')
      );
      const coreToken = onthedexAggregatorData.tokens.find(t =>
        t.currency?.toLowerCase() === 'core' || t.name?.toLowerCase().includes('coreum')
      );
      const dropToken = onthedexAggregatorData.tokens.find(t =>
        t.currency?.toLowerCase() === 'drop'
      );

      console.log('SOLO found:', !!soloToken, soloToken ? `(${soloToken.name})` : '');
      console.log('CORE found:', !!coreToken, coreToken ? `(${coreToken.name})` : '');
      console.log('DROP found:', !!dropToken, dropToken ? `(${dropToken.name})` : '');

      // Show a sample of what tokens ARE available
      console.log('Sample of available currencies:');
      onthedexAggregatorData.tokens.slice(0, 10).forEach(t => {
        console.log(`  - ${t.currency} (${t.name || 'N/A'})`);
      });
    }
    console.log('========================================');
    // 🔍 END DEBUG BLOCK

    if (!onthedexAggregatorData?.tokens) {
      console.error('❌ OnTheDex returned no tokens!');
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

    console.log(`🔍 Search for "${searchQuery}": Found ${searchResults.length} matches`);
    searchResults.forEach(t => {
      console.log(`  - ${t.currency} (${t.name || 'N/A'})`);
    });

    // 3. Sequentially enrich each result with CoinGecko data
    const enrichedResults = [];
    for (let i = 0; i < searchResults.length; i++) {
      const token = searchResults[i];

      if (i > 0) {
        await sleep(1200);
      }

      try {
        const enrichedToken = await enrichTokenWithCoinGecko(token);
        enrichedResults.push({
          ...enrichedToken,
          isXrpl: true,
          id: enrichedToken.id || `${token.currency}-${token.issuer}`,
          image: enrichedToken.large || enrichedToken.image || null,
          large: enrichedToken.large || null,
          thumb: enrichedToken.thumb || null
        });
        console.log(`[XRPL Enriched] ✓ Token "${token.currency}" enriched with isXrpl: true`);
      } catch (error) {
        console.error(`[XRPL Enriched] Failed to enrich token ${token.currency}:`, error);
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