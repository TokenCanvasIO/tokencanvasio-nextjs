// app/api/init/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'AMM discovery runs automatically in /api/amm/pools/all',
    status: 'ok',
    info: {
      cacheEnabled: true,
      cacheDuration: '15 minutes',
      discoveryMethod: 'inline ledger scanning',
      poolsEndpoint: '/api/amm/pools/all'
    }
  });
}