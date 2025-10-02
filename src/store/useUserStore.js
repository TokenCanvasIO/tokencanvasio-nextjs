import { create } from 'zustand';
import toast from 'react-hot-toast';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp, collection, addDoc } from 'firebase/firestore'; 
// --- UPDATED IMPORTS ---
import { db, auth } from '@/firebase.js';
import { getBrandConfig_Client } from '../brandConfig.js';
import { coinData } from '../../config.js'; // This path is correct, leave it as is

let stripePromise = null;
const loadStripe = () => {
  if (!stripePromise) {
    stripePromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        const stripe = window.Stripe('pk_live_51SAG0oRuOpqkr2WDbTDc9R5CqyRH7TYgZlNQ2liUCg69JgMG4lanUQMr4tPAGfhwb4GtRv4ZgCg5MhP40NeVsv7200F7rFODKL'); 
        resolve(stripe);
      };
      document.head.appendChild(script);
    });
  }
  return stripePromise;
};

let unsubscribeFromUser = null;

const sanitizeObjectForFirebase = (data) => {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(item => sanitizeObjectForFirebase(item));
  const sanitized = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      sanitized[key] = sanitizeObjectForFirebase(value);
    }
  }
  return sanitized;
};

const createDefaultPersonalization = () => {
    const brand = getBrandConfig_Client();
    let defaultAssetIds;
    let defaultCustomAssets = [];

    if (brand.key === 'xrp') {
        defaultAssetIds = [ 'ripple', 'fuzzybear', 'phnix', 'drop-2', 'army-3', 'toto-2', 'cult-2', 'flame-3', 'salute', '589-token', 'gei-bear', 'splash-2' ];
        defaultCustomAssets = [
            { id: 'local-default-nft-1', name: 'Loading NFT...', tokenId: '000813887B02BDEC677854602C4D776A65081AF702C8EEF11A9C0CD2057E653E', isSelected: true, bubble: { size: 'Large', logoSize: 'Large' } }, { id: 'local-default-nft-2', name: 'Loading NFT...', tokenId: '00080BB86C429EE66CE731CAA492445DFF564F9CB8A46A309D15C96305A848C7', isSelected: true, bubble: { size: 'Large', logoSize: 'Large' } }, { id: 'local-default-nft-3', name: 'Loading NFT...', tokenId: '000A1B5832A87D111BEC77BF500A9D3D98971BBBB5D900F78F004CC100000416', isSelected: true, bubble: { size: 'Large', logoSize: 'Large' } }, { id: 'local-default-nft-4', name: 'Loading NFT...', tokenId: '00081388145D9B828F16D70AC849B2BDF5964EEF91CD4CC79CE3234405C74FAA', isSelected: true, bubble: { size: 'Large', logoSize: 'Large' } }
        ];
    } else {
        defaultAssetIds = Object.keys(coinData).filter(key => coinData[key].default === true);
        defaultCustomAssets = [{ id: 'default-tokencanvas-nft-1', name: 'Loading NFT...', tokenId: '00082710E5A608694A82CE2495BB52D7CB92086ED4E0D1EC38B8D9F90000009F', isSelected: true, bubble: { size: 'Large', logoSize: 'Large' } }];
    }
    const customAssetIds = defaultCustomAssets.map(asset => asset.id);
    const combinedFavorites = [...defaultAssetIds, ...customAssetIds];
    
    return {
        theme: 'grok', siteTitle: '', siteLogo: null, favorites: combinedFavorites, favoriteWebLinks: [], customAssets: defaultCustomAssets, userTier: 'free', selectedStandardAssetIds: defaultAssetIds, bubbleSpeed: 'medium', priceActionColors: { positive: '#00FF00', negative: '#FF0000', neutral: '#FFFFFF' }, nftBubbleSettings: { logoSize: 'Medium', showDetails: true }, isLiveShareEnabled: false, isXrpExcluded: false,
    };
};

const initialState = {
  user: null,
  personalization: createDefaultPersonalization(),
  isPersonalizationLoaded: false,
  isWalletConnected: false,
  walletAddress: null,
  updateTicker: 0,
  signingState: 'idle',
};

let debounceTimer;
const debouncedSave = (func, delay) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
};

export const useUserStore = create((set, get) => ({
  ...initialState,

  getNftLimit: () => {
    const brandConfig = getBrandConfig();
    const userTier = get().personalization.userTier || 'free';
    return brandConfig.limits.nfts[userTier] || brandConfig.limits.nfts.free;
  },

  getNftCount: () => {
    return get().personalization.customAssets?.length || 0;
  },

  isAtNftLimit: () => {
    const count = get().getNftCount();
    const limit = get().getNftLimit();
    return count >= limit;
  },

  isAtGrandTotalAssetLimit: () => {
    const brandConfig = getBrandConfig();
    const nftCount = get().getNftCount();
    const coinCount = get().personalization.selectedStandardAssetIds?.length || 0;
    return (nftCount + coinCount) >= brandConfig.limits.total;
  },

  getWebLinkLimit: () => {
    const brandConfig = getBrandConfig();
    const userTier = get().personalization.userTier || 'free';
    return brandConfig.limits.webLinks[userTier] || brandConfig.limits.webLinks.free;
  },

  isAtWebLinkLimit: () => {
    const linkCount = get().personalization.favoriteWebLinks?.length || 0;
    const limit = get().getWebLinkLimit();
    return linkCount >= limit;
  },

  initiatePremiumCheckout: async (options = {}) => {
    const { amount, currency, originBrand } = options; 
    const { user, walletAddress } = get();
    const userId = user?.uid || walletAddress;
  
    if (!userId) {
      toast.error("You need to log in to subscribe.");
      return 'loginRequired';
    }
  
    const toastId = toast.loading('Preparing checkout...');
    
    try {
      const functionUrl = 'https://createstripecheckout-i3mgmybaca-uc.a.run.app';
      
      const checkoutBody = {
        userId: userId,
        amount: amount,
        currency: currency || 'usd',
        originBrand: originBrand,
      };
  
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Cloud function error:", errorBody);
        throw new Error("Failed to create checkout session.");
      }
  
      const { sessionId } = await response.json();
      if (!sessionId) {
        throw new Error("Invalid session ID received from server.");
      }
  
      const stripe = await loadStripe();
      const { error } = await stripe.redirectToCheckout({ sessionId });
        
      if (error) { 
        toast.error(error.message, { id: toastId });
      } else { 
        toast.dismiss(toastId); 
      }
    } catch (error) {
      console.error("Stripe checkout initiation failed:", error);
      toast.error('Could not connect to payment processor.', { id: toastId });
    }
  },

  grantPromotionalMembership: async () => {
    const { user, walletAddress, updatePersonalization } = get();
    const userId = user?.uid || walletAddress;

    if (!userId) {
      toast.error("Please sign in to get free access.");
      // --- UPDATED DYNAMIC IMPORT ---
      const { openAuthModal, setPostLoginAction } = (await import('@/store/useUIStore.js')).useUIStore.getState();
      setPostLoginAction('grantPromotion');
      openAuthModal();
      return;
    }

    const toastId = toast.loading('Activating your free access...');

    try {
      updatePersonalization({ 
        userTier: 'premium', 
        promotionStatus: 'early_adopter' 
      });

      toast.success("Welcome, Member! Your promotional access is active.", { id: toastId });

      // --- UPDATED DYNAMIC IMPORT ---
      const { useUIStore } = await import('@/store/useUIStore.js');
      useUIStore.getState().closePaywallModal();
      useUIStore.getState().openPostUpgradeModal();

    } catch (error) {
      console.error("Error granting promotional access:", error);
      toast.error("Could not activate free access. Please try again.", { id: toastId });
    }
  },
  
  redirectToStripePortal: async () => {
    const { user, walletAddress } = get();
    const userId = user?.uid || walletAddress;

    if (!userId) {
      toast.error("You must be signed in to manage your subscription.");
      return;
    }

    const toastId = toast.loading('Redirecting to portal...');
    try {
      const functionUrl = 'https://createstripeportallink-i3mgmybaca-uc.a.run.app';
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, returnUrl: window.location.href }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session.');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error redirecting to Stripe portal:", error);
      toast.error("Could not open subscription portal.", { id: toastId });
    }
  },

  generateSnapshotLink: async () => {
    const { personalization, user, walletAddress } = get();
    const userId = user?.uid || walletAddress;

    if (!userId) {
      toast.error("You must be signed in to share.");
      // --- UPDATED DYNAMIC IMPORT ---
      const { openAuthModal } = (await import('@/store/useUIStore.js')).useUIStore.getState();
      openAuthModal();
      return null;
    }
    
    const toastId = toast.loading('Creating snapshot...');
    try {
      const snapshotData = { ...personalization, createdAt: new Date().toISOString(), ownerId: userId, };
      const docRef = await addDoc(collection(db, 'sharedCanvases'), snapshotData);
      const shareUrl = `${window.location.origin}/#/snapshot/${docRef.id}`;
      toast.success('Snapshot link is ready!', { id: toastId });
      return shareUrl;
    } catch (error) {
      toast.error('Could not create snapshot link.', { id: toastId });
      console.error("Error creating snapshot:", error);
      return null;
    }
  },
  
  startUserListener: (userId) => {
    if (unsubscribeFromUser) unsubscribeFromUser();
    
    const docRef = doc(db, 'users', userId);
    unsubscribeFromUser = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().personalization) {
        const firebaseData = docSnap.data().personalization;
        set((state) => ({ personalization: { ...state.personalization, ...firebaseData }, }));
      } else {
        console.warn("Listener active, but document data is not yet available.");
      }
    });
  },

  stopUserListener: () => {
    if (unsubscribeFromUser) {
      unsubscribeFromUser();
      unsubscribeFromUser = null;
    }
  },

  createUserDocument: async (userAuth) => {
    if (!userAuth || !userAuth.uid) return;
    const userDocRef = doc(db, 'users', userAuth.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      const defaultPersonalization = createDefaultPersonalization();
      const initialUserData = {
        personalization: { ...defaultPersonalization, email: userAuth.email, createdAt: serverTimestamp(), }
      };
      try {
        await setDoc(userDocRef, initialUserData);
      } catch (error) {
        console.error("Error creating user document", error);
      }
    }
  },

  signOut: async () => {
    try {
      if (auth.currentUser) { 
        await firebaseSignOut(auth); 
      }
      // --- UPDATED DYNAMIC IMPORT ---
      const { closeAccountPanel } = (await import('@/store/useUIStore.js')).useUIStore.getState();
      closeAccountPanel();
      toast.success("Signed out successfully.");
    } catch (error) {
      console.error("🔴 Sign Out Error:", error);
      toast.error("Failed to sign out.");
    }
  },
  
  _syncPublicCanvas: async () => {
    const { user, walletAddress, personalization } = get();
    const userId = user?.uid || walletAddress;
    if (!userId || !personalization.isLiveShareEnabled) return;
    const publicData = { theme: personalization.theme, siteTitle: personalization.siteTitle, siteLogo: personalization.siteLogo, customAssets: personalization.customAssets, selectedStandardAssetIds: personalization.selectedStandardAssetIds, isXrpExcluded: personalization.isXrpExcluded, };
    try {
        await setDoc(doc(db, 'public_canvases', userId), publicData, { merge: true });
    } catch (error) {
        console.error("🔥 Error syncing public canvas:", error);
    }
  },

  setLiveShareEnabled: async (enabled) => {
    const { user, walletAddress, _syncPublicCanvas } = get();
    const userId = user?.uid || walletAddress;
    if (!userId) {
        toast.error("You must be logged in to enable live sharing.");
        return;
    }
    get().updatePersonalization({ isLiveShareEnabled: enabled });
    if (enabled) {
        toast.promise(_syncPublicCanvas(), {
            loading: 'Creating public canvas...', success: 'Live share enabled!', error: 'Could not enable live share.',
        });
    } else {
        try {
            await deleteDoc(doc(db, 'public_canvases', userId));
            toast.success('Live share disabled.');
        } catch (error) {
            console.error("🔥 Error disabling live share:", error);
            toast.error('Could not disable live share.');
        }
    }
  },

  toggleXrpExcluded: () => {
    const currentState = get().personalization.isXrpExcluded;
    get().updatePersonalization({ isXrpExcluded: !currentState });
  },

  loadSharedCanvas: async (id, type) => {
    set({ isPersonalizationLoaded: false });
    const collectionName = type === 'snapshot' ? 'sharedCanvases' : 'public_canvases';
    const defaultData = createDefaultPersonalization();
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists) {
        const sharedData = docSnap.data();
        set({ personalization: { ...defaultData, ...sharedData }, user: null, walletAddress: null, isWalletConnected: false, isPersonalizationLoaded: true, });
      } else {
        console.error("Shared canvas not found:", id);
        toast.error("This shared canvas could not be found.");
        set({ isPersonalizationLoaded: true, personalization: defaultData });
      }
    } catch (error) {
      console.error("Error loading shared canvas:", error);
      toast.error("An error occurred while loading this canvas.");
      set({ isPersonalizationLoaded: true, personalization: defaultData });
    }
  },

  loadUserAndPersonalization: async (firebaseUserOrWalletAddress) => {
    set({ isPersonalizationLoaded: false });
    const defaultData = createDefaultPersonalization();
    let userId = null;
    let userAuth = null;

    if (typeof firebaseUserOrWalletAddress === 'object' && firebaseUserOrWalletAddress?.uid) {
      userAuth = firebaseUserOrWalletAddress;
      set({ user: userAuth, walletAddress: null, isWalletConnected: false });
      userId = userAuth.uid;
    } else if (typeof firebaseUserOrWalletAddress === 'string') {
      set({ user: null, walletAddress: firebaseUserOrWalletAddress, isWalletConnected: true });
      userId = firebaseUserOrWalletAddress;
    }

    if (userAuth) {
      await get().createUserDocument(userAuth);
    }

    if (userId) {
      try {
        const docSnap = await getDoc(doc(db, 'users', userId));
        if (docSnap.exists && docSnap.data().personalization) {
          const firebaseData = docSnap.data().personalization;
          set({ personalization: { ...defaultData, ...firebaseData } });
        } else {
          set({ personalization: defaultData });
        }
        get().startUserListener(userId);
      } catch (error) {
        console.error("🔥 Error loading from Firebase:", error);
        set({ personalization: defaultData });
      }
    } else {
      set({ personalization: defaultData });
    }
    set({ isPersonalizationLoaded: true });
  },
   
  clearUser: async () => {
    get().stopUserListener(); 
    localStorage.removeItem(`${getBrandConfig().key}_userPersonalization`);
    set({ ...initialState, isPersonalizationLoaded: true, personalization: createDefaultPersonalization() });
    
    try {
      // --- UPDATED DYNAMIC IMPORT ---
      const { useUIStore } = await import('@/store/useUIStore.js');
      useUIStore.getState().resetUI();
    } catch (error) {
      console.error("Failed to reset UI store:", error);
    }
  },
  
  resetUser: () => {
    get().stopUserListener(); 
    localStorage.removeItem(`${getBrandConfig().key}_userPersonalization`);
    set({ ...initialState, isPersonalizationLoaded: true, personalization: createDefaultPersonalization() });
  },

  updatePersonalization: (newData) => {
    set((state) => {
      const updatedPersonalization = { ...state.personalization, ...newData };
      localStorage.setItem(`${getBrandConfig().key}_userPersonalization`, JSON.stringify(updatedPersonalization));
      debouncedSave(() => get().savePersonalizationToFirebase(), 2000);
      return { personalization: updatedPersonalization, updateTicker: state.updateTicker + 1 };
    });
  },

  savePersonalizationToFirebase: async () => {
    const { user, walletAddress, personalization } = get();
    const userId = user?.uid || walletAddress;

    if (!userId) {
      toast.error("You must be signed in to save your canvas.");
      return { success: false, message: "User not signed in." };
    } 

    const sanitizedData = sanitizeObjectForFirebase(personalization);
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, { personalization: sanitizedData }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("🔥 Error saving to Firebase:", error);
      toast.error("Could not save to cloud. Please check your connection.");
      return { success: false, message: error.message };
    }
  },
  
  toggleFavoriteWebLink: (webLink) => {
    const { personalization, isAtWebLinkLimit, getWebLinkLimit } = get();
    const currentFavWebLinks = personalization.favoriteWebLinks || [];
    const isFavorited = currentFavWebLinks.some(link => link.link === webLink.link);
    let newFavWebLinks;

    if (isFavorited) {
      newFavWebLinks = currentFavWebLinks.filter(link => link.link !== webLink.link);
      toast('Link removed from My Links');
    } else {
      if (isAtWebLinkLimit()) {
        const limit = getWebLinkLimit();
        const userTier = personalization.userTier || 'free';
        
        toast.error(`You've reached your limit of ${limit} saved links.`);

        if (userTier === 'free') {
          // --- UPDATED DYNAMIC IMPORT ---
          import('@/store/useUIStore.js').then(({ useUIStore }) => {
              useUIStore.getState().openPaywallModal('default');
          });
        }
        return;
      }

      newFavWebLinks = [...currentFavWebLinks, webLink];
      toast.success('Link added to My Links!');
    }
    get().updatePersonalization({ favoriteWebLinks: newFavWebLinks });
  },
}));