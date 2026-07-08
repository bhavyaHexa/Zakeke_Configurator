import React, { createContext, useContext } from 'react';
import RootStore from '../models/RootStore';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const store = new RootStore();
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
};
