const ONTHEDEX_API_URL = 'https://api.onthedex.live/public/v1';
const XRPSCAN_API_URL = 'https://api.xrpscan.com/api/v1';

export async function fetchOnthedexAggregator() {
  try {
    const response = await fetch(`${ONTHEDEX_API_URL}/aggregator`, { cache: 'no-store' });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) { return null; }
}

export async function fetchXrpscanTokenomics(tokenString) {
  if (!tokenString) return null;
  const [issuer, currency] = tokenString.split('.');
  if (!issuer || !currency) return null;

  try {
    const url = `${XRPSCAN_API_URL}/token/${currency}.${issuer}`;
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`[XRPScan] CRITICAL ERROR for token ${tokenString}:`, error);
    return null;
  }
}

// --- THIS IS THE MISSING FUNCTION THAT NEEDS TO BE ADDED ---
export async function fetchOnthedexSearchResults(query) {
  if (!query) return [];
  try {
    const url = `${ONTHEDEX_API_URL}/token/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    return data.tokens || [];
  } catch (error) {
    console.error(`[onthedex search] CRITICAL ERROR for query ${query}:`, error);
    return [];
  }
}