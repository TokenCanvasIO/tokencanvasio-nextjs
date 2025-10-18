// app/api/amm/[accountId]/route.js
import { NextResponse } from 'next/server';
import { ensureConnected, formatAmount, getTokenMetadata, calculatePoolMetrics } from '@/lib/xrpl-helpers';
import { ammCache } from '@/lib/amm-cache';

export async function GET(request, { params }) {
  try {
    // MUST await params in Next.js 15
    const { accountId } = await params;

    console.log(`Received accountId: '${accountId}', Length: ${accountId?.length}`);

    if (!accountId) {
      return NextResponse.json({ 
        error: 'AMM account ID is required' 
      }, { status: 400 });
    }

    // Validate account ID format (XRPL addresses are typically 25-35 chars starting with 'r')
    if (!accountId.startsWith('r') || accountId.length < 25 || accountId.length > 35) {
      return NextResponse.json({ 
        error: 'Invalid XRPL account format',
        details: 'Account must start with "r" and be 25-35 characters'
      }, { status: 400 });
    }

    // Check cache
    const cached = ammCache.getPool(accountId);
    if (cached) {
      console.log('Returning cached pool data');
      return NextResponse.json({ ...cached, cached: true });
    }

    const client = await ensureConnected();
    
    console.log('Requesting AMM info for:', accountId);
    
    // Try to get AMM info - the account might be an AMM or regular account
    let ammResponse;
    try {
      ammResponse = await client.request({
        command: 'amm_info',
        amm_account: accountId
      });
    } catch (ammError) {
      console.error('AMM info error:', ammError);
      
      // If it's not an AMM account, provide helpful error
      if (ammError.data?.error === 'actMalformed') {
        return NextResponse.json({ 
          error: 'Account format error',
          details: 'The account address format is invalid. Please verify the address.',
          accountId: accountId
        }, { status: 400 });
      }
      
      if (ammError.data?.error === 'actNotFound') {
        return NextResponse.json({ 
          error: 'AMM pool not found',
          details: 'This account is not an AMM pool or does not exist.',
          accountId: accountId
        }, { status: 404 });
      }
      
      throw ammError;
    }

    const ammInfo = ammResponse.result.amm;

    if (!ammInfo) {
      return NextResponse.json({ 
        error: 'AMM pool not found',
        details: 'No AMM data returned for this account'
      }, { status: 404 });
    }

    console.log('AMM Info retrieved successfully');

    // Format amounts
    const asset1 = formatAmount(ammInfo.amount);
    const asset2 = formatAmount(ammInfo.amount2);

    // Get metadata for both tokens
    const [asset1Metadata, asset2Metadata] = await Promise.all([
      getTokenMetadata(asset1.currency, asset1.issuer),
      getTokenMetadata(asset2.currency, asset2.issuer)
    ]);

    // Calculate pool metrics
    const metrics = calculatePoolMetrics(ammInfo, asset1Metadata, asset2Metadata);

    // Build response
    const poolData = {
      account: accountId,
      asset1: { 
        ...asset1, 
        ...asset1Metadata, 
        balance: asset1.value 
      },
      asset2: { 
        ...asset2, 
        ...asset2Metadata, 
        balance: asset2.value 
      },
      metrics: {
        totalLiquidity: metrics.totalLiquidity,
        tradingFeePercent: metrics.tradingFee,
        lpTokenSupply: metrics.lpTokens,
        asset1ValueUSD: metrics.asset1Value,
        asset2ValueUSD: metrics.asset2Value
      },
      auctionSlot: ammInfo.auction_slot,
      lpToken: ammInfo.lp_token,
      tradingFee: ammInfo.trading_fee,
      voteSlots: ammInfo.vote_slots || [],
      fetchedAt: new Date().toISOString()
    };

    // Cache the result
    ammCache.setPool(accountId, poolData);

    return NextResponse.json(poolData);

  } catch (error) {
    console.error('Error fetching AMM pool:', error);
    
    // Return detailed error for debugging
    return NextResponse.json({
      error: 'Failed to fetch AMM pool data',
      details: error.message,
      errorData: error.data || null
    }, { status: 500 });
  }
}