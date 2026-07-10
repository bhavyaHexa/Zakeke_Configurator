import { makeAutoObservable } from 'mobx';

class CameraStoreManager {
  design3dManager;

  // Camera settings
  cameraAngle = null;

  constructor(design3dManager) {
    this.design3dManager = design3dManager;
    makeAutoObservable(this, {
      design3dManager: false
    });
  }

  setCameraAngle(cameraAngle) {
    this.cameraAngle = cameraAngle;
  }

  clearConfigurations() {
    this.cameraAngle = null;
  }
}

export default CameraStoreManager;
