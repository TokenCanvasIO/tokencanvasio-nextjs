// lib/amm-pools.js
// Curated list of known AMM pools on XRPL

export const KNOWN_AMM_POOLS = [
  {
    account: 'rNZ2ZVF1ZU34kFQvcN4xkFAvdSvve5bXce',
    name: 'XRP/MAG Pool (XPMarket)',
    description: 'XRP to Magnetix liquidity pool',
    source: 'xpmarket'
  },
];

// Function to check if pools are still active
export async function validatePools(client) {
  const validPools = [];
  
  for (const pool of KNOWN_AMM_POOLS) {
    try {
      const response = await client.request({
        command: 'amm_info',
        amm_account: pool.account
      });
      
      if (response.result.amm) {
        const amm = response.result.amm;
        
        const asset1 = typeof amm.amount === 'string' 
          ? { currency: 'XRP' }
          : { currency: amm.amount.currency, issuer: amm.amount.issuer };
        
        const asset2 = typeof amm.amount2 === 'string'
          ? { currency: 'XRP' }
          : { currency: amm.amount2.currency, issuer: amm.amount2.issuer };
        
        validPools.push({
          ...pool,
          asset1,
          asset2,
          tradingFee: amm.trading_fee / 1000,
          isActive: true
        });
      }
    } catch (err) {
      console.warn(`Pool ${pool.account} is no longer active:`, err.message);
    }
  }
  
  return validPools;
}