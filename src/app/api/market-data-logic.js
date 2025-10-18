const ONTHEDEX_API_URL = 'https://api.onthedex.live/public/v1';
const XRPSCAN_API_URL = 'https://api.xrpscan.com/api/v1';
const COINGECKO_PUBLIC_API = 'https://api.coingecko.com/api/v3';

/**
 * Fetches the full aggregator data from OnTheDex
 * Returns all XRPL tokens with their market data
 */
export async function fetchOnthedexAggregator() {
  try {
    const response = await fetch(`${ONTHEDEX_API_URL}/aggregator`, { 
      cache: 'no-store' 
    });
    if (!response.ok) {
      console.error(`[OnTheDex Aggregator] HTTP ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('[OnTheDex Aggregator] Error:', error);
    return null;
  }
}

/**
 * Fetches tokenomics data from XRPScan for a specific token
 * @param {string} tokenString - Format: "issuer.currency" (e.g., "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz.solo")
 */
export async function fetchXrpscanTokenomics(tokenString) {
  if (!tokenString) return null;
  
  const [issuer, currency] = tokenString.split('.');
  if (!issuer || !currency) {
    console.warn(`[XRPScan] Invalid token string format: ${tokenString}`);
    return null;
  }
  
  try {
    const url = `${XRPSCAN_API_URL}/token/${currency}.${issuer}`;
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.warn(`[XRPScan] HTTP ${response.status} for token ${tokenString}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[XRPScan] Error for token ${tokenString}:`, error);
    return null;
  }
}

/**
 * Searches for tokens on OnTheDex
 * @param {string} query - Search term
 * NOTE: This function is currently unused. The main route filters aggregator data instead.
 */
export async function fetchOnthedexSearchResults(query) {
  if (!query) return [];
  
  try {
    const url = `${ONTHEDEX_API_URL}/token/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      console.warn(`[OnTheDex Search] HTTP ${response.status} for query: ${query}`);
      return [];
    }
    
    const data = await response.json();
    return data.tokens || [];
  } catch (error) {
    console.error(`[OnTheDex Search] Error for query ${query}:`, error);
    return [];
  }
}

/**
 * CRITICAL FUNCTION: Enriches an XRPL token with CoinGecko data (logo, ID, rank)
 * This is called by the backend route for each search result
 * 
 * @param {Object} xrplToken - Raw XRPL token from OnTheDex aggregator
 * @returns {Object} Enriched token with CoinGecko data (or fallback data if enrichment fails)
 */
export async function enrichTokenWithCoinGecko(xrplToken) {
  // Validate input
  if (!xrplToken?.currency) {
    console.warn('[CoinGecko Enrichment] Invalid token: missing currency', xrplToken);
    return {
      ...xrplToken,
      id: `unknown-${Date.now()}`,
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
      large: null,
      image: null,
      thumb: null,
      market_cap_rank: null,
      isXrpl: true
    };
  }
  
  try {
    // Call CoinGecko public search API
    const searchUrl = `${COINGECKO_PUBLIC_API}/search?query=${encodeURIComponent(xrplToken.currency)}`;
    const response = await fetch(searchUrl, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible)'
      }
    });
    
    // Handle rate limiting or API errors
    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`[CoinGecko Enrichment] Rate limited for ${xrplToken.currency}`);
      } else {
        console.warn(`[CoinGecko Enrichment] HTTP ${response.status} for ${xrplToken.currency}`);
      }
      
      // Return token without enrichment
      return {
        ...xrplToken,
        id: `${xrplToken.currency}-${xrplToken.issuer}`,
        name: xrplToken.name || xrplToken.currency,
        symbol: xrplToken.currency,
        large: null,
        image: null,
        thumb: null,
        market_cap_rank: null,
        isXrpl: true
      };
    }
    
    const data = await response.json();
    
    // Find matching coin by symbol (case-insensitive)
    const coingeckoMatch = data.coins?.find(coin => 
      coin.symbol?.toLowerCase() === xrplToken.currency.toLowerCase()
    );
    
    if (coingeckoMatch) {
      // Successfully enriched with CoinGecko data
      console.log(`[CoinGecko Enrichment] ✓ Enriched ${xrplToken.currency} → ${coingeckoMatch.id}`);
      return {
        ...xrplToken,
        id: coingeckoMatch.id,                          // CoinGecko ID (for charts)
        name: coingeckoMatch.name,                      // Full name
        symbol: coingeckoMatch.symbol.toUpperCase(),    // Normalized symbol
        large: coingeckoMatch.large || null,            // Large logo URL
        image: coingeckoMatch.large || null,            // Duplicate for compatibility
        thumb: coingeckoMatch.thumb || null,            // Thumbnail URL
        market_cap_rank: coingeckoMatch.market_cap_rank || null,
        isXrpl: true
      };
    } else {
      // No match found in CoinGecko results
      console.log(`[CoinGecko Enrichment] ✗ No match for ${xrplToken.currency}`);
      return {
        ...xrplToken,
        id: `${xrplToken.currency}-${xrplToken.issuer}`,
        name: xrplToken.name || xrplToken.currency,
        symbol: xrplToken.currency,
        large: null,
        image: null,
        thumb: null,
        market_cap_rank: null,
        isXrpl: true
      };
    }
    
  } catch (error) {
    // Network error or unexpected failure
    console.error(`[CoinGecko Enrichment] Error for ${xrplToken.currency}:`, error);
    
    // Return token without enrichment
    return {
      ...xrplToken,
      id: `${xrplToken.currency}-${xrplToken.issuer}`,
      name: xrplToken.name || xrplToken.currency,
      symbol: xrplToken.currency,
      large: null,
      image: null,
      thumb: null,
      market_cap_rank: null,
      isXrpl: true
    };
  }
}