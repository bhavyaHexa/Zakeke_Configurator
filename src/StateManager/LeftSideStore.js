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
        
        const design3d = this.designManager.rootStore.design3dManager;
        design3d.configuratorStoreManager.clearConfigurations();
        design3d.colorChangeStoreManager.clearConfigurations();
        design3d.cameraStoreManager.clearConfigurations();

        // Detect GLB Model URL: prioritize CDN HTTP URLs over raw shopify GIDs
        let glbUrl = null;
        const envFile = productDetails.environments?.file;
        const modelMediaId = productDetails.modelMediaId;
        const backupUrl = productDetails.glbUrl;

        // Check if envFile is an HDR/EXR environment rather than a GLB model
        const cleanEnvFile = envFile ? envFile.split('?')[0].toLowerCase() : '';
        const isEnvAnHdri = cleanEnvFile.endsWith('.hdr') || cleanEnvFile.endsWith('.exr');

        if (modelMediaId && modelMediaId.startsWith('http')) {
          glbUrl = modelMediaId;
        } else if (backupUrl && backupUrl.startsWith('http')) {
          glbUrl = backupUrl;
        } else if (envFile && envFile.startsWith('http') && !isEnvAnHdri) {
          glbUrl = envFile;
        } else {
          glbUrl = modelMediaId || backupUrl || (!isEnvAnHdri ? envFile : null) || null;
        }
        
        if (glbUrl) {
          design3d.configuratorStoreManager.setGlbUrl(glbUrl);
        } else {
          this.designManager.rightSideStore.setApiError('No 3D model found for this product.');
          design3d.configuratorStoreManager.setGlbUrl(null);
        }
        
        // Save camera options: support both flat and nested camera configs
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
            defaultAngle: productDetails.cameraAngle?.defaultAngle || [0, 90, 0],
            zoomLimit: productDetails.cameraAngle?.zoomLimit || [0.5, 4]
          };
        }
        design3d.cameraStoreManager.setCameraAngle(cameraAngle);

        // Load mesh customizer configurations: colors and textures
        const meshRules = Array.isArray(productDetails.mesh) ? productDetails.mesh : [];
        
        const colorRules = meshRules.map(r => ({
          name: r.name,
          colors: r.colors || []
        }));

        let textureRules = [];
        if (meshRules.some(r => r.textures && r.textures.length > 0)) {
          textureRules = meshRules
            .map(r => ({
              name: r.name,
              files: r.textures || []
            }))
            .filter(r => r.files.length > 0);
        } else {
          textureRules = Array.isArray(productDetails.textures) ? productDetails.textures : [];
        }

        design3d.colorChangeStoreManager.setMeshColorsRules(colorRules);
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
