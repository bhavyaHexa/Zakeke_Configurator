import { makeAutoObservable } from 'mobx';

class EnvironmentStoreManager {
  design3dManager;
  
  lightMode = 'city';
  intensity = 1;
  shadows = true;
  rotation = { x: 0, y: 0, z: 0 };

  constructor(design3dManager) {
    this.design3dManager = design3dManager;
    makeAutoObservable(this, {
      design3dManager: false
    });
  }

  setEnvironmentRules(environments) {
    if (environments && environments.file && environments.file.startsWith('http')) {
      this.lightMode = environments.file;
      this.intensity = environments.intensity ?? 1.0;
      this.rotation = environments.rotation || { x: 0, y: 0, z: 0 };
      this.shadows = environments.shadows ?? true;
    } else {
      // Default fallback values
      this.lightMode = 'city';
      this.intensity = 1.0;
      this.rotation = { x: 0, y: 0, z: 0 };
      this.shadows = true;
    }
  }
}

export default EnvironmentStoreManager;
