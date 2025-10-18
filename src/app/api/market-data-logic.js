const ONTHEDEX_API_URL = 'https://api.onthedex.live/public/v1';
const XRPSCAN_API_URL = 'https://api.xrpscan.com/api/v1';

// Bithomp is broken, so we remove it completely.

export async function fetchOnthedexAggregator() {
  try {
    const response = await fetch(`${ONTHEDEX_API_URL}/aggregator`, { cache: 'no-store' });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) { return null; }
}

// THIS IS THE FIX: We add a User-Agent header to pretend we are a browser.
export async function fetchXrpscanTokenomics(tokenString) {
  if (!tokenString) return null;
  const [issuer, currency] = tokenString.split('.'); // Use dot as separator
  if (!issuer || !currency) return null;

  try {
    const url = `${XRPSCAN_API_URL}/token/${currency}.${issuer}`; // Use the correct URL format
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