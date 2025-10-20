// src/services/api-amm.js

export async function getAmmPools() {
  try {
    const response = await fetch('/api/amm/pools/all');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Your Next.js API returns: { pools: [...], count: X, cached: boolean }
    return data.pools || [];
    
  } catch (err) {
    console.error('Error fetching all AMM pools:', err);
    throw err;
  }
}

// Fetch a single pool's details
export async function getAmmPoolDetails(ammAccount) {
  try {
    const response = await fetch(`/api/amm/${ammAccount}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error(`Error fetching pool details for ${ammAccount}:`, err);
    throw err;
  }
}