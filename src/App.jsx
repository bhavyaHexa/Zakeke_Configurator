import React from 'react';
import ProductPage from './views/ProductPage';
import { StoreProvider } from './hooks/useStore';

function App() {
  return (
    <StoreProvider>
      <ProductPage />
    </StoreProvider>
  );
}

export default App;
