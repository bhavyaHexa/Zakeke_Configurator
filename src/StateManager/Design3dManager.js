import ConfiguratorStoreManager from './ConfiguratorStoreManager';
import EnvironmentStoreManager from './EnvironmentStoreManager';

class Design3dManager {
  rootStore;
  configuratorStoreManager;
  environmentStoreManager;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.configuratorStoreManager = new ConfiguratorStoreManager(this);
    this.environmentStoreManager = new EnvironmentStoreManager(this);
  }
}

export default Design3dManager;
