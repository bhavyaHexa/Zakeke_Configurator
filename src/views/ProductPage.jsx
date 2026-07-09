import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useMainContext } from '../context/MainContextProvider';
import CanvasApp from '../scene/CanvasApp';

const UIOverlay = observer(() => {
  const { designManager, design3dManager } = useMainContext();
  const configStore = design3dManager.configuratorStoreManager;
  
  const meshColorsRules = configStore.meshColorsRules || [];
  const meshTexturesRules = configStore.meshTexturesRules || [];

  // Identify all meshes configured with color and/or texture custom options
  const customizableMeshes = Array.from(new Set([
    ...meshColorsRules.map(r => r.name),
    ...meshTexturesRules.map(r => r.name)
  ]));

  return (
    <div className="absolute top-0 right-0 h-full w-85 bg-white/95 backdrop-blur-md shadow-2xl p-6 flex flex-col pointer-events-auto border-l border-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {designManager.rightSideStore.productTitle || 'Product Name'}
        </h1>
        {designManager.rightSideStore.productDescription && (
          <p className="text-sm font-semibold text-indigo-600 mt-1 uppercase tracking-wide">
            {designManager.rightSideStore.productDescription}
          </p>
        )}
      </div>
      
      <div className="flex flex-col gap-6 mb-6 overflow-y-auto pr-2 flex-1">
        {customizableMeshes.map((meshName) => {
          const colorRule = meshColorsRules.find(r => r.name === meshName);
          const textureRule = meshTexturesRules.find(r => r.name === meshName);

          const hasColors = colorRule?.colors && colorRule.colors.length > 0;
          const hasTextures = textureRule?.files && textureRule.files.length > 0;

          return (
            <div key={meshName} className="border-b border-gray-150 pb-5 last:border-0">
              <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                {meshName}
              </h3>
              
              {hasColors && (
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Colors</span>
                  <div className="flex flex-wrap gap-2">
                    {colorRule.colors.map((colorObj) => {
                      const isSelected = configStore.selectedOptions[meshName] === colorObj.hexCode;
                      return (
                        <button
                          key={colorObj.hexCode}
                          onClick={() => configStore.setOption(meshName, colorObj.hexCode)}
                          className={`w-9 h-9 rounded-full border-2 ${
                            isSelected 
                              ? 'border-indigo-600 scale-110 shadow-md ring-2 ring-indigo-200' 
                              : 'border-gray-200 hover:border-gray-300'
                          } shadow-sm transition-all duration-150 cursor-pointer`}
                          style={{ backgroundColor: colorObj.hexCode }}
                          title={colorObj.name}
                          aria-label={`Select color ${colorObj.name} for ${meshName}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {hasTextures && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Textures</span>
                  <div className="grid grid-cols-2 gap-2">
                    {textureRule.files.map((fileObj) => {
                      const isSelected = configStore.selectedTextures[meshName] === fileObj.url;
                      return (
                        <button
                          key={fileObj.url}
                          onClick={() => configStore.setTextureOption(meshName, fileObj.url)}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left truncate transition-all duration-150 cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold shadow-sm' 
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                          title={fileObj.name}
                        >
                          {fileObj.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {customizableMeshes.length === 0 && (
          <div className="text-sm text-gray-400 italic text-center mt-8">
            No customization options configured for this product.
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        {designManager.rightSideStore.apiError && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 mb-4">
            {designManager.rightSideStore.apiError}
          </div>
        )}
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-colors duration-200 cursor-pointer">
          Add to Cart
        </button>
      </div>
    </div>
  );
});

// Full page loader for the initial API fetch
const ApiLoader = () => (
  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-sm pointer-events-none">
    <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
    <h2 className="text-xl font-semibold text-gray-800">Loading Product Data...</h2>
    <p className="text-gray-500 text-sm mt-2">Connecting to Backend</p>
  </div>
);

const ProductSidebar = observer(() => {
  const { designManager } = useMainContext();

  return (
    <div className="absolute top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-md shadow-2xl p-6 flex flex-col pointer-events-auto border-r border-gray-100 overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Available Products</h2>
      
      <div className="flex flex-col gap-4">
        {designManager.leftSideStore.productList.map((product) => (
          <button
            key={product.id}
            onClick={() => designManager.leftSideStore.setActiveProductId(product.id)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left cursor-pointer ${
              designManager.leftSideStore.activeProductId === product.id 
                ? 'bg-indigo-50 border-indigo-200 shadow-sm border' 
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            {product.thumbnail ? (
              <img src={product.thumbnail} alt={product.title} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-200 flex flex-shrink-0 items-center justify-center text-xs text-gray-400 font-semibold">
                No Img
              </div>
            )}
            <span className="text-sm font-semibold text-gray-800 line-clamp-2">
              {product.title}
            </span>
          </button>
        ))}
        {designManager.leftSideStore.productList.length === 0 && !designManager.rightSideStore.isLoading && (
          <p className="text-sm text-gray-500 italic text-center mt-4">No products found in store.</p>
        )}
      </div>
    </div>
  );
});

const ProductPage = observer(() => {
  const { designManager } = useMainContext();

  useEffect(() => {
    designManager.leftSideStore.fetchAllProducts();
  }, [designManager]);

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-300">
      {/* Show full screen API loader while fetching from Backend */}
      {designManager.rightSideStore.isLoading && <ApiLoader />}

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
