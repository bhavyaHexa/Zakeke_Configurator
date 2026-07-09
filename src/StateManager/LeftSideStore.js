import { makeAutoObservable, runInAction } from 'mobx';
import { fetchProductWith3DMedia, fetchAllProducts } from '../api/shopifyClient';

class LeftSideStore {
  designManager;
  productList = [];
  activeProductId = null;

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
        if (products.length > 0 && !this.activeProductId) {
          this.activeProductId = products[0].id;
          this.fetchProductData(products[0].id);
        }
      });
    } catch (error) {
      runInAction(() => {
        this.designManager.rightSideStore.setApiError(error.message || 'Failed to fetch products');
        this.designManager.rightSideStore.setIsLoading(false);
      });
    }
  }

  setActiveProductId(id) {
    this.activeProductId = id;
    if (id) {
      this.fetchProductData(id);
    }
  }

  async fetchProductData(id) {
    this.designManager.rightSideStore.setIsLoading(true);
    this.designManager.rightSideStore.setApiError(null);
    
    try {
      const rawData = await fetchProductWith3DMedia(id);
      
      runInAction(() => {
        // Handle database response format where product data could be nested inside a .data property
        const productDetails = rawData?.data || rawData;
        
        if (!productDetails) {
          throw new Error("No product details found in backend response.");
        }

        this.designManager.rightSideStore.productTitle = productDetails.productName || 'Product';
        this.designManager.rightSideStore.productDescription = productDetails.sku ? `SKU: ${productDetails.sku}` : '';
        
        const configuratorManager = this.designManager.rootStore.design3dManager.configuratorStoreManager;
        configuratorManager.clearConfigurations();

        // Detect GLB Model URL: environments.file or modelMediaId or glbUrl
        const glbUrl = productDetails.environments?.file || productDetails.modelMediaId || productDetails.glbUrl || null;
        
        if (glbUrl) {
          configuratorManager.setGlbUrl(glbUrl);
        } else {
          this.designManager.rightSideStore.setApiError('No 3D model found for this product.');
          configuratorManager.setGlbUrl(null);
        }
        
        // Save camera options: camera.position maps to defaultAngle [pitch, yaw, roll]
        const cameraAngle = {
          defaultAngle: productDetails.camera?.position || [0, 90, 0],
          zoomLimit: productDetails.cameraAngle?.zoomLimit || [0.5, 4]
        };
        configuratorManager.setCameraAngle(cameraAngle);

        // Load mesh customizer configurations: colors and textures
        configuratorManager.setMeshColorsRules(productDetails.mesh || []);
        configuratorManager.setMeshTexturesRules(productDetails.textures || []);
        
        // Pass environment rules
        const envManager = this.designManager.rootStore.design3dManager.environmentStoreManager;
        envManager.setEnvironmentRules(productDetails.environments || null);
        
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
