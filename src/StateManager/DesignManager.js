import LeftSideStore from './LeftSideStore';
import RightSideStore from './RightSideStore';

class DesignManager {
  rootStore;
  leftSideStore;
  rightSideStore;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.leftSideStore = new LeftSideStore(this);
    this.rightSideStore = new RightSideStore(this);
  }
}

export default DesignManager;
