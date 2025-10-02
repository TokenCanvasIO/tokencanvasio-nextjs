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

// This is the only function needed. It runs safely in the browser.
export function getBrandConfig_Client() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('xrpbubbles.com') || hostname.includes('xrpmemecoins.com')) {
      return brands.xrp;
    }
  }
  return brands.default;
};