import { create } from 'zustand';
import toast from 'react-hot-toast';
import { fetchFullCoinData, fetchSingleNftDetails, getTokenomics } from '../services/api.js';
import { coinData as staticCoinData } from '../../config.js';
import { getBrandConfig_Client } from '../brandConfig';
import { useUserStore } from './useUserStore.js';
import { useEffect } from 'react';

export const useAssetStore = create((set, get) => ({
  masterAssetList: [],
  coinData: [],
  customAssetData: {},
  isLoading: true,
  isInitializing: false,
  error: null,
  timeframe: '24h',
  updateTicker: 0,
  setCoinData: (newCoinData) => set({ coinData: newCoinData }),

  filterCanvasData: (personalizationState, masterListToFilter) => {
    const brand = getBrandConfig_Client();
    const { selectedStandardAssetIds = [], customAssets = [] } = personalizationState;
    const customAssetIds = new Set(customAssets.map(asset => asset.id));

    const finalCanvasList = masterListToFilter.filter(asset => {
        const isSelectedStandard = !asset.tokenId && selectedStandardAssetIds.includes(asset.id);
        const isSelectedCustom = brand.enableNfts && asset.tokenId && customAssetIds.has(asset.id);
        return isSelectedStandard || isSelectedCustom;
    });
    finalCanvasList.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
    return finalCanvasList;
  },

  initializeAndFetchAllAssets: async () => {
    if (get().isInitializing) return;

    const isFirstLoad = get().masterAssetList.length === 0;
    set({ 
      isLoading: isFirstLoad,
      error: null, 
      isInitializing: true 
    });
    
    try {
      const { personalization } = useUserStore.getState();
      const standardAssetIds = personalization.selectedStandardAssetIds || [];
      const customAssetsToProcess = personalization.customAssets || [];
      
      if (standardAssetIds.length === 0 && customAssetsToProcess.length === 0) {
        set({ masterAssetList: [], coinData: [], isLoading: false, isInitializing: false });
        return;
      }

      let processedCustomAssets = [];
      if (customAssetsToProcess.length > 0) {
        processedCustomAssets = await Promise.all(
          customAssetsToProcess.map(async (asset) => {
            try { 
              const details = await fetchSingleNftDetails(asset.tokenId);
              return { ...asset, ...details }; 
            } 
            catch (error) { console.error(`Failed to fetch live data for NFT ${asset.tokenId}.`); return asset; }
          })
        );
      }

      const marketData = await fetchFullCoinData(standardAssetIds);
      let coinMasterList = standardAssetIds.map(id => ({ ...staticCoinData[id], ...marketData.find(c => c.id === id) })).filter(c => c.name);
      
      const tokenomicsPromises = coinMasterList.map(asset => getTokenomics(asset).catch(err => { console.error(`Failed to fetch tokenomics for ${asset.id}:`, err); return null; }));
      const tokenomicsResults = await Promise.all(tokenomicsPromises);
      coinMasterList = coinMasterList.map((asset, index) => {
          const tokenomics = tokenomicsResults[index];
          return tokenomics ? { ...tokenomics, ...asset } : asset;
      });

      const completeMasterList = [...coinMasterList, ...processedCustomAssets];
      const finalCanvasData = get().filterCanvasData(personalization, completeMasterList);
      
      const newCustomAssetData = {};
      processedCustomAssets.forEach(asset => { newCustomAssetData[asset.id] = asset; });

      set({ 
          masterAssetList: completeMasterList, 
          coinData: finalCanvasData, 
          customAssetData: newCustomAssetData, 
          isLoading: false, 
          isInitializing: false 
      });
    } catch (error) {
      console.error("🔴 A fatal error occurred during data initialization:", error);
      set({ error, isLoading: false, isInitializing: false });
    }
  },

  toggleAsset: async (assetPreview) => {
    const { personalization, updatePersonalization } = useUserStore.getState();
    const { masterAssetList } = get();
    const isNft = !!(assetPreview.tokenId || assetPreview.isNft);

    const isOnCanvas = isNft
      ? (personalization.customAssets || []).some(a => a.tokenId === assetPreview.tokenId)
      : (personalization.selectedStandardAssetIds || []).includes(assetPreview.id);

    let updatedPersonalization = { ...personalization };
    let newMasterList = [...masterAssetList];

    if (isOnCanvas) {
      if (isNft) {
        updatedPersonalization.customAssets = (personalization.customAssets || []).filter(a => a.tokenId !== assetPreview.tokenId);
      } else {
        updatedPersonalization.selectedStandardAssetIds = (personalization.selectedStandardAssetIds || []).filter(id => id !== assetPreview.id);
      }
      toast.success('Removed from Canvas');
    } else {
      if (isNft) {
        const defaultNftSettings = personalization.nftBubbleSettings || { size: 'Medium', logoSize: 'Medium', showDetails: true };
        const uniqueId = `nft-${Date.now()}`;
        
        const newNft = { 
          ...assetPreview, 
          id: uniqueId,
          bubble: {
              size: defaultNftSettings.size || 'Medium',
              logoSize: defaultNftSettings.logoSize || 'Medium',
              showDetails: defaultNftSettings.showDetails ?? true,
          }
        };
        
        if (!newMasterList.some(a => a.id === newNft.id)) {
            newMasterList.push(newNft); 
        }
        
        updatedPersonalization.customAssets = [...(personalization.customAssets || []), newNft];
      } else {
        let fullAssetData = masterAssetList.find(a => a.id === assetPreview.id);
        if (!fullAssetData) {
          try {
            fullAssetData = (await fetchFullCoinData([assetPreview.id]))[0];
            if (!fullAssetData) throw new Error('Failed to fetch coin data');
            newMasterList.push(fullAssetData);
          } catch {
            toast.error(`Could not add ${assetPreview.name}.`);
            return;
          }
        }
        updatedPersonalization.selectedStandardAssetIds = [...(personalization.selectedStandardAssetIds || []), assetPreview.id];
      }
      toast.success('Added to Canvas');
    }

    updatePersonalization(updatedPersonalization);
    set({
      masterAssetList: newMasterList,
      coinData: get().filterCanvasData(updatedPersonalization, newMasterList)
    });
  },
  
  updateCustomAsset: (updatedAsset) => {
    const { personalization, updatePersonalization } = useUserStore.getState();
    const updatedCustomAssets = (personalization.customAssets || []).map(asset =>
      asset.id === updatedAsset.id ? updatedAsset : asset
    );
    const updatedPersonalization = { ...personalization, customAssets: updatedCustomAssets };
    updatePersonalization(updatedPersonalization);
    set(state => {
      const newMasterList = state.masterAssetList.map(asset =>
        asset.id === updatedAsset.id ? updatedAsset : asset
      );
      const newCoinData = get().filterCanvasData(updatedPersonalization, newMasterList);
      return {
        masterAssetList: newMasterList,
        coinData: newCoinData,
        customAssetData: { ...state.customAssetData, [updatedAsset.id]: updatedAsset }
      };
    });
  },
  
  removeCustomAsset: (assetId) => {
    const { personalization, updatePersonalization } = useUserStore.getState();
    const updatedPersonalization = {
      ...personalization,
      customAssets: (personalization.customAssets || []).filter(a => a.id !== assetId),
      favorites: (personalization.favorites || []).filter(id => id !== assetId)
    };
    updatePersonalization(updatedPersonalization);
    set(state => {
      const newMasterList = state.masterAssetList.filter(a => a.id !== assetId);
      const newCoinData = get().filterCanvasData(updatedPersonalization, newMasterList);
       return {
        masterAssetList: newMasterList,
        coinData: newCoinData
      };
    });
  },

  refreshAsset: async (assetId) => {
    const { masterAssetList } = get();
    const assetToRefresh = masterAssetList.find(a => a.id === assetId);
    if (!assetToRefresh || !assetToRefresh.tokenId) return;
    try {
      toast.loading('Refreshing NFT data...', { id: 'refresh-toast' });
      const freshData = await fetchSingleNftDetails(assetToRefresh.tokenId);
      set(state => {
        const updatedAsset = { ...assetToRefresh, ...freshData };
        const newMasterList = state.masterAssetList.map(asset => asset.id === assetId ? updatedAsset : asset);
        const newCustomAssetData = { ...state.customAssetData, [assetId]: updatedAsset };
        const { personalization } = useUserStore.getState();
        const newCoinData = state.filterCanvasData(personalization, newMasterList);
        toast.success('NFT data refreshed!', { id: 'refresh-toast' });
        return {
          masterAssetList: newMasterList,
          customAssetData: newCustomAssetData,
          coinData: newCoinData,
          updateTicker: state.updateTicker + 1,
        };
      });
    } catch (error) {
      console.error(`Failed to refresh data for NFT ${assetToRefresh.tokenId}:`, error);
      toast.error('Failed to refresh data.', { id: 'refresh-toast' });
    }
  },

  setTimeframe: (newTimeframe) => set({ timeframe: newTimeframe }),
}));

export const usePersonalizationListener = () => {
    const { initializeAndFetchAllAssets } = useAssetStore.getState();
    useEffect(() => {
        const unsubscribe = useUserStore.subscribe(
            (state, prevState) => {
                const personalizationJustLoaded = !prevState.isPersonalizationLoaded && state.isPersonalizationLoaded;
                const assetsChanged = JSON.stringify(prevState.personalization.customAssets) !== JSON.stringify(state.personalization.customAssets);
                if (personalizationJustLoaded || assetsChanged) {
                    initializeAndFetchAllAssets();
                }
            }
        );
        if (useUserStore.getState().isPersonalizationLoaded) {
            initializeAndFetchAllAssets();
        }
        return () => unsubscribe();
    }, [initializeAndFetchAllAssets]);
};