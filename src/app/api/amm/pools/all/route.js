// app/api/amm/pools/all/route.js
import { NextResponse } from 'next/server';
import { getTokenMetadata } from '@/lib/xrpl-helpers';
import { ammCache } from '@/lib/amm-cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check cache first
    const cachedPools = ammCache.getPoolsList();
    if (cachedPools) {
      console.log(`✅ Returning ${cachedPools.length} pools from cache.`);
      return NextResponse.json({ 
        pools: cachedPools, 
        count: cachedPools.length,
        cached: true 
      });
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
    
    // Debug: Log the structure to see what we're getting
    console.log('Bithomp response structure:', Object.keys(bithompData));
    
    // Extract the pools array from the response
    // Bithomp returns: { amms: [...], count: X } or similar
    const poolsArray = bithompData.amms || bithompData.pools || bithompData.data || [];
    
    if (!Array.isArray(poolsArray)) {
      console.error('Unexpected Bithomp response format:', bithompData);
      throw new Error('Bithomp API did not return an array of pools');
    }
    
    console.log(`🎯 Fetched ${poolsArray.length} pools from Bithomp`);
    
    // Enrich with metadata
    console.log(`💎 Enriching ${poolsArray.length} pools with metadata...`);
    const enrichedPools = await Promise.all(
      poolsArray.map(async (pool) => {
        try {
          // Parse asset info from Bithomp response
          // Bithomp format may have: asset/asset2 or amount/amount2
          const asset1 = pool.asset || pool.amount || {};
          const asset2 = pool.asset2 || pool.amount2 || {};
          
          // Handle XRP (no issuer)
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
            name: `${asset1Meta.symbol?.toUpperCase() || asset1Currency}/${asset2Meta.symbol?.toUpperCase() || asset2Currency}`,
            asset1: {
              currency: asset1Currency,
              issuer: asset1Issuer,
              name: asset1Meta.name || asset1Currency,
              symbol: asset1Meta.symbol || asset1Currency,
              image: asset1Meta.image || `https://avatar.vercel.sh/${asset1Currency}.png?size=128&text=${asset1Currency.substring(0, 3)}`,
              price: asset1Meta.current_price || 0
            },
            asset2: {
              currency: asset2Currency,
              issuer: asset2Issuer,
              name: asset2Meta.name || asset2Currency,
              symbol: asset2Meta.symbol || asset2Currency,
              image: asset2Meta.image || `https://avatar.vercel.sh/${asset2Currency}.png?size=128&text=${asset2Currency.substring(0, 3)}`,
              price: asset2Meta.current_price || 0
            },
            images: [
              asset1Meta.image || `https://avatar.vercel.sh/${asset1Currency}.png?size=128&text=${asset1Currency.substring(0, 3)}`,
              asset2Meta.image || `https://avatar.vercel.sh/${asset2Currency}.png?size=128&text=${asset2Currency.substring(0, 3)}`
            ],
            liquidity: pool.liquidity || 0,
            total_volume: pool.volume || 0,
            tradingFee: pool.tradingFee || pool.trading_fee || 0,
            apy: pool.apy || 0,
            isAmm: true,
            source: 'bithomp-api'
          };
        } catch (error) {
          console.error(`Error enriching pool ${pool.account}:`, error.message);
          return null;
        }
      })
    );
    
    const validPools = enrichedPools.filter(p => p !== null);
    console.log(`✅ Successfully enriched ${validPools.length} pools`);
    
    // Cache it
    ammCache.setPoolsList(validPools);

    return NextResponse.json({ 
      pools: validPools, 
      count: validPools.length,
      source: 'bithomp-api',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching all AMM pools:', error);
    return NextResponse.json({
      error: 'Failed to fetch AMM pools',
      details: error.message
    }, { status: 500 });
  }
}
