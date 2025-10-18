// app/api/amm/pools/all/route.js
import { NextResponse } from 'next/server';
import { ensureConnected } from '@/lib/xrpl-helpers';
import { KNOWN_AMM_POOLS, validatePools } from '@/lib/amm-pools';
import { ammCache } from '@/lib/amm-cache';

export const dynamic = 'force-dynamic';

// Direct discovery function (inline to avoid import issues)
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

      if (marker) {
        request.marker = marker;
      }

      const response = await client.request(request);
      const state = response.result.state || [];

      console.log(`   Batch ${batchCount + 1}: Checking ${state.length} entries...`);

      // Filter for AMM entries
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
    // Check cache first
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
    
    // Step 2: Discover pools (inline discovery)
    const discoveredAccounts = await discoverAMMPools(client);
    console.log(`   Auto-discovery found: ${discoveredAccounts.length}`);
    
    // Step 3: Combine all pools
    const allPools = [
      ...validatedKnownPools,
      ...discoveredAccounts
        .filter(account => !validatedKnownPools.some(p => p.account === account))
        .map(account => ({
          account,
          name: `AMM Pool (${account.slice(0, 8)}...)`,
          source: 'auto-discovery'
        }))
    ];
    
    console.log(`✅ Returning ${allPools.length} total pools`);
    
    const result = { 
      pools: allPools, 
      count: allPools.length,
      source: 'mixed',
      discovered: discoveredAccounts.length,
      known: validatedKnownPools.length,
      timestamp: new Date().toISOString()
    };
    
    // Cache the result for 15 minutes
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