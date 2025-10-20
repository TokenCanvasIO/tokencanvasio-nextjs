// src/services/api-amm.js

export async function getAmmPools() {
  try {
    // UPDATED: Points to your new live server
    const response = await fetch('https://tokencanvas.io/api/amm/pools/all');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Your new API returns: { pools: [...], ... }
    return data.pools || [];
    
  } catch (err) {
    console.error('Error fetching all AMM pools:', err);
    throw err;
  }
}

// NOTE: This function won't work yet as we only created the /all endpoint.
// We would need to create a new /api/amm/[accountId] endpoint on your server for this.
export async function getAmmPoolDetails(ammAccount) {
  try {
    // UPDATED: Points to your new live server (placeholder)
    const response = await fetch(`https://tokencanvas.io/api/amm/${ammAccount}`);
    
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