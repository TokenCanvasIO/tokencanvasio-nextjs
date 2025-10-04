import { coinData as staticCoinDataConfig } from '../../config.js';

// This function determines the base URL for API calls.
const getApiBaseUrl = () => {
  // In a local dev environment, this will be an empty string,
  // so requests go to the same origin (e.g., http://localhost:8888)
  return import.meta.env.VITE_API_BASE_URL || '';
};

export const API_BASE_URL = getApiBaseUrl();

async function fetchFromApi(path, options = {}) {
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
        let errorBody;
        try {
            errorBody = await response.json();
        } catch (e) {
            errorBody = await response.text();
        }
        throw new Error(errorBody.message || errorBody || `API call failed with status ${response.status}`);
    }
    
    if (response.status === 204) return null;
    return response.json();

  } catch (error) {
    console.error(`🔴 API Error fetching ${path}:`, error);
    throw error;
  }
}

// This is the function for the PORTFOLIO CHART
export const getPortfolioChartData = async (transactions, timeframe) => {
  if (!transactions || transactions.length === 0) {
    return { prices: [], volumes: [] };
  }

  try {
    // --- THIS IS THE FIX ---
    // The URL is now /functions/history, which matches our new _redirects rule.
    const response = await fetch(`${API_BASE_URL}/functions/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions, timeframe }),
    });

    if (!response.ok) {
      console.error("Backend API call failed for portfolio history");
      throw new Error('Failed to fetch portfolio history from backend.');
    }
    
    return await response.json(); 
    
  } catch (error) {
    console.error("Error in getPortfolioChartData:", error);
    return { prices: [], volumes: [], error: error.message };
  }
};


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

export async function getChartData(coinId, timeframe, vsCurrency = 'usd') {
  const assetInfo = staticCoinDataConfig[coinId] || {};
  const coinIdForApi = coinId === 'xrp' ? 'ripple' : coinId;
  
  if (vsCurrency === 'xrp' && assetInfo.token_issuer) {
      return getOnTheDexChartData(timeframe, assetInfo);
  }
  return getCoinGeckoChartData(coinIdForApi, timeframe, vsCurrency);
}

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

async function getOnTheDexChartData(timeframe, coinInfo) {
    if (!coinInfo.symbol || !coinInfo.token_issuer) return { prices: [], volumes: [] };
    const apiParams = { '4h': { interval: '15', bars: 16 }, '24h': { interval: '60', bars: 24 }, '7d': { interval: '240', bars: 42 }, '30d': { interval: 'D', bars: 30 }, 'All': { interval: 'D', bars: 400 } }[timeframe] || { interval: 'D', bars: 400 };
    try {
        const result = await fetchFromApi('/api/onthedex/ohlc', { params: { base: `${coinInfo.symbol}.${coinInfo.token_issuer}`, quote: 'XRP', ...apiParams } });
        if (result && result.data && Array.isArray(result.data.ohlc)) {
            const cleanOhlc = result.data.ohlc.filter(item => item && typeof item.t === 'number' && typeof item.c === 'number');
            return { prices: cleanOhlc.map(item => [item.t * 1000, item.c]), volumes: cleanOhlc.map(item => [item.t * 1000, item.vb || item.vq || 0]) };
        }
        return { prices: [], volumes: [] };
    } catch (error) {
        console.error(`Error fetching OnTheDEX chart for ${coinInfo.symbol}:`, error);
        return { prices: [], volumes: [] };
    }
}