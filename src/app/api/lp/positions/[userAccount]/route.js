// app/api/lp/positions/[userAccount]/route.js
// Get user's LP positions

import { NextResponse } from 'next/server';
import { lpTracker } from '@/lib/lp-tracking';
import { ammCache } from '@/lib/amm-cache';

export async function GET(request, { params }) {
  try {
    // Next.js 15 requires awaiting params
    const { userAccount } = params;
    
    if (!userAccount) {
      return NextResponse.json(
        { error: 'User account is required' },
        { status: 400 }
      );
    }
    
    // Check cache
    const cached = ammCache.getPool(`lp-${userAccount}`);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }
    
    // Get all LP positions
    const positions = await lpTracker.getUserLPPositions(userAccount);
    
    // Get summary
    const summary = await lpTracker.getPositionSummary(userAccount);
    
    // Get recommendations
    const recommendations = await lpTracker.getRecommendedPools(userAccount);
    
    const result = {
      userAccount,
      positions,
      summary,
      recommendations,
      fetchedAt: new Date().toISOString()
    };
    
    // Cache for 2 minutes
    ammCache.setPool(`lp-${userAccount}`, result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error fetching LP positions:', error);
    return NextResponse.json({
      error: 'Failed to fetch LP positions',
      details: error.message
    }, { status: 500 });
  }
}

// app/api/lp/history/route.js
// Get LP position history

import { NextResponse } from 'next/server';
import { lpTracker } from '@/lib/lp-tracking';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userAccount = searchParams.get('user');
    const ammAccount = searchParams.get('pool');
    
    if (!userAccount || !ammAccount) {
      return NextResponse.json(
        { error: 'User account and pool account are required' },
        { status: 400 }
      );
    }
    
    const history = await lpTracker.getPositionHistory(userAccount, ammAccount);
    const feesEarned = await lpTracker.calculateFeesEarned(userAccount, ammAccount);
    
    return NextResponse.json({
      userAccount,
      ammAccount,
      history,
      feesEarned,
      fetchedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching LP history:', error);
    return NextResponse.json({
      error: 'Failed to fetch LP history',
      details: error.message
    }, { status: 500 });
  }
}

// app/api/lp/pnl/route.js
// Calculate PnL for LP position

import { NextResponse } from 'next/server';
import { lpTracker } from '@/lib/lp-tracking';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userAccount = searchParams.get('user');
    const ammAccount = searchParams.get('pool');
    const depositTx = searchParams.get('depositTx');
    
    if (!userAccount || !ammAccount) {
      return NextResponse.json(
        { error: 'User account and pool account are required' },
        { status: 400 }
      );
    }
    
    const pnl = await lpTracker.calculatePnL(userAccount, ammAccount, depositTx);
    
    return NextResponse.json({
      userAccount,
      ammAccount,
      pnl,
      fetchedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error calculating PnL:', error);
    return NextResponse.json({
      error: 'Failed to calculate PnL',
      details: error.message
    }, { status: 500 });
  }
}