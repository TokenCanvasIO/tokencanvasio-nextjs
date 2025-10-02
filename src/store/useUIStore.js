import { create } from 'zustand';
import { searchCoins, fetchFullCoinData, searchWeb, getNftFullDetails, getChartData, searchXrplTokens } from '../services/api';
import { getBrandConfig_Client } from '../brandConfig';

const isNftId = (term) => /^[A-Fa-f0-9]{64}$/.test(term.trim());

const closeAllPanels = {
  isAssetPanelOpen: false,
  selectedAssetForPanel: null,
  isNftPanelOpen: false,
  selectedNftForPanel: null,
  isMyCanvasOpen: false,
  isSearchOpen: false,
  isAuthModalOpen: false,
  isShareModalOpen: false,
  isShareOptionsModalOpen: false,
  isPaywallModalOpen: false,
  isAccountPanelOpen: false,
  isPostUpgradeModalOpen: false, // --- ADDED ---
  panelState: 'peek',
  assetToEdit: null,
  selectedAssetDetails: null,
  selectedNftDetails: null,
  isSettingsPanelExpanded: false,
};

const initialState = {
  activeOverlayMode: 'none',
  managementSubMode: 'myCanvas',
  isZenMode: false,
  viewMode: 'bubbles',
  isTrendingBarVisible: false,
  isAuthModalOpen: false,
  isShareModalOpen: false,
  shareableLink: null,
  isShareOptionsModalOpen: false,
  isPaywallModalOpen: false,
  paywallContext: 'default',
  postLoginAction: null,
  isPostUpgradeModalOpen: false, // --- ADDED: State for the new "ask" modal ---
  isSuccessModalOpen: false,
  isModalLoading: false,
  isSettingsOpen: false,
  isMyCanvasOpen: false,
  isAccountPanelOpen: false,
  accountPanelTab: 'welcome',
  panelState: 'peek',
  isSettingsPanelExpanded: false,
  isAssetPanelOpen: false,
  selectedAssetForPanel: null,
  isNftPanelOpen: false,
  selectedNftForPanel: null,
  zenFilterMode: null,
  logoDropEvent: null,
  restartTrigger: 0,
  fireEffectEvent: null,
  assetToEdit: null,
  isSearchOpen: getBrandConfig_Client().searchOpenByDefault,
  searchTerm: '',
  debounceTimer: null,
  searchResults: { coingecko: [], xrpl: [], nfts: [], web: [] },
  isSearchLoading: { coingecko: false, xrpl: false, nfts: false, web: false },
  selectedAssetDetails: null,
  selectedNftDetails: null,
  isFetchingDetails: false,
  isChartLoading: false,
  chartData: null,
  dataLensMode: 'timeframe',
  detailsMetric: 'market_cap',
  settingsTab: 'search',
  tableViewMode: 'coin',
  hasSetInitialTableView: false,
};

export const useUIStore = create((set, get) => ({
  ...initialState,

  // --- START: New actions for the "ask" modal ---
  openPostUpgradeModal: () => set({ ...closeAllPanels, isPostUpgradeModalOpen: true }),
  closePostUpgradeModal: () => set({ isPostUpgradeModalOpen: false }),
  // --- END: New actions ---

  setPostLoginAction: (action) => set({ postLoginAction: action }),
  clearPostLoginAction: () => set({ postLoginAction: null }),

  resetUI: () => set(initialState),
  setAccountPanelTab: (tab) => set({ accountPanelTab: tab }),
  setInitialTableView: () => set({ hasSetInitialTableView: true }),
  setTableViewMode: (mode) => set({ tableViewMode: mode }),
  setSettingsTab: (tab) => set({ settingsTab: tab }),

  cyclePanelState: () => set(state => {
    let nextState;
    if (state.panelState === 'peek') nextState = 'docked';
    else if (state.panelState === 'docked') nextState = 'expanded';
    else nextState = 'peek';
    return { panelState: nextState };
  }),

  toggleSettingsPanelExpanded: () => set(state => ({ isSettingsPanelExpanded: !state.isSettingsPanelExpanded })),

  setViewMode: (mode) => set({ viewMode: mode }),
  enterSearchMode: () => set({ activeOverlayMode: 'search' }),
  enterManagementMode: (subMode = 'myCanvas') => set({ activeOverlayMode: 'management', managementSubMode: subMode }),
  exitOverlayMode: () => set({ activeOverlayMode: 'none' }),

  openMyCanvas: (tab = 'search') => set({ ...closeAllPanels, isMyCanvasOpen: true, settingsTab: tab }),
  openAuthModal: () => set({ ...closeAllPanels, isAuthModalOpen: true }),
  openSearch: () => set({ ...closeAllPanels, isSearchOpen: true }),

  openAccountPanel: (tab = 'welcome') => set({ ...closeAllPanels, isAccountPanelOpen: true, accountPanelTab: tab }),
  closeAccountPanel: () => set({ isAccountPanelOpen: false }),

  openShareOptionsModal: () => set({ ...closeAllPanels, isShareOptionsModalOpen: true }),
  closeShareOptionsModal: () => set({ isShareOptionsModalOpen: false }),

  openPaywallModal: (context = 'default') => set({ ...closeAllPanels, isPaywallModalOpen: true, paywallContext: context }),
  closePaywallModal: () => set({ isPaywallModalOpen: false, paywallContext: 'default' }),

  openShareModal: (link, keepOtherPanelsOpen = false) => {
    if (keepOtherPanelsOpen) {
      set({ isShareModalOpen: true, shareableLink: link });
    } else {
      set({ ...closeAllPanels, isShareModalOpen: true, shareableLink: link });
    }
  },

  closeShareModal: () => set({ isShareModalOpen: false, shareableLink: null }),

  openAssetPanel: (asset) => {
    const state = get();
    if (state.isMyCanvasOpen || state.isSearchOpen || state.isNftPanelOpen || state.isAuthModalOpen || state.viewMode === 'table' || state.isAccountPanelOpen) return;
    set({ ...closeAllPanels, isAssetPanelOpen: true, selectedAssetForPanel: asset });
  },

  openNftPanel: (asset) => {
    const state = get();
    if (state.isMyCanvasOpen || state.isSearchOpen || state.isAssetPanelOpen || state.isAuthModalOpen || state.viewMode === 'table' || state.isAccountPanelOpen) return;
    set({ ...closeAllPanels, isNftPanelOpen: true, selectedNftForPanel: asset });
  },

  closeMyCanvas: () => set({ isMyCanvasOpen: false, panelState: 'peek', isSettingsPanelExpanded: false }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  closeAssetPanel: () => set({ isAssetPanelOpen: false, selectedAssetForPanel: null, panelState: 'peek' }),
  closeNftPanel: () => set({ isNftPanelOpen: false, selectedNftForPanel: null, panelState: 'peek' }),

  toggleTrendingBar: () => set(state => ({ isTrendingBarVisible: !state.isTrendingBarVisible })),
  toggleZenMode: () => set(state => ({ isZenMode: !state.isZenMode })),
  setZenFilterMode: (mode) => set({ zenFilterMode: mode }),
  setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  setModalLoading: (isLoading) => set({ isModalLoading: isLoading }),
  triggerLogoRain: (logoUrl) => set({ logoDropEvent: { id: Date.now(), logoUrl } }),
  triggerRestart: () => set(state => ({ restartTrigger: state.restartTrigger + 1 })),
  triggerFireEffect: () => set({ fireEffectEvent: Date.now() }),
  setDataLensMode: (mode) => set({ dataLensMode: mode }),
  setDetailsMetric: (metric) => set({ detailsMetric: metric }),

  openEditView: (asset) => {
    set({ isMyCanvasOpen: false, assetToEdit: asset });
  },
  closeEditView: () => {
    set({ assetToEdit: null, isMyCanvasOpen: true, settingsTab: 'edit' });
  },

  syncBrandDefaults: () => {
    const config = getBrandConfig_Client();
    set({ isSearchOpen: config.searchOpenByDefault });
  },

  setGlobalSearchTerm: (term) => {
    const updates = {
      searchTerm: term,
      isSearchOpen: true,
      selectedAssetDetails: null,
      selectedNftDetails: null,
    };
    if (get().panelState === 'peek' && term.length > 0) {
      updates.panelState = 'docked';
    }
    if (term.trim() === '') {
      updates.searchResults = { coingecko: [], xrpl: [], nfts: [], web: [] };
    }
    set(updates);
    if (term.trim() !== '') {
      get().fetchResults();
    }
  },

  setPanelSearchTerm: (term) => {
    const updates = {
      searchTerm: term,
      selectedAssetDetails: null,
      selectedNftDetails: null,
    };
    if (get().panelState === 'peek' && term.length > 0) {
      updates.panelState = 'docked';
    }
    if (term.trim() === '') {
      updates.searchResults = { coingecko: [], xrpl: [], nfts: [], web: [] };
    }
    set(updates);
    if (term.trim() !== '') {
        get().fetchResults();
    }
  },

  openFullView: (asset) => {
    if (!asset) return;
    if (asset.isNft || asset.tokenId) {
      get().showNftDetails(asset);
    } else {
      get().fetchAndSelectAsset(asset);
    }
  },

  fetchResults: () => {
    clearTimeout(get().debounceTimer);
    const newTimer = setTimeout(async () => {
        const { searchTerm } = get();
        if (searchTerm.trim().length < 2) {
          if (searchTerm.trim().length < 1) {
             set({ searchResults: { coingecko: [], xrpl: [], nfts: [], web: [] } });
          }
          return;
        }
        const lowerCaseTerm = searchTerm.toLowerCase().trim();
        const myAssetsKeywords = ['my', 'my assets', 'my canvas', 'my collection'];

        if (myAssetsKeywords.includes(lowerCaseTerm)) {
            const { useAssetStore } = await import('./useAssetStore.js');
            const { useUserStore } = await import('./useUserStore.js');
            const { masterAssetList, isInitializing } = useAssetStore.getState();
            const { personalization } = useUserStore.getState();

            if (isInitializing) {
                set({ searchResults: { coingecko: [], nfts: [], xrpl: [], web: [] }, isSearchLoading: { coingecko: true, nfts: false, xrpl: false, web: false } });
                return;
            }

            const standardOnCanvasIds = new Set(personalization.selectedStandardAssetIds || []);
            const customOnCanvasIds = new Set((personalization.customAssets || []).map(a => a.id));

            const myStandardAssets = masterAssetList.filter(asset => !asset.tokenId && standardOnCanvasIds.has(asset.id));
            const myCustomAssets = masterAssetList.filter(asset => asset.tokenId && customOnCanvasIds.has(asset.id));

            set({ searchResults: { coingecko: myStandardAssets, nfts: myCustomAssets, xrpl: [], web: [] }, isSearchLoading: { coingecko: false, nfts: false, xrpl: false, web: false } });
            return;
        }

        get().fetchCoinGeckoResults();
        get().fetchXrplResults();
        get().fetchNftResults();
        get().fetchWebResults();
    }, 400);
    set({ debounceTimer: newTimer });
  },

  fetchCoinGeckoResults: async () => {
    const { searchTerm } = get();
    if (isNftId(searchTerm)) {
        set(state => ({ searchResults: { ...state.searchResults, coingecko: [] } }));
        return;
    }
    set(state => ({ isSearchLoading: { ...state.isSearchLoading, coingecko: true } }));
    try {
        const cgResults = await searchCoins({ query: searchTerm, category: 'all' });
        set(state => ({
            searchResults: { ...state.searchResults, coingecko: cgResults?.coins || [] },
            isSearchLoading: { ...state.isSearchLoading, coingecko: false }
        }));
    } catch (error) {
        console.error("CoinGecko search failed in store:", error);
        set(state => ({ isSearchLoading: { ...state.isSearchLoading, coingecko: false } }));
    }
  },

  fetchXrplResults: async () => {
    const { searchTerm } = get();
    if (isNftId(searchTerm)) {
        set(state => ({ searchResults: { ...state.searchResults, xrpl: [] } }));
        return;
    }
    set(state => ({ isSearchLoading: { ...state.isSearchLoading, xrpl: true } }));
    try {
        const xrplResults = await searchXrplTokens({ query: searchTerm });
        set(state => ({
            searchResults: { ...state.searchResults, xrpl: xrplResults || [] },
            isSearchLoading: { ...state.isSearchLoading, xrpl: false }
        }));
    } catch (error) {
        console.error("XRPL search failed in store:", error);
        set(state => ({ isSearchLoading: { ...state.isSearchLoading, xrpl: false } }));
    }
  },

  fetchNftResults: async () => {
    const { searchTerm } = get();
    set(state => ({ isSearchLoading: { ...state.isSearchLoading, nfts: true } }));
    try {
        if (isNftId(searchTerm)) {
            const nftDetails = await getNftFullDetails(searchTerm);
            if (nftDetails && nftDetails.nftokenID) {
                const formattedResult = { ...nftDetails, id: nftDetails.nftokenID, tokenId: nftDetails.nftokenID, name: nftDetails.metadata?.name || 'Untitled NFT', image: nftDetails.assets?.image || null, symbol: 'NFT', isNft: true };
                set(state => ({ searchResults: { ...state.searchResults, nfts: [formattedResult] } }));
            } else {
                set(state => ({ searchResults: { ...state.searchResults, nfts: [] } }));
            }
        } else {
            set(state => ({ searchResults: { ...state.searchResults, nfts: [] } }));
        }
    } catch (error) {
        console.error("NFT search failed:", error);
    } finally {
        set(state => ({ isSearchLoading: { ...state.isSearchLoading, nfts: false } }));
    }
  },

  fetchWebResults: async () => {
    const { searchTerm } = get();
    if (isNftId(searchTerm)) {
        set(state => ({ searchResults: { ...state.searchResults, web: [] }}));
        return;
    }
    set(state => ({ isSearchLoading: { ...state.isSearchLoading, web: true } }));
    try {
        const results = await searchWeb(searchTerm);
        set(state => ({ searchResults: { ...state.searchResults, web: results.items || [] } }));
    } catch (error) {
        console.error("Web search failed:", error);
    } finally {
        set(state => ({ isSearchLoading: { ...state.isSearchLoading, web: false } }));
    }
  },

  closeSearch: () => {
    set({
      isSearchOpen: false,
      searchTerm: '',
      searchResults: { coingecko: [], xrpl: [], nfts: [], web: [] },
      isSearchLoading: { coingecko: false, xrpl: false, nfts: false, web: false },
      panelState: 'peek',
    });
  },

  fetchAndSelectAsset: async (assetPreview) => {
    if (!assetPreview || assetPreview.isNft) return;
    set({
        panelState: 'expanded',
        isFetchingDetails: true,
        selectedAssetDetails: assetPreview,
        chartData: null,
        selectedNftDetails: null
    });
    try {
      const fullData = (await fetchFullCoinData(assetPreview.id))[0];
      if (fullData) {
        set({ selectedAssetDetails: fullData, isFetchingDetails: false });
        get().fetchChartDataForSelectedAsset('1D');
      } else {
        throw new Error('Full data not found.');
      }
    } catch (error) {
      console.error("Failed to fetch full asset details:", error);
      set({ isFetchingDetails: false, selectedAssetDetails: null  });
    }
  },

  showNftDetails: (nftData) => {
    set({
      panelState: 'expanded',
      selectedNftDetails: nftData,
      selectedAssetDetails: null,
      chartData: null,
    });
  },

  deselectAsset: () => set({ selectedAssetDetails: null, chartData: null, panelState: 'docked' }),
  deselectNft: () => set({ selectedNftDetails: null, panelState: 'docked' }),

  fetchChartDataForSelectedAsset: async (timeframe) => {
    const { selectedAssetDetails } = get();
    if (!selectedAssetDetails) return;
    set({ isChartLoading: true });
    try {
      const data = await getChartData(selectedAssetDetails.id, timeframe);
      set({ chartData: data });
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    } finally {
      set({ isChartLoading: false });
    }
  },
}));