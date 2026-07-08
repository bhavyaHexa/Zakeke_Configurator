import ConfiguratorStoreManager from './ConfiguratorStoreManager';

class Design3dManager {
  rootStore;
  configuratorStoreManager;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.configuratorStoreManager = new ConfiguratorStoreManager(this);
  }
}

export default Design3dManager;
