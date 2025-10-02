export const COLLECTION_LIMIT = 100;
export const categories = {
'xrpl-meme-coins': {
name: 'XRP Ledger Ecosystem',
type: 'coingecko',
id: 'meme-token',
locked: false,
default: true,
},
'all-meme-coins': {
name: 'Meme Coins (Unfiltered)',
type: 'coingecko',
id: 'meme-token',
locked: true,
default: false,
},
'rwa': {
name: 'Real World Assets (RWAs)',
type: 'coingecko',
id: 'real-world-assets-rwa',
locked: true,
},
'layer-1': {
name: 'Layer 1 / Layer 2',
type: 'coingecko',
id: 'layer-1',
locked: true,
}
};
export const exchanges = {
bitmart: { name: 'BitMart', image: '/assets/bitmartlogo1.png' },
mexc: { name: 'MEXC', image: '/assets/mexc-global-logo.png' },
dexscreener: { name: 'DexScreener', image: '/assets/dex-screenerlogo.png' },
firstledger: { name: 'First Ledger', image: '/assets/FirstLedgerlogo.png' },
bitrue: { name: 'Bitrue', image: '/assets/Bitruewhitelogo-2.png' },
sologenic: { name: 'Sologenic DEX', image: '/assets/Sologeniclogo.png' },
xmagnetic: { name: 'XMagnetic', image: '/assets/XMagneticWhitelogo.png' },
coinex: { name: 'CoinEx', image: '/assets/coinexlogo.png' },
hibt: { name: 'HiBT', image: '/assets/hibt-logo.png' },
xpmarket: { name: 'XPMarket', image: '/assets/XPMarketLogo.png' },
coingecko: { name: 'CoinGecko', image: '/assets/coingecko-logo-white.png' }
};
export const coinData = {
ripple: {
id: 'xrp',
name: 'XRP',
symbol: 'XRP',
default: true,
image: '/assets/XRP-logo.webp',
color: '#23292F',
description: 'XRP is the native digital asset of the XRP Ledger.',
website: 'https://xrpl.org/',
coingecko: 'https://www.coingecko.com/en/coins/xrp',
token_issuer: 'Native Asset on the XRP Ledger',
creator: 'Ripple Labs (Originally OpenCoin)',
hasNfts: false,
socials: { twitter: { handle: 'Ripple', url: 'https://x.com/Ripple', userId: '15263375' } },
exchanges: [
{ exchange: 'sologenic', url: 'https://sologenic.org/trade?market=XRP%2F524C555344000000000000000000000000000000%2BrMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De' },
{ exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/xrp' }
],
},
fuzzybear: {
id: 'fuzzybear',
name: 'Fuzzybear',
symbol: 'FUZZY',
image: '/assets/Fuzzybearlog1.png',
color: '#FFD700',
description: '$FUZZY: In commemoration of the XRP Legend.',
website: 'https://fuzzyxrp.com', coingecko: 'https://www.coingecko.com/en/coins/fuzzybear',
token_issuer: 'rhCAT4hRdi2Y9puNdkpMzxrdKa5wkppR62',
creator: 'rsLyUPbwSaEFGCSV9NVHpDGghxNL2UUcX7', hasNfts: true,
nft_collections: [ { name: 'Fuzzybear OG', address: 'rw1R8cfHGMySmbj7gJ1HkiCqTY1xhLGYAs' } ],
socials: { twitter: { handle: 'FuzzybearXRPL', url: 'https://x.com/fuzzy_xrp', userId: '1932138815365263360' }, telegram: { url: 'https://t.me/fuzzyxrp' } },
exchanges: [
{ exchange: 'firstledger', url: 'https://firstledger.net/token/rhCAT4hRdi2Y9puNdkpMzxrdKa5wkppR62/46555A5A59000000000000000000000000000000' },
{ exchange: 'dexscreener', url: 'https://dexscreener.com/xrpl/46555a5a59000000000000000000000000000000.rhcat4hrdi2y9pundkpmzxrdka5wkppr62_xrp' },
{ exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/fuzzybear' }
],
},
phnix: {
    id: 'phnix',
    name: 'Phnix',
    symbol: 'PHNIX',
    image: '/assets/phnixlogo1.png',
    color: '#FF4500',
    description: "$PHNIX: XRP's resilient spirit and iconic mascot.",
    website: 'https://phnix.lol', coingecko: 'https://www.coingecko.com/en/coins/phnix',
    token_issuer: 'rDFXbW2ZZCG5WgPtqwNiA2xZokLMm9ivmN',
    creator: 'rLMkKDZqig5nc4wq3StAWnMxeZ1kMjsQo', hasNfts: true,
    nft_collections: [ { name: 'Phnix OG', address: 'rMiNJh6eQE5fSpgke5vrjUGiU9rXhrgoSA' } ],
    socials: { twitter: { handle: 'PHNIX_XRPL', url: 'https://x.com/phnix_xrp', userId: '1863691445082918913' }, telegram: { url: 'https://t.me/phnix_xrp' } },
    exchanges: [
      { exchange: 'firstledger', url: 'https://firstledger.net/token/rDFXbW2ZZCG5WgPtqwNiA2xZokLMm9ivmN/50484E4958000000000000000000000000000000' }, // ADDED
      { exchange: 'mexc', url: 'https://www.mexc.com/price/PHNIX' },
      { exchange: 'bitmart', url: 'https://www.bitmart.com/trade/en-US?symbol=PHNIX_USDT' },
      { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/phnix' }
    ],
  },
'drop-2': {
id: 'drop-2',
name: 'Drop',
symbol: 'DROP',
image: '/assets/drop-logo1.png',
color: '#00CED1',
description: '$DROP: Rewarding the XRPL community.',
website: 'https://www.xrp-drop.com/', coingecko: 'https://www.coingecko.com/en/coins/drop-2',
token_issuer: 'rszenFJoDdiGjyezQc8pME9KWDQH43Tswh',
creator: 'r31CuT8qHkqWXqHyyMQaX4CNMRjCXJC5Vi', hasNfts: true,
nft_collections: [ { name: 'Drop OG', address: 'rUDRQfn1hr84kVqQ42BoLgBsLtRgMWD4k5' } ],
socials: { twitter: { handle: 'XRPLDropCoin', url: 'https://x.com/DropCoinXRPL', userId: '1694968298796986368' }, telegram: { url: 'https://t.me/DropXRPL' } },
exchanges: [
{ exchange: 'firstledger', url: 'https://firstledger.net/token/rszenFJoDdiGjyezQc8pME9KWDQH43Tswh/44524F5000000000000000000000000000000000' }, // ADDED
{ exchange: 'bitrue', url: 'https://www.bitrue.com/trade/drop_usdt?cn=310425' },
{ exchange: 'sologenic', url: 'https://sologenic.org/trade?market=44524F5000000000000000000000000000000000%2BrszenFJoDdiGjyezQc8pME9KWDQH43Tswh%2FXRP' },
{ exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/drop-2' }
],
},
'army-3': {
id: 'army-3',
name: 'ARMY',
symbol: 'ARMY',
image: '/assets/ArmyLogo-2.png',
color: '#B22222',
description: '$ARMY: The XRP $ARMY stands as an unshakable force.',
website: 'https://www.xrparmy-cto.com/', coingecko: 'https://www.coingecko.com/en/coins/army-3',
token_issuer: 'rGG3wQ4kUzd7Jnmk1n5NWPZjjut62kCBfC',
creator: 'rHDkTGymZL6WQbrrsxPnpeTqhcF8S44kR1', hasNfts: true,
nft_collections: [ { name: 'ARMY NFTs', address: 'rHDkTGymZL6WQbrrsxPnpeTqhcF8S44kR1' } ],
socials: { twitter: { handle: 'ARMY_XRP589', url: 'https://x.com/ARMY_XRP589' } },
exchanges: [
{ exchange: 'bitrue', url: 'https://www.bitrue.com/trade/army_usdt' },
{ exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/army-3' }
],
},
'589-token': {
    id: '589-token', 
    name: '589 EOY', 
    symbol: '589', 
    image: '/assets/589Logo.png', 
    color: '#00FF00',
    description: "$589 EOY: XRP's most ICONIC meme!",
    website: 'https://www.589onxrpl.com/', coingecko: 'https://www.coingecko.com/en/coins/589-token',
    token_issuer: 'rfcasq9uRbvwcmLFvc4ti3j8Qt1CYCGgHz',
    creator: 'rQBkUhPczaFGgXMTiM7VQJ1jPVQpmJjCz', hasNfts: true,
    nft_collections: [ { name: '589 NFTs', address: 'rDjaHCJaAg4PY7UcoQegUM4twcYJ9kmur3' } ],
    socials: { twitter: { handle: '589CTO', url: 'https://x.com/589CTO' } },
    exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/589-token' } ],
  },
'toto-2': {
id: 'toto-2', name: 'Toto', symbol: 'TOTO', image: '/assets/TotoLogo.png', color: '#FFD700',
description: '$TOTO: TOTO is tokenizing culture for those who grind in silence.',
website: 'https://terrytoto.com/', coingecko: 'https://www.coingecko.com/en/coins/toto-2',
token_issuer: 'r9sH6YEVRyg8uYaKfyk1EfH36Lfq7a8PUD',
creator: 'rpcWD6R25922Swa8muRnoEipqcrrnEvCmF', hasNfts: true,
nft_collections: [ { name: 'Toto Genesis', address: 'rnnnKJCi27nmQWPbwW4131SD6P1nhcWzS4' } ],
socials: { twitter: { handle: 'terrytotoxrp', url: 'https://x.com/terrytotoxrp' } },
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/toto-2' } ],
},
'cult-2': {
id: 'cult-2', name: 'CULT', symbol: 'OBEY', image: '/assets/CultLogo.png', color: '#880808',
description: '$OBEY: The Eternal Conflict: Chaos to Order',
website: 'https://www.cultxrp.com/', coingecko: 'https://www.coingecko.com/en/coins/cult-2',
token_issuer: 'rCULtAKrKbQjk1Tpmg5hkw4dpcf9S9KCs',
creator: 'rwXtqbb49G4eDyikLv77JEHCx25eH3pCsx', hasNfts: true,
nft_collections: [ { name: 'CULT NFTs', address: 'rwXtqbb49G4eDyikLv77JEHCx25eH3pCsx' } ],
socials: { twitter: { handle: 'CULTxrplCTO', url: 'https://x.com/CULTxrplCTO' } },
exchanges: [ 
    { exchange: 'firstledger', url: 'https://firstledger.net/token/rCULtAKrKbQjk1Tpmg5hkw4dpcf9S9KCs/43554C5400000000000000000000000000000000' }, // ADDED
    { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/cult-2' } 
],
},
'flame-3': {
id: 'flame-3', name: 'FLAME', symbol: 'FLAME', image: '/assets/FLAMELogo.png', color: '#FF4500',
description: '$FLAME: A community-driven token on the XRPL.',
coingecko: 'https://www.coingecko.com/en/coins/flame-3',
token_issuer: 'rp5CUgVjAhuthJs8LdjTXFdNWJzfQqc3p2',
creator: 'r9FwvRLzsiETyBqHyiFRWfaoKg4xzRGFYS', hasNfts: true,
nft_collections: [ { name: 'FLAME NFTs', address: 'rMB7EjxzoBegbtxjHPQWfWswRqPqA4o44Y' } ],
socials: { twitter: { handle: 'FlameCoinXRPL', url: 'https://x.com/FlameCoinXRPL' } },
exchanges: [ 
    { exchange: 'firstledger', url: 'https://firstledger.net/token/rp5CUgVjAhuthJs8LdjTXFdNWJzfQqc3p2/464C414D45000000000000000000000000000000' }, // ADDED
    { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/flame-3' } 
],
},
salute: {
id: 'salute', name: 'Salute', symbol: 'SLT', image: '/assets/SLTLogo.png', color: '#C0C0C0',
description: '#SALUTE🫡 (SLT) rises with XRP’s ascent.',
website: 'https://xrpsalute.com/', coingecko: 'https://www.coingecko.com/en/coins/salute',
token_issuer: 'rfGCeDUdtbzKbXfgvrpG745qdC1hcZBz8S',
creator: 'rEjGxzoZw7quhLEF8P5a8A1J9V1fiXpyfq', hasNfts: false,
socials: { twitter: { handle: 'salutexrpl', url: 'https://x.com/salutexrpl' } },
exchanges: [ 
    { exchange: 'firstledger', url: 'https://firstledger.net/token/rfGCeDUdtbzKbXfgvrpG745qdC1hcZBz8S/SLT' }, // ADDED
    { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/salute' } 
],
},
// --- NEW COINS START HERE ---
'gei-bear': {
    id: 'gei-bear',
    name: 'GEI BEAR',
    symbol: 'GEI',
    image: '/assets/GeiBearLogo.png',
    color: '#A52A2A',
    description: 'GEI BEAR on XRPL.',
    website: 'https://geibear.com',
    token_issuer: 'raadqNCqPHhqpb5HEMBjbfFa21YYu9GWfW',
    hasNfts: false,
    socials: {},
    exchanges: [
      { exchange: 'firstledger', url: 'https://firstledger.net/token/raadqNCqPHhqpb5HEMBjbfFa21YYu9GWfW/gei' },
    ],
},
'splash-2': {
    id: 'splash-2',
    name: 'SPLASH',
    symbol: 'SPLASH',
    image: '/assets/SplashLogo.png',
    color: '#00BFFF',
    description: 'SPLASH on XRPL.',
    website: 'https://linktr.ee/SplashXRPL',
    token_issuer: 'rwfGtVZKpPX6vb51xE5RGTgXkQ4W9wSUrz',
    hasNfts: false,
    socials: {},
    exchanges: [
      { exchange: 'firstledger', url: 'https://firstledger.net/token/rwfGtVZKpPX6vb51xE5RGTgXkQ4W9wSUrz/53504C4153480000000000000000000000000000' },
    ],
},
// --- NEW COINS END HERE ---
'ripple-usd': {
id: 'ripple-usd',
name: 'Ripple USD',
symbol: 'rlusd',
token_issuer: 'rM22S2yey2i2tEzSU1sT4k7G4d1s2s9sMH',
coingecko: 'https://www.coingecko.com/en/coins/ripple-usd',
hasNfts: true,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/ripple-usd' } ]
},
coreum: {
id: 'coreum',
name: 'Coreum',
symbol: 'coreum',
coingecko: 'https://www.coingecko.com/en/coins/coreum',
hasNfts: true,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/coreum' } ]
},
'chainlink': {
id: 'chainlink',
name: 'Chainlink',
symbol: 'LINK',
default: true,
coingecko: 'https://www.coingecko.com/en/coins/chainlink',
hasNfts: true,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/chainlink' } ]
},
'stellar': {
id: 'stellar',
name: 'Stellar',
symbol: 'XLM',
default: true,
coingecko: 'https://www.coingecko.com/en/coins/stellar',
hasNfts: false,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/stellar' } ]
},
'avalanche-2': {
id: 'avalanche-2',
name: 'Avalanche',
symbol: 'AVAX',
default: true,
coingecko: 'https://www.coingecko.com/en/coins/avalanche-2',
hasNfts: false,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/avalanche-2' } ]
},
'hedera-hashgraph': {
id: 'hedera-hashgraph',
name: 'Hedera',
symbol: 'HBAR',
default: true,
coingecko: 'https://www.coingecko.com/en/coins/hedera-hashgraph',
hasNfts: false,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/hedera-hashgraph' } ]
},
'ondo-finance': {
id: 'ondo-finance',
name: 'Ondo',
symbol: 'ONDO',
default: true,
coingecko: 'https://www.coingecko.com/en/coins/ondo-finance',
hasNfts: false,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/ondo-finance' } ]
},
'vechain': {
id: 'vechain',
name: 'VeChain',
symbol: 'VET',
default: true,
coingecko: 'https://www.coingecko.com/en/coins/vechain',
hasNfts: false,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/vechain' } ]
},
'algorand': {
id: 'algorand',
name: 'Algorand',
symbol: 'ALGO',
default: true,
coingecko: 'https://www.coingecko.com/en/coins/algorand',
hasNfts: false,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/algorand' } ]
},
'xdce-crowd-sale': {
id: 'xdce-crowd-sale',
name: 'XDC Network',
symbol: 'XDC',
default: true,
coingecko: 'https://www.coingecko.com/en/coins/xdc-network',
hasNfts: false,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/xdc-network' } ]
},
'quant-network': {
id: 'quant-network',
name: 'Quant',
symbol: 'QNT',
default: true,
coingecko: 'https://www.coingecko.com/en/coins/quant-network',
hasNfts: false,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/quant-network' } ]
},
'tether-gold': {
id: 'tether-gold',
name: 'Tether Gold',
symbol: 'XAUT',
default: true,
coingecko: 'https://www.coingecko.com/en/coins/tether-gold',
hasNfts: false,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/tether-gold' } ]
},
'iota': {
id: 'iota',
name: 'IOTA',
symbol: 'IOTA',
default: true,
coingecko: 'https://www.coingecko.com/en/coins/iota',
hasNfts: false,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/iota' } ]
},
'reserve-rights-token': {
id: 'reserve-rights-token',
name: 'Reserve Rights',
symbol: 'RSR',
default: true,
coingecko: 'https://www.coingecko.com/en/coins/reserve-rights-token',
hasNfts: false,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/reserve-rights-token' } ]
},
'axelar': {
id: 'axelar',
name: 'Axelar',
symbol: 'AXL',
default: true,
coingecko: 'https://www.coingecko.com/en/coins/axelar',
hasNfts: false,
exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/axelar' } ]
},
'cardano': {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    default: true,
    image: '',
    coingecko: 'https://www.coingecko.com/en/coins/cardano',
    hasNfts: false,
    exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/cardano' } ]
},
'tron': {
    id: 'tron',
    name: 'TRON',
    symbol: 'TRX',
    default: true,
    image: '',
    coingecko: 'https://www.coingecko.com/en/coins/tron',
    hasNfts: false,
    exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/tron' } ]
},
'polkadot': {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    default: true,
    image: '',
    coingecko: 'https://www.coingecko.com/en/coins/polkadot',
    hasNfts: false,
    exchanges: [ { exchange: 'coingecko', url: 'https://www.coingecko.com/en/coins/polkadot' } ]
},
};
// Fallback data for initial load or API failure
export const fallbackData = [
{ id: 'xrp', name: 'XRP', symbol: 'XRP', image: '/assets/XRP-logo.webp', market_cap: 0 },
{ id: 'fuzzybear', name: 'Fuzzybear', symbol: 'FUZZY', image: '/assets/Fuzzybearlog1.png', market_cap: 0 },
{ id: 'phnix', name: 'Phnix', symbol: 'PHNIX', image: '/assets/phnixlogo1.png', market_cap: 0 },
{ id: 'drop-2', name: 'Drop', symbol: 'DROP', image: '/assets/drop-logo1.png', market_cap: 0 },
{ id: 'army-3', name: 'ARMY', symbol: 'ARMY', image: '/assets/ArmyLogo-2.png', market_cap: 0 },
{ id: 'toto-2', name: 'Toto', symbol: 'TOTO', image: '/assets/TotoLogo.png', market_cap: 0 },
{ id: 'cult-2', name: 'CULT', symbol: 'OBEY', image: '/assets/CultLogo.png', market_cap: 0 },
{ id: 'flame-3', name: 'FLAME', symbol: 'FLAME', image: '/assets/FLAMELogo.png', market_cap: 0 },
{ id: 'salute', name: 'Salute', symbol: 'SLT', image: '/assets/SLTLogo.png', market_cap: 0 },
{ id: '589-token', name: '589 EOY', symbol: '589', image: '/assets/589Logo.png', market_cap: 0 },
// --- NEW FALLBACK DATA ADDED ---
{ id: 'gei-bear', name: 'GEI BEAR', symbol: 'GEI', image: '/assets/GeiBearLogo.png', market_cap: 0 },
{ id: 'splash-2', name: 'SPLASH', symbol: 'SPLASH', image: '/assets/SplashLogo.png', market_cap: 0 },
];
// Other miscellaneous configurations
export const currencySymbols = { xrp: 'XRP', rlusd: 'RLUSD', usd: '$' };
export const mockTweets = {
'cult-2': ["$OBEY the CULT. Chaos to Order. #CULTxrp"],
'flame-3': ["Feel the heat with $FLAME on the #XRPL!"],
};
export const apiParamsMap = {
'4h': { interval: '15', bars: 16 },
'24h': { interval: '60', bars: 24 },
'7d': { interval: '240', bars: 42 },
'30d': { interval: 'D', bars: 30 },
market_cap_day: { interval: '60', bars: 24 },
};