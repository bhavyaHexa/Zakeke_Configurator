import { makeAutoObservable, runInAction } from 'mobx';
import { fetchProductWith3DMedia, fetchAllProducts } from '../api/shopifyClient';
import { parseRulesFromDescription } from '../utils/ruleParser';

class LeftSideStore {
  designManager;
  productList = [];
  activeProductHandle = null;

  constructor(designManager) {
    this.designManager = designManager;
    makeAutoObservable(this, {
      designManager: false
    });
  }

  async fetchAllProducts() {
    this.designManager.rightSideStore.setIsLoading(true);
    this.designManager.rightSideStore.setApiError(null);
    try {
      const products = await fetchAllProducts();
      runInAction(() => {
        this.productList = products;
        this.designManager.rightSideStore.setIsLoading(false);
        if (products.length > 0 && !this.activeProductHandle) {
          this.activeProductHandle = products[0].handle;
          this.fetchProductData(products[0].handle);
        }
      });
    } catch (error) {
      runInAction(() => {
        this.designManager.rightSideStore.setApiError(error.message || 'Failed to fetch products');
        this.designManager.rightSideStore.setIsLoading(false);
      });
    }
  }

  setActiveProductHandle(handle) {
    this.activeProductHandle = handle;
    if (handle) {
      this.fetchProductData(handle);
    }
  }

  async fetchProductData(handle) {
    this.designManager.rightSideStore.setIsLoading(true);
    this.designManager.rightSideStore.setApiError(null);
    
    try {
      const data = await fetchProductWith3DMedia(handle);
      
      runInAction(() => {
        this.designManager.rightSideStore.productTitle = data.title;
        this.designManager.rightSideStore.productDescription = data.description;
        
        // Pass 3D related data to Design3dManager -> ConfiguratorStoreManager
        const configuratorManager = this.designManager.rootStore.design3dManager.configuratorStoreManager;
        
        if (data.glbUrl) {
          configuratorManager.setGlbUrl(data.glbUrl);
        } else {
          this.designManager.rightSideStore.setApiError('No 3D model found for this product.');
          configuratorManager.setGlbUrl(null);
        }
        
        const parsedRules = parseRulesFromDescription(data.description);
        configuratorManager.setConfigurationRules(parsedRules);
        
        // Pass environment rules
        const envManager = this.designManager.rootStore.design3dManager.environmentStoreManager;
        envManager.setEnvironmentRules(parsedRules, {
          envMetafield: data.envMetafield,
          hdrUrl: data.hdrUrl
        });
        
        this.designManager.rightSideStore.setIsLoading(false);
      });
    } catch (error) {
      runInAction(() => {
        this.designManager.rightSideStore.setApiError(error.message || 'Failed to fetch product data');
        this.designManager.rightSideStore.setIsLoading(false);
      });
    }
  }
}

export default LeftSideStore;
