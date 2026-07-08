import React, { createContext, useContext } from 'react';
import RootStore from '../StateManager/RootStore';

const StoreContext = createContext(null);

export const MainContextProvider = ({ children }) => {
  const store = new RootStore();
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};

export const useMainContext = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useMainContext must be used within a MainContextProvider');
  }
  return store;
};
