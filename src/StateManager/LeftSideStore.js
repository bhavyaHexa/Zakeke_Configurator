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
        if (products && products.length > 0) {
          this.productList = products.map(p => ({
            ...p,
            title: p.title,
            thumbnail: p.thumbnail || null
          }));
        } else {
          this.productList = [];
        }

        this.designManager.rightSideStore.setIsLoading(false);
        
        const defaultProduct = this.productList[0];
        if (defaultProduct && !this.activeProductId) {
          this.activeProductId = defaultProduct.id;
          this.fetchProductData(defaultProduct.id);
        }
      });
    } catch (error) {
      runInAction(() => {
        this.productList = [];
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
      let rawData;
      try {
        rawData = await fetchProductWith3DMedia(id);
      } catch (e) {
        rawData = null;
      }
      
      runInAction(() => {
        let productDetails = rawData?.data || rawData;
        
        if (!productDetails) {
          this.designManager.rightSideStore.productTitle = 'No Product';
          this.designManager.rightSideStore.productDescription = '';
          this.designManager.rightSideStore.setApiError('No product details found.');
          const design3d = this.designManager.rootStore.design3dManager;
          design3d.configuratorStoreManager.clearConfigurations();
          design3d.colorChangeStoreManager.clearConfigurations();
          design3d.cameraStoreManager.clearConfigurations();
          design3d.configuratorStoreManager.setGlbUrl(null);
          this.designManager.rightSideStore.setIsLoading(false);
          return;
        }
        
        this.designManager.rightSideStore.productTitle = productDetails.productName || 'Product';
        this.designManager.rightSideStore.productDescription = productDetails.sku ? `SKU: ${productDetails.sku}` : '';
        
        const design3d = this.designManager.rootStore.design3dManager;
        design3d.configuratorStoreManager.clearConfigurations();
        design3d.colorChangeStoreManager.clearConfigurations();
        design3d.cameraStoreManager.clearConfigurations();

        const glbUrl = productDetails.glbUrl;
        if (glbUrl) {
          design3d.configuratorStoreManager.setGlbUrl(glbUrl);
        } else {
          this.designManager.rightSideStore.setApiError('No 3D model found for this product.');
          design3d.configuratorStoreManager.setGlbUrl(null);
        }
        
        // Save camera options
        let cameraAngle = null;
        if (productDetails.camera) {
          cameraAngle = {
            position: productDetails.camera.position || null,
            target: productDetails.camera.target || null,
            fov: productDetails.camera.fov || null,
            near: productDetails.camera.near || null,
            far: productDetails.camera.far || null,
            minDistance: productDetails.camera.minDistance || null,
            maxDistance: productDetails.camera.maxDistance || null,
            defaultAngle: productDetails.camera.position || [0, 90, 0],
            zoomLimit: [productDetails.camera.minDistance || 0.5, productDetails.camera.maxDistance || 4]
          };
        } else {
          cameraAngle = {
            defaultAngle: [0, 90, 0],
            zoomLimit: [0.5, 4]
          };
        }
        design3d.cameraStoreManager.setCameraAngle(cameraAngle);

        // Load mesh configurations: colors
        const meshRules = Array.isArray(productDetails.mesh) ? productDetails.mesh : [];
        const colorRules = meshRules
          .filter(r => r.colors && r.colors.length > 0)
          .map(r => ({
            name: r.name,
            colors: r.colors || []
          }));

        design3d.colorChangeStoreManager.setMeshColorsRules(colorRules);

        // Load dynamic textures
        const textureRules = Array.isArray(productDetails.textures) ? productDetails.textures : [];
        design3d.colorChangeStoreManager.setMeshTexturesRules(textureRules);
        
        // Pass environment rules
        const envManager = design3d.environmentStoreManager;
        envManager.setEnvironmentRules(productDetails.environment || productDetails.environments || null);
        
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

