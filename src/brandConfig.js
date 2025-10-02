// src/brandConfig.js
const brands = {
  xrp: {
    key: 'xrp',
    logo: '/assets/drop-logo1.png',
    title: 'XRPMemeCoins',
    className: 'theme-ripple',
    meta: {
      url: 'https://xrpmemecoins.com',
      title: 'XRP MemeCoins | Real-Time XRPL MemeCoins Data Visualizer',
      description: 'An interactive visualization of the XRP Ledger ecosystem...',
      image: 'https://xrpmemecoins.com/assets/drop-logo1.png',
      favicon: '/assets/drop-logo1.png'
    },
    navLinks: [
      { key: 'about', path: '/about', label: 'About' },
      { key: 'faq', path: '/faq', label: 'FAQ' },
      { key: 'terms', path: '/terms-of-service', label: 'Terms' },
      { key: 'privacy', path: '/privacy-policy', label: 'Privacy' },
    ],
  },
  default: {
    key: 'default',
    logo: '/assets/TokenCanvasLogo.png',
    title: 'TokenCanvasIO',
    className: 'theme-grok',
    meta: {
      url: 'https://tokencanvas.io',
      title: 'TokenCanvasIO | Interactive Crypto Bubbles',
      description: 'An interactive visualization of cryptocurrency and NFT market data...',
      image: 'https://tokencanvas.io/assets/TokenCanvasLogo.png',
      faviconLight: '/assets/TokenCanvasLogoBlack.png',
      faviconDark: '/assets/TokenCanvasLogo.png',
    },
    navLinks: [
      { key: 'about', path: '/about', label: 'About' },
      { key: 'whitepaper', path: '/white-paper', label: 'White Paper' },
      { key: 'faq', path: '/faq', label: 'FAQ' },
      { key: 'terms', path: '/terms-of-service', label: 'Terms' },
      { key: 'privacy', path: '/privacy-policy', label: 'Privacy' },
    ],
  },
};

export function getBrandConfig_Server(headers) {
  const host = headers.get('x-forwarded-host') || headers.get('host');
  if (host && (host.includes('xrpbubbles.com') || host.includes('xrpmemecoins.com'))) {
    return brands.xrp;
  }
  return brands.default;
};

export function getBrandConfig_Client() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('xrpbubbles.com') || hostname.includes('xrpmemecoins.com')) {
      return brands.xrp;
    }
  }
  return brands.default;
};