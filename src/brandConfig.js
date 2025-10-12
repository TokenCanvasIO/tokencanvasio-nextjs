export const brands = {
  xrp: {
    key: 'xrp',
    logo: '/assets/drop-logo1.png',
    title: 'XRPMemeCoins',
    className: 'theme-ripple',
    meta: {
      url: 'https://xrpmemecoins.com',
      title: 'XRP MemeCoins | Real-Time XRPL MemeCoins Data Visualizer',
      description: 'An interactive data visualizer for the XRP Ledger MemeCoin ecosystem. Track real-time prices, market cap, and trends with our unique bubble chart.',
      image: 'https://xrpmemecoins.com/assets/xrpmemecoins-og-image.png', // Create and add this image
      favicon: '/assets/xrp-favicon.png' // Create and add this
    },  
    navLinks: [
      { key: 'about', path: '/about', label: 'About' },
      { key: 'blog', path: '/blog', label: 'Blog' },
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
      description: 'The ultimate real-time crypto data visualizer. Create your personalized canvas, track trends, and share your unique view of the market.',
      image: 'https://tokencanvas.io/assets/tokencanvas-og-image.png', // Create and add this image
      favicon: '/assets/tokencanvas-favicon.png' // Create and add this
    },
    navLinks: [
      { key: 'about', path: '/about', label: 'About' },
      { key: 'blog', path: '/blog', label: 'Blog' },
      { key: 'whitepaper', path: '/white-paper', label: 'White Paper' },
      { key: 'faq', path: '/faq', label: 'FAQ' },
      { key: 'terms', path: '/terms-of-service', label: 'Terms' },
      { key: 'privacy', path: '/privacy-policy', label: 'Privacy' },
    ],
  },
};

// Universal function that works on server and client
export function getBrandConfig(host) {
  const hostname = host || (typeof window !== 'undefined' ? window.location.hostname : '');
  if (hostname.includes('xrpbubbles.com') || hostname.includes('xrpmemecoins.com')) {
    return brands.xrp;
  }
  return brands.default;
};

// Keep the client-only version for your BrandContext
export function getBrandConfig_Client() {
  return getBrandConfig();
};