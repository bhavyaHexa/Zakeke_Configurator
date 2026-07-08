import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../hooks/useStore';
import CanvasApp from '../scene/CanvasApp';

const UIOverlay = observer(() => {
  const { configuratorStore } = useStore();

  const handleColorChange = (color) => {
    configuratorStore.setOption('color', color);
  };

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-white/90 backdrop-blur-md shadow-2xl p-6 flex flex-col pointer-events-auto border-l border-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {configuratorStore.productTitle || 'Product Name'}
        </h1>
        {configuratorStore.productDescription && (
          <div 
            className="mt-2 text-sm text-gray-600 prose prose-sm"
            dangerouslySetInnerHTML={{ __html: configuratorStore.productDescription }}
          />
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Select Color</h3>
        <div className="flex gap-3">
          {['#ef4444', '#3b82f6', '#10b981', '#f97316', '#ffffff', '#1f2937'].map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`w-10 h-10 rounded-full border-2 ${
                configuratorStore.selectedOptions.color === color ? 'border-indigo-600 scale-110 shadow-md' : 'border-gray-200'
              } shadow-sm hover:scale-110 transition-all duration-200 ease-in-out`}
              style={{ backgroundColor: color }}
              aria-label={`Select ${color}`}
            />
          ))}
        </div>
      </div>
      
      <div className="mt-auto">
        {configuratorStore.apiError && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 mb-4">
            {configuratorStore.apiError}
          </div>
        )}
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-colors duration-200">
          Add to Cart
        </button>
      </div>
    </div>
  );
});

// Full page loader for the initial Shopify API fetch
const ApiLoader = () => (
  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-sm pointer-events-none">
    <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
    <h2 className="text-xl font-semibold text-gray-800">Loading Product Data...</h2>
    <p className="text-gray-500 text-sm mt-2">Connecting to Shopify</p>
  </div>
);

const ProductSidebar = observer(() => {
  const { configuratorStore } = useStore();

  return (
    <div className="absolute top-0 left-0 h-full w-72 bg-white/90 backdrop-blur-md shadow-2xl p-6 flex flex-col pointer-events-auto border-r border-gray-100 overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Available Products</h2>
      
      <div className="flex flex-col gap-4">
        {configuratorStore.productList.map((product) => (
          <button
            key={product.id}
            onClick={() => configuratorStore.setActiveProductHandle(product.handle)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
              configuratorStore.activeProductHandle === product.handle 
                ? 'bg-indigo-50 border-indigo-200 shadow-sm border' 
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            {product.thumbnail ? (
              <img src={product.thumbnail} alt={product.title} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-200 flex flex-shrink-0 items-center justify-center text-xs text-gray-400">
                No Img
              </div>
            )}
            <span className="text-sm font-semibold text-gray-800 line-clamp-2">
              {product.title}
            </span>
          </button>
        ))}
        {configuratorStore.productList.length === 0 && !configuratorStore.isLoading && (
          <p className="text-sm text-gray-500 italic">No products found in store.</p>
        )}
      </div>
    </div>
  );
});

const ProductPage = observer(() => {
  const { configuratorStore } = useStore();

  useEffect(() => {
    configuratorStore.fetchAllProducts();
  }, [configuratorStore]);

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-300">
      {/* Show full screen API loader while fetching from Shopify */}
      {configuratorStore.isLoading && <ApiLoader />}

      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <CanvasApp />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <ProductSidebar />
        <UIOverlay />
      </div>
    </div>
  );
});

export default ProductPage;
