// app/api/amm/pools/all/route.js
import { NextResponse } from 'next/server';
import { getTokenMetadata } from '@/lib/xrpl-helpers';
import { ammCache } from '@/lib/amm-cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 26; // Netlify Pro max

// Global flag to prevent multiple enrichments
let isEnriching = false;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedPools = ammCache.getPoolsList();
      if (cachedPools) {
        console.log(`✅ Returning ${cachedPools.length} pools from cache.`);
        return NextResponse.json({ 
          pools: cachedPools, 
          count: cachedPools.length,
          cached: true,
          enriched: true,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Fetch from Bithomp API
    console.log('📋 Fetching all AMM pools from Bithomp API...');
    const response = await fetch('https://bithomp.com/api/v2/amms', {
      headers: {
        'x-bithomp-token': process.env.BITHOMP_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Bithomp API returned ${response.status}: ${response.statusText}`);
    }
    
    const bithompData = await response.json();
    const poolsArray = bithompData.amms || bithompData.pools || bithompData.data || [];
    
    if (!Array.isArray(poolsArray)) {
      throw new Error('Bithomp API did not return an array of pools');
    }
    
    console.log(`🎯 Fetched ${poolsArray.length} pools from Bithomp`);

    // Create basic pools immediately (for fast response)
    const basicPools = poolsArray.map(pool => createBasicPool(pool));
    
    // Cache basic data immediately
    ammCache.setPoolsList(basicPools);
    
    // Start enrichment in background if not already running
    if (!isEnriching) {
      isEnriching = true;
      enrichPoolsInBackground(poolsArray).finally(() => {
        isEnriching = false;
      });
    }

    return NextResponse.json({ 
      pools: basicPools, 
      count: basicPools.length,
      source: 'bithomp-api',
      timestamp: new Date().toISOString(),
      cached: false,
      enriched: false,
      message: 'Enrichment in progress. Refresh in 2-3 minutes for full metadata.'
    });
    
  } catch (error) {
    console.error('❌ Error fetching all AMM pools:', error);
    return NextResponse.json({
      error: 'Failed to fetch AMM pools',
      details: error.message
    }, { status: 500 });
  }
}

// Helper: Create basic pool without enrichment
function createBasicPool(pool) {
  const asset1 = pool.asset || pool.amount || {};
  const asset2 = pool.asset2 || pool.amount2 || {};
  
  const asset1Currency = asset1.currency || 'XRP';
  const asset1Issuer = asset1.issuer || null;
  const asset2Currency = asset2.currency || 'XRP';
  const asset2Issuer = asset2.issuer || null;
  
  const getBasicMeta = (currency, issuer) => {
    if (currency === 'XRP' && !issuer) {
      return {
        name: 'XRP',
        symbol: 'XRP',
        image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
        price: 0
      };
    }
    const symbol = currency.length > 3 ? currency.substring(0, 3) : currency;
    return {
      name: currency,
      symbol: currency,
      image: `https://avatar.vercel.sh/${currency}.png?size=128&text=${symbol}`,
      price: 0
    };
  };
  
  const asset1Meta = getBasicMeta(asset1Currency, asset1Issuer);
  const asset2Meta = getBasicMeta(asset2Currency, asset2Issuer);
  
  return {
    account: pool.account,
    id: `amm-${pool.account}`,
    name: `${asset1Meta.symbol?.toUpperCase()}/${asset2Meta.symbol?.toUpperCase()}`,
    asset1: {
      currency: asset1Currency,
      issuer: asset1Issuer,
      name: asset1Meta.name,
      symbol: asset1Meta.symbol,
      image: asset1Meta.image,
      price: 0
    },
    asset2: {
      currency: asset2Currency,
      issuer: asset2Issuer,
      name: asset2Meta.name,
      symbol: asset2Meta.symbol,
      image: asset2Meta.image,
      price: 0
    },
    images: [asset1Meta.image, asset2Meta.image],
    liquidity: pool.liquidity || 0,
    total_volume: pool.volume || 0,
    tradingFee: pool.tradingFee || pool.trading_fee || 0,
    apy: pool.apy || 0,
    isAmm: true,
    source: 'bithomp-api'
  };
}

// Background enrichment function (runs async, doesn't block response)
async function enrichPoolsInBackground(poolsArray) {
  console.log('🔄 Starting background enrichment...');
  const startTime = Date.now();
  
  try {
    const enrichedPools = await Promise.allSettled(
      poolsArray.map(async (pool, index) => {
        try {
          if (index % 20 === 0) {
            console.log(`📊 Background progress: ${index}/${poolsArray.length}`);
          }
          
          const asset1 = pool.asset || pool.amount || {};
          const asset2 = pool.asset2 || pool.amount2 || {};
          
          const asset1Currency = asset1.currency || 'XRP';
          const asset1Issuer = asset1.issuer || null;
          const asset2Currency = asset2.currency || 'XRP';
          const asset2Issuer = asset2.issuer || null;
          
          const [asset1Meta, asset2Meta] = await Promise.all([
            getTokenMetadata(asset1Currency, asset1Issuer),
            getTokenMetadata(asset2Currency, asset2Issuer)
          ]);
          
          return {
            account: pool.account,
            id: `amm-${pool.account}`,
            name: `${asset1Meta.symbol?.toUpperCase()}/${asset2Meta.symbol?.toUpperCase()}`,
            asset1: {
              currency: asset1Currency,
              issuer: asset1Issuer,
              name: asset1Meta.name,
              symbol: asset1Meta.symbol,
              image: asset1Meta.image,
              price: asset1Meta.current_price || 0
            },
            asset2: {
              currency: asset2Currency,
              issuer: asset2Issuer,
              name: asset2Meta.name,
              symbol: asset2Meta.symbol,
              image: asset2Meta.image,
              price: asset2Meta.current_price || 0
            },
            images: [asset1Meta.image, asset2Meta.image],
            liquidity: pool.liquidity || 0,
            total_volume: pool.volume || 0,
            tradingFee: pool.tradingFee || pool.trading_fee || 0,
            apy: pool.apy || 0,
            isAmm: true,
            source: 'bithomp-api'
          };
        } catch (error) {
          console.error(`Error enriching pool ${pool.account}:`, error.message);
          return createBasicPool(pool);
        }
      })
    );
    
    const validPools = enrichedPools
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => r.value);
    
    const enrichmentTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Background enrichment complete: ${validPools.length} pools in ${enrichmentTime}s`);
    
    // Update cache with enriched data
    ammCache.setPoolsList(validPools);
    
  } catch (error) {
    console.error('❌ Background enrichment failed:', error);
  }
}