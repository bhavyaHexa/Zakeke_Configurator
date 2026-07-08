import DesignManager from './DesignManager';
import Design3dManager from './Design3dManager';

class RootStore {
  constructor() {
    this.designManager = new DesignManager(this);
    this.design3dManager = new Design3dManager(this);
  }
}

export default RootStore;
