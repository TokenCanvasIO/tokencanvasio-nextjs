import { coinData as staticCoinDataConfig, apiParamsMap, mockTweets } from '../../config.js';

const getApiBaseUrl = () => {
  // Check if running in a browser environment
  if (typeof window !== 'undefined') {
    const isIpfs = window.location.hostname.includes('ipfs');
    if (isIpfs) {
      return 'https://api.tokencanvas.io';
    }
  }
  // Use the Next.js syntax for environment variables
  return process.env.NEXT_PUBLIC_API_BASE_URL || '';
};

async function fetchFromApi(path, options = {}) {
  const API_BASE_URL = getApiBaseUrl(); // Call the function here instead
  const { method = 'GET', body, params } = options;
  let urlString = `${API_BASE_URL}${path}`;
  if (params) {
    Object.keys(params).forEach(key => (params[key] == null) && delete params[key]);
    const searchParams = new URLSearchParams(params);
    if (searchParams.toString()) {
        urlString += `?${searchParams.toString()}`;
    }
  }
  const config = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    config.body = JSON.stringify(body);
  }
  try {
    const response = await fetch(urlString, config);
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: `API call failed with status ${response.status}` }));
        throw new Error(errorBody.message);
    }
    return response.json();
  } catch (error) {
    // FIX #2: Corrected the typo "e. rror" to "error".
    console.error(`🔴 API Error fetching ${path}:`, error);
    throw error;
  }
}

// NOTE: This function is not exported, as per your baseline code.
async function getCoinGeckoChartData(coinId, timeframe, vsCurrency) {
  const daysMap = { '4h': '1', '24h': '1', '7d': '7', '30d': '30', 'All': 'max' };
  try {
    const path = `/api/coingecko/coins/${coinId}/market_chart`;
    const params = { vs_currency: vsCurrency, days: daysMap[timeframe] || 'max', precision: 'full' };
    const result = await fetchFromApi(path, { params });
    return { prices: result.prices || [], volumes: result.total_volumes || [] };
  } catch (error) {
    console.error(`Error fetching CoinGecko chart for ${coinId}:`, error);
    return { prices: [], volumes: [] };
  }
}

// NOTE: This function is not exported, as per your baseline code.
async function getOnTheDexChartData(coinId, timeframe) {
    const coinInfo = staticCoinDataConfig[coinId] || {};
    if (!coinInfo.symbol || !coinInfo.token_issuer) return { prices: [], volumes: [] };

    const apiParams = {
        '4h': { interval: '15', bars: 16 },
        '24h': { interval: '60', bars: 24 },
        '7d': { interval: '240', bars: 42 },
        '30d': { interval: 'D', bars: 30 },
        'All': { interval: 'D', bars: 400 }
    }[timeframe] || { interval: 'D', bars: 400 };

    try {
        const result = await fetchFromApi('/api/onthedex/ohlc', {
            params: { base: `${coinInfo.symbol}.${coinInfo.token_issuer}`, quote: 'XRP', ...apiParams }
        });
        if (result && result.data && Array.isArray(result.data.ohlc)) {
            const cleanOhlc = result.data.ohlc.filter(item => item && typeof item.t === 'number' && typeof item.c === 'number');
            return {
                prices: cleanOhlc.map(item => [item.t * 1000, item.c]),
                volumes: cleanOhlc.map(item => [item.t * 1000, item.vb || item.vq || 0]),
            };
        }
        return { prices: [], volumes: [] };
    } catch (error) {
        console.error(`Error fetching OnTheDEX chart for ${coinId}:`, error);
        return { prices: [], volumes: [] };
    }
}

// FIX #3: Added 'export' here because browser logs showed other parts of your app need this function.
export async function verifyXrplTokens(coins) {
    if (!coins || coins.length === 0) {
        return [];
    }
    try {
        const enrichedCoins = await fetchFromApi('/api/verify-xrpl-status', {
            method: 'POST',
            body: { coins },
        });
        return enrichedCoins;
    } catch (error) {
        console.error("Failed to verify XRPL tokens with backend:", error);
        return coins;
    }
}


export async function getNftHolders(issuer, taxon) {
  return { holders: [] };
}

export async function getIssuerActivity(issuer) {
  return { activity: [] };
}

export async function getTokenomics(asset) {
    if (!asset || !asset.id) {
        console.error("Invalid asset provided to getTokenomics");
        return null;
    }

    if (asset.issuer && asset.currency) {
        try {
            return await fetchFromApi(`/api/xrpl/tokenomics/${asset.issuer}/${asset.currency}`);
        } catch (error) {
            console.error(`Error fetching XRPL tokenomics for ${asset.currency}.${asset.issuer}:`, error);
            return null;
        }
    }

    try {
        const coinIdForApi = asset.id === 'xrp' ? 'ripple' : asset.id;
        const rawData = await fetchFromApi(`/api/coingecko/coins/${coinIdForApi}`);

        if (!rawData || !rawData.market_data) {
            throw new Error('Market data not found in CoinGecko response.');
        }
        const marketData = rawData.market_data;

        const tokenomicsData = {
            total_supply: marketData.total_supply || null,
            circulating_supply: marketData.circulating_supply || null,
            max_supply: marketData.max_supply || null,
            market_cap: marketData.market_cap?.usd || null,
            fully_diluted_valuation: marketData.fully_diluted_valuation?.usd || null,
            issuer: null,
            currency: rawData.symbol?.toUpperCase() || null,
            holders: null,
            trustlines: null,
        };
        return tokenomicsData;
    } catch (error) {
        console.error(`Error fetching CoinGecko tokenomics for ${asset.id}:`, error);
        return null;
    }
}

export async function fetchFullCoinData(coinIds) {
    const ids = Array.isArray(coinIds) ? coinIds.join(',') : coinIds;
    if (!ids) return [];
    const mappedIds = ids.split(',').map(id => id === 'xrp' ? 'ripple' : id).join(',');
    try {
        const data = await fetchFromApi('/api/coingecko/coins/markets', {
            method: 'GET',
            params: {
                vs_currency: 'usd',
                ids: mappedIds,
                price_change_percentage: '1h,24h,7d,30d,1y'
            }
        });
        return data;
    } catch (error) {
        console.error(`Error fetching full coin data:`, error);
        return [];
    }
}

export async function searchCoins({ query, category }) {
  if (!query || query.trim().length < 2) return [];
  
  const endpoint = '/api/coingecko/search';
  
  try {
    const params = { query, category };
    const data = await fetchFromApi(endpoint, { params });
    return data;
  } catch (error) {
    console.error(`❌ CoinGecko search failed for query: "${query}"`, error);
    return [];
  }
}

export async function searchXrplTokens({ query }) {
  if (!query || query.trim().length < 2) return [];
  try {
    const data = await fetchFromApi('/api/xrpl/search', { params: { query } });
    return data.tokens || [];
  } catch (error) {
    console.error(`❌ XRPL search failed for query: "${query}"`, error);
    return [];
  }
}

export async function getChartData(coinId, timeframe, vsCurrency = 'usd') {
  const assetInfo = staticCoinDataConfig[coinId] || {};
  const coinIdForApi = coinId === 'xrp' ? 'ripple' : coinId;
  
  if (vsCurrency === 'xrp' && assetInfo.token_issuer) {
      return getOnTheDexChartData(coinId, timeframe);
  }
  return getCoinGeckoChartData(coinIdForApi, timeframe, vsCurrency);
}

export async function getCoinDetails(coinId) {
    if (!coinId) return null;
    const coinIdForApi = coinId === 'xrp' ? 'ripple' : coinId;
    try {
        return await fetchFromApi(`/api/coingecko/coins/${coinIdForApi}`);
    } catch (error) {
        console.error(`Error fetching coin details for ${coinId}:`, error);
        return null;
    }
}

export async function getTweetData(coinId) {
  const coinInfo = staticCoinDataConfig[coinId] || {};
  const twitterUserId = coinInfo?.socials?.twitter?.userId;
  if (!twitterUserId) return mockTweets[coinId] || [];
  try {
    const result = await fetchFromApi(`/api/twitter/tweets/${twitterUserId}`, { params: { max_results: 10 } });
    return result.data || mockTweets[coinId] || [];
  } catch (error) { return mockTweets[coinId] || []; }
}

export async function getNftFullDetails(tokenId) {
  if (!tokenId) throw new Error("Token ID cannot be empty.");
  try {
    const rawData = await fetchFromApi(`/api/bithomp/nft/${tokenId}`);
    return {
      name: rawData.metadata?.name || 'Untitled NFT',
      image: rawData.assets?.image || null,
      issuer: rawData.issuer || null,
      ...rawData
    };
  } catch (error) {
    console.error(`Error in getNftFullDetails for ${tokenId}:`, error);
    throw error;
  }
}

export async function fetchSingleNftDetails(nftTokenId) { return getNftFullDetails(nftTokenId); }

export async function fetchBulkCachedNftDetails(customAssets) {
  if (!customAssets || customAssets.length === 0) return {};
  const promises = customAssets.map(asset =>
    fetchSingleNftDetails(asset.tokenId).catch(err => null)
  );
  const results = await Promise.all(promises);
  const detailsMap = {};
  results.forEach((detail, index) => {
    if (detail) {
      detailsMap[customAssets[index].id] = detail;
    }
  });
  return detailsMap;
}

export async function getNftData(address) {
  return fetchFromApi(`/api/nfts/gallery/${address}`);
}

export async function forceNftCacheRefresh(address) {
  return fetchFromApi(`/api/nfts/refresh/${address}`, { method: 'POST' });
}

export async function getExchangeData(coinId) {
  if (!coinId) return [];
  const fetchId = coinId === 'xrp' ? 'ripple' : coinId;
  try {
    const response = await fetchFromApi(`/api/coingecko/coins/${fetchId}/tickers`);
    return response?.tickers || [];
  } catch (error) { return []; }
}

export function getCoinListData() {
    const coinGeckoIds = Object.values(staticCoinDataConfig).map(c => c.coingecko?.split('/').pop()).filter(Boolean).map(id => id === 'xrp' ? 'ripple' : id);
    if (coinGeckoIds.length === 0) return Promise.resolve([]);
    return fetchFullCoinData(coinGeckoIds);
}

export async function initializeAppData() {
    try {
        const coinListData = await getCoinListData();
        return { coinData: coinListData };
    } catch (error) {
        console.error("Fatal Error: Could not fetch core coin list data.", error);
        throw new Error("Could not load essential market data.");
    }
}

export async function searchWeb(query) {
  if (!query || query.trim().length < 2) return { items: [] };
  try {
    const params = { query };
    return await fetchFromApi('/api/google-search', { params });
  } catch (error) {
    console.error("Failed to fetch web search results:", error);
    return { items: [] };
  }
}