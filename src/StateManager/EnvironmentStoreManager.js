import { makeAutoObservable } from 'mobx';

class EnvironmentStoreManager {
  design3dManager;
  
  envFileName = null;
  rotation = { x: 0, y: 0, z: 0 };
  intensity = 1;

  constructor(design3dManager) {
    this.design3dManager = design3dManager;
    makeAutoObservable(this, {
      design3dManager: false
    });
  }

  setEnvironmentRules(rules, metafieldData = null) {
    if (metafieldData && (metafieldData.hdrUrl || metafieldData.envMetafield)) {
      this.envFileName = metafieldData.hdrUrl || metafieldData.envMetafield?.envFileName || null;
      this.rotation = metafieldData.envMetafield?.rotation || { x: 0, y: 0, z: 0 };
      this.intensity = metafieldData.envMetafield?.intensity ?? 1;
    } else if (rules && rules.environment) {
      this.envFileName = rules.environment.envFileName || null;
      this.rotation = rules.environment.rotation || { x: 0, y: 0, z: 0 };
      this.intensity = rules.environment.intensity ?? 1;
    } else {
      // Default fallback
      this.envFileName = null;
      this.rotation = { x: 0, y: 0, z: 0 };
      this.intensity = 1;
    }
  }
}

export default EnvironmentStoreManager;
