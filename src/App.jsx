import React from 'react';
import ProductPage from './views/ProductPage';
import { MainContextProvider } from './context/MainContextProvider';

function App() {
  return (
    <MainContextProvider>
      <ProductPage />
    </MainContextProvider>
  );
}

export default App;
