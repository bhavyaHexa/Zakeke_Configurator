import ConfiguratorStore from './ConfiguratorStore';

class RootStore {
  constructor() {
    this.configuratorStore = new ConfiguratorStore(this);
  }
}

export default RootStore;
