import { makeAutoObservable } from 'mobx';

class RightSideStore {
  designManager;
  
  isLoading = false;
  loadingProgress = 0;
  apiError = null;
  productTitle = '';
  productDescription = '';

  constructor(designManager) {
    this.designManager = designManager;
    makeAutoObservable(this, {
      designManager: false
    });
  }

  setIsLoading(status) {
    this.isLoading = status;
  }

  setLoadingProgress(progress) {
    this.loadingProgress = progress;
  }

  setApiError(error) {
    this.apiError = error;
  }
}

export default RightSideStore;
