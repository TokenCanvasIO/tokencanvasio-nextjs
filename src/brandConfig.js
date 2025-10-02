// src/brandConfig.js

const brands = {
  xrp: {
    key: 'xrp',
    logo: '/assets/drop-logo1.png',
    title: 'XRPMemeCoins',
    className: 'theme-ripple', // UPDATED CLASS NAME
    enableNfts: true,
    searchOpenByDefault: false,
    limits: {
      total: 50,
      nfts: { free: 5, premium: 25 },
      webLinks: { free: 5, premium: 25 },
    },
    meta: {
      title: 'XRP MemeCoins | Real-Time XRPL MemeCoins Data Visualizer',
      description: 'An interactive visualization of the XRP Ledger ecosystem...',
      image: 'https://xrpmemecoins.com/assets/drop-logo1.png',
      url: 'https://xrpmemecoins.com',
      favicon: '/assets/drop-logo1.png',
    },
    navLinks: [
      { key: 'about', label: 'About' },
      { key: 'faq', label: 'FAQ' },
      { key: 'terms', label: 'Terms' },
      { key: 'privacy', label: 'Privacy' },
    ],
  },
  default: {
    key: 'default',
    logo: '/assets/TokenCanvasLogo.png',
    title: 'TokenCanvasIO',
    className: 'theme-grok', // UPDATED CLASS NAME
    enableNfts: true,
    searchOpenByDefault: true,
    limits: {
      total: 50,
      nfts: { free: 5, premium: 25 },
      webLinks: { free: 5, premium: 25 },
    },
    meta: {
      title: 'TokenCanvasIO | Interactive Crypto Bubbles',
      description: 'An interactive visualization of cryptocurrency and NFT market data...',
      image: 'https://tokencanvas.io/assets/TokenCanvasLogo.png',
      url: 'https://tokencanvas.io',
      faviconLight: '/assets/TokenCanvasLogoBlack.png',
      faviconDark: '/assets/TokenCanvasLogo.png',
    },
    navLinks: [
      { key: 'about', label: 'About' },
      { key: 'faq', label: 'FAQ' },
      { key: 'whitepaper', label: 'White Paper' },
      { key: 'terms', label: 'Terms' },
      { key: 'privacy', label: 'Privacy' },
    ],
  },
};

/**
 * SERVER-SIDE: Gets brand config based on the host header.
 */
export const getBrandConfig_Server = (host) => {
  if (host && (host.includes('xrpbubbles.com') || host.includes('xrpmemecoins.com'))) {
    return brands.xrp;
  }
  return brands.default;
};

/**
 * CLIENT-SIDE: Gets brand config based on window.location.
 */
export const getBrandConfig_Client = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('xrpbubbles.com') || hostname.includes('xrpmemecoins.com')) {
      return brands.xrp;
    }
  }
  return brands.default;
};