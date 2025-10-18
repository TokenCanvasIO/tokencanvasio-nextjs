// app/api/amm/pools/all/route.js
import { NextResponse } from 'next/server';
import { ensureConnected, getTokenMetadata } from '@/lib/xrpl-helpers';
import { validatePools } from '@/lib/amm-pools';
import { ammCache } from '@/lib/amm-cache';

export const dynamic = 'force-dynamic';

// Rate limiting helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Enrich pool with full data (with rate limiting)
async function enrichPool(client, poolAccount, delayMs = 0) {
  try {
    if (delayMs > 0) await delay(delayMs);
    
    const ammResponse = await client.request({
      command: 'amm_info',
      amm_account: poolAccount
    });
    
    const ammInfo = ammResponse.result.amm;
    if (!ammInfo) return null;
    
    // Parse amounts
    const asset1Amount = typeof ammInfo.amount === 'string' 
      ? { currency: 'XRP', value: Number(ammInfo.amount) / 1_000_000, issuer: null }
      : { currency: ammInfo.amount.currency, value: Number(ammInfo.amount.value), issuer: ammInfo.amount.issuer };
    
    const asset2Amount = typeof ammInfo.amount2 === 'string'
      ? { currency: 'XRP', value: Number(ammInfo.amount2) / 1_000_000, issuer: null }
      : { currency: ammInfo.amount2.currency, value: Number(ammInfo.amount2.value), issuer: ammInfo.amount2.issuer };
    
    // Get metadata with delays
    const asset1Meta = await getTokenMetadata(asset1Amount.currency, asset1Amount.issuer);
    await delay(200);
    const asset2Meta = await getTokenMetadata(asset2Amount.currency, asset2Amount.issuer);
    
    // Calculate liquidity
    const asset1ValueUSD = (asset1Meta.current_price || 0) * asset1Amount.value;
    const asset2ValueUSD = (asset2Meta.current_price || 0) * asset2Amount.value;
    const totalLiquidityUSD = asset1ValueUSD + asset2ValueUSD;
    
    return {
      account: poolAccount,
      id: `amm-${poolAccount}`,
      name: `${asset1Meta.symbol?.toUpperCase() || asset1Amount.currency}/${asset2Meta.symbol?.toUpperCase() || asset2Amount.currency}`,
      asset1: {
        currency: asset1Amount.currency,
        issuer: asset1Amount.issuer,
        amount: asset1Amount.value,
        name: asset1Meta.name || asset1Amount.currency,
        symbol: asset1Meta.symbol || asset1Amount.currency,
        image: asset1Meta.image || '/placeholder.png',
        price: asset1Meta.current_price || 0
      },
      asset2: {
        currency: asset2Amount.currency,
        issuer: asset2Amount.issuer,
        amount: asset2Amount.value,
        name: asset2Meta.name || asset2Amount.currency,
        symbol: asset2Meta.symbol || asset2Amount.currency,
        image: asset2Meta.image || '/placeholder.png',
        price: asset2Meta.current_price || 0
      },
      images: [
        asset1Meta.image || '/placeholder.png',
        asset2Meta.image || '/placeholder.png'
      ],
      liquidity: totalLiquidityUSD,
      total_volume: 0,
      tradingFee: ammInfo.trading_fee / 1000,
      lpTokenSupply: ammInfo.lp_token?.value || '0',
      apy: 0,
      isAmm: true,
      source: 'auto-discovery'
    };
  } catch (error) {
    console.error(`Error enriching pool ${poolAccount}:`, error.message);
    return {
      account: poolAccount,
      id: `amm-${poolAccount}`,
      name: `AMM Pool (${poolAccount.slice(0, 8)}...)`,
      images: ['/placeholder.png', '/placeholder.png'],
      liquidity: 0,
      total_volume: 0,
      tradingFee: 0,
      apy: 0,
      isAmm: true,
      source: 'auto-discovery'
    };
  }
}

// Discover AMM pools
async function discoverAMMPools(client) {
  const foundPools = new Set();
  
  try {
    console.log('🔍 Scanning ledger for AMM pools...');
    
    let marker = null;
    let batchCount = 0;
    const MAX_BATCHES = 10;

    do {
      const request = {
        command: 'ledger_data',
        ledger_index: 'validated',
        limit: 400
      };

      if (marker) request.marker = marker;

      const response = await client.request(request);
      const state = response.result.state || [];

      console.log(`   Batch ${batchCount + 1}: Checking ${state.length} entries...`);

      for (const entry of state) {
        if (entry.LedgerEntryType === 'AMM' && entry.Account) {
          console.log(`   ✓ Found AMM: ${entry.Account}`);
          foundPools.add(entry.Account);
        }
      }

      marker = response.result.marker;
      batchCount++;

    } while (marker && batchCount < MAX_BATCHES);

    console.log(`✅ Discovery complete. Found ${foundPools.size} AMM pools.`);
    return Array.from(foundPools);
  } catch (error) {
    console.error('Error discovering pools:', error);
    return [];
  }
}

export async function GET() {
  try {
    // Check cache
    const cached = ammCache.getPoolsList();
    if (cached) {
      console.log('💾 Returning cached pools list');
      return NextResponse.json({ ...cached, cached: true });
    }
    
    console.log('📋 Fetching all AMM pools...');
    
    const client = await ensureConnected();
    
    // Step 1: Validate known pools
    const validatedKnownPools = await validatePools(client);
    console.log(`   Known pools validated: ${validatedKnownPools.length}`);
    
    // Step 2: Discover pools
    const discoveredAccounts = await discoverAMMPools(client);
    console.log(`   Auto-discovery found: ${discoveredAccounts.length}`);
    
    // Step 3: Enrich with rate limiting
    console.log('💎 Enriching pools with CoinGecko data (rate limited)...');
    const enrichedDiscoveredPools = [];
    
    const accountsToEnrich = discoveredAccounts
      .filter(account => !validatedKnownPools.some(p => p.account === account));
    
    for (let i = 0; i < accountsToEnrich.length; i++) {
      const enriched = await enrichPool(client, accountsToEnrich[i], i * 500);
      if (enriched) enrichedDiscoveredPools.push(enriched);
    }
    
    console.log(`   Enriched ${enrichedDiscoveredPools.length} pools`);
    
    // Step 4: Combine and sort
    const allPools = [...validatedKnownPools, ...enrichedDiscoveredPools];
    allPools.sort((a, b) => (b.liquidity || 0) - (a.liquidity || 0));
    
    console.log(`✅ Returning ${allPools.length} total pools`);
    
    const result = { 
      pools: allPools, 
      count: allPools.length,
      source: 'mixed',
      discovered: enrichedDiscoveredPools.length,
      known: validatedKnownPools.length,
      timestamp: new Date().toISOString()
    };
    
    ammCache.setPoolsList(result);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error fetching AMM pools:', error);
    return NextResponse.json({
      error: 'Failed to fetch AMM pools',
      details: error.message
    }, { status: 500 });
  }
}