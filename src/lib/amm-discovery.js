// app/api/amm/discovery/route.js
// Trigger or get status of AMM pool discovery

import { NextResponse } from 'next/server';
import { ammDiscovery } from '@/lib/amm-discovery';

// GET - Get discovery status
export async function GET() {
  try {
    const stats = ammDiscovery.getStats();
    const discoveredPools = ammDiscovery.getDiscoveredPools();
    
    return NextResponse.json({
      status: 'ok',
      stats,
      pools: discoveredPools,
      count: discoveredPools.length
    });
  } catch (error) {
    console.error('Error getting discovery stats:', error);
    return NextResponse.json({
      error: 'Failed to get discovery stats',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Trigger manual scan
export async function POST() {
  try {
    console.log('🚀 Manual discovery scan triggered via API');
    
    const stats = ammDiscovery.getStats();
    
    if (stats.isScanning) {
      return NextResponse.json({
        message: 'Scan already in progress',
        stats
      });
    }
    
    // Start scan (runs async)
    console.log('Starting pool discovery...');
    const pools = await ammDiscovery.scanForPools();
    
    return NextResponse.json({
      message: 'Discovery scan completed',
      poolsFound: pools.length,
      pools: pools,
      stats: ammDiscovery.getStats()
    });
  } catch (error) {
    console.error('Error starting discovery:', error);
    return NextResponse.json({
      error: 'Failed to start discovery',
      details: error.message
    }, { status: 500 });
  }
}