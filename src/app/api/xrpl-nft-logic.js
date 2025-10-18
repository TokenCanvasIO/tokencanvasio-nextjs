import * as xrpl from 'xrpl';

const CLIO_SERVER = 'wss://s2.ripple.com/';
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

async function fetchNftMetadata(metadataUrl) {
  if (!metadataUrl || !metadataUrl.startsWith('http')) return null;
  try {
    const response = await fetch(metadataUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const metadata = await response.json();
    const imageUrl = metadata.image || metadata.Image || metadata.image_url;
    if (imageUrl && imageUrl.startsWith('ipfs://')) {
      return imageUrl.replace('ipfs://', IPFS_GATEWAY);
    }
    return imageUrl || null;
  } catch (error) {
    return null;
  }
}

function resolveNftImageUrl(uri) {
  if (!uri) return null;
  try {
    const decodedUri = xrpl.convertHexToString(uri);
    if (decodedUri.startsWith('ipfs://')) {
      return decodedUri.replace('ipfs://', IPFS_GATEWAY);
    } else if (decodedUri.startsWith('http')) {
      return decodedUri;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// --- THIS IS THE FIX ---
// The 'export' keyword was missing from this function definition.
export async function fetchNftsForAccount(account) {
  const client = new xrpl.Client(CLIO_SERVER);
  try {
    await client.connect();
    const response = await client.request({
      command: 'account_nfts',
      account: account,
      limit: 400,
    });
    const nfts = response.result.account_nfts || [];

    const processedNfts = await Promise.all(nfts.map(async (nft) => {
      const metadataUrl = resolveNftImageUrl(nft.URI);
      const finalImageUrl = await fetchNftMetadata(metadataUrl);
      return {
        ...nft,
        metadata_url: metadataUrl,
        final_image_url: finalImageUrl,
      };
    }));

    return processedNfts;

  } catch (error) {
    console.error(`[XRPL Fetch Error] Failed to fetch NFTs for account ${account}:`, error);
    return [];
  } finally {
    if (client.isConnected()) {
      await client.disconnect();
    }
  }
}