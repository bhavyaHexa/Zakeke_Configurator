import ConfiguratorStoreManager from './ConfiguratorStoreManager';
import EnvironmentStoreManager from './EnvironmentStoreManager';
import ColorChangeStoreManager from './ColorChangeStoreManager';
import CameraStoreManager from './CameraStoreManager';

class Design3dManager {
  rootStore;
  configuratorStoreManager;
  environmentStoreManager;
  colorChangeStoreManager;
  cameraStoreManager;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.configuratorStoreManager = new ConfiguratorStoreManager(this);
    this.environmentStoreManager = new EnvironmentStoreManager(this);
    this.colorChangeStoreManager = new ColorChangeStoreManager(this);
    this.cameraStoreManager = new CameraStoreManager(this);
  }
}

export default Design3dManager;
