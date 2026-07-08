import { makeAutoObservable, runInAction } from 'mobx';
import { fetchProductWith3DMedia, fetchAllProducts } from '../api/shopifyClient';

class ConfiguratorStore {
  // --- State ---
  isLoading = false;
  loadingProgress = 0;
  apiError = null;
  
  // Shopify Product Data
  productList = [];
  activeProductHandle = null;
  productTitle = '';
  productDescription = '';
  
  // Active Configuration State
  glbUrl = null;
  selectedOptions = {
    color: '#ffffff'
  };

  constructor() {
    makeAutoObservable(this);
  }

  // --- Actions ---
  
  setIsLoading(status) {
    this.isLoading = status;
  }

  setLoadingProgress(progress) {
    this.loadingProgress = progress;
  }

  setGlbUrl(url) {
    this.glbUrl = url;
  }
  
  setApiError(error) {
    this.apiError = error;
  }

  setOption(key, value) {
    this.selectedOptions[key] = value;
  }

  /**
   * Fetches the list of all products
   */
  async fetchAllProducts() {
    this.setIsLoading(true);
    this.setApiError(null);
    try {
      const products = await fetchAllProducts();
      runInAction(() => {
        this.productList = products;
        this.isLoading = false;
        // Optionally auto-select the first product if none is selected
        if (products.length > 0 && !this.activeProductHandle) {
          this.activeProductHandle = products[0].handle;
          this.fetchProductData(products[0].handle);
        }
      });
    } catch (error) {
      runInAction(() => {
        this.setApiError(error.message || 'Failed to fetch products');
        this.isLoading = false;
      });
    }
  }

  setActiveProductHandle(handle) {
    this.activeProductHandle = handle;
    if (handle) {
      this.fetchProductData(handle);
    }
  }

  /**
   * Fetches product data from Shopify and sets up the configurator
   * @param {string} handle - Shopify product handle
   */
  async fetchProductData(handle) {
    this.setIsLoading(true);
    this.setApiError(null);
    
    try {
      const data = await fetchProductWith3DMedia(handle);
      
      runInAction(() => {
        this.productTitle = data.title;
        this.productDescription = data.description;
        
        if (data.glbUrl) {
          this.setGlbUrl(data.glbUrl);
        } else {
          this.setApiError('No 3D model found for this product.');
        }
        
        // Parse custom rules from description if needed
        // const parsedRules = this.parseRulesFromDescription(data.description);
        
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.setApiError(error.message || 'Failed to fetch product data');
        this.isLoading = false;
      });
    }
  }

  // --- Helpers ---
  parseRulesFromDescription(descriptionHtml) {
    // Placeholder logic for future rule parsing
    return {};
  }
}

export default ConfiguratorStore;
