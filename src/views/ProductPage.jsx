import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useMainContext } from '../context/MainContextProvider';
import CanvasApp from '../scene/CanvasApp';

// SVG Icons for modern visual style
const SVG_ICONS = {
  logo: (
    <svg className="w-8 h-8 text-[#A38865]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#FAF8F5" fillOpacity="0.1" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5 text-[#8A7B68] hover:text-[#A38865] cursor-pointer transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  user: (
    <svg className="w-5 h-5 text-[#8A7B68] hover:text-[#A38865] cursor-pointer transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  cart: (
    <svg className="w-5 h-5 text-[#8A7B68] hover:text-[#A38865] cursor-pointer transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  ),
  chevron: (
    <svg className="w-3.5 h-3.5 text-[#8A7B68] inline-block ml-1 align-middle transition-transform duration-200 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
  softStudio: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  ),
  naturalDawn: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
      <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="currentColor" fillOpacity="0.1" />
    </svg>
  ),
  dramaticDusk: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  ),
  ar: (
    <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l-7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
  rotation360: (
    <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-.73" />
    </svg>
  ),
  highlightCheck: (
    <svg className="w-4 h-4 text-[#A38865]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
};

const Header = () => {
  return (
    <header className="mx-6 mt-4 px-6 py-3 bg-[#FAF8F5]/85 backdrop-blur-md rounded-2xl shadow-sm border border-[#E9E4DC] flex items-center justify-between z-20 relative pointer-events-auto">
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        {SVG_ICONS.logo}
        <span className="text-sm font-extrabold tracking-[0.25em] text-[#5C4F43]">CONFIGURA</span>
      </div>

      {/* Main Nav */}
      <nav className="flex items-center gap-8">
        <a href="#shop" className="group text-xs font-bold text-[#8A7B68] hover:text-[#5C4F43] transition-colors tracking-widest uppercase">
          Shop {SVG_ICONS.chevron}
        </a>
        <a href="#categories" className="group text-xs font-bold text-[#8A7B68] hover:text-[#5C4F43] transition-colors tracking-widest uppercase">
          Categories {SVG_ICONS.chevron}
        </a>
        <a href="#my-designs" className="text-xs font-bold text-[#8A7B68] hover:text-[#5C4F43] transition-colors tracking-widest uppercase">
          My Designs
        </a>
        <a href="#support" className="text-xs font-bold text-[#8A7B68] hover:text-[#5C4F43] transition-colors tracking-widest uppercase">
          Support
        </a>
      </nav>

      {/* Action Icons */}
      <div className="flex items-center gap-5">
        {SVG_ICONS.search}
        {SVG_ICONS.user}
        <div className="relative">
          {SVG_ICONS.cart}
          <span className="absolute -top-1.5 -right-1.5 bg-[#A38865] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">1</span>
        </div>
      </div>
    </header>
  );
};

const ProductPage = observer(() => {
  const rootStore = useMainContext();
  const designManager = rootStore.designManager;
  const design3dManager = rootStore.design3dManager;
  const colorStore = design3dManager.colorChangeStoreManager;
  const envStore = design3dManager.environmentStoreManager;

  const [activeColorMesh, setActiveColorMesh] = useState('');
  const [activeTextureMesh, setActiveTextureMesh] = useState('');

  // Extract color/texture meshes dynamically from active rules
  const colorMeshes = colorStore.meshColorsRules.map(r => r.name);
  const textureMeshes = colorStore.meshTexturesRules.map(r => r.name);

  useEffect(() => {
    if (colorMeshes.length > 0) {
      if (!colorMeshes.includes(activeColorMesh)) {
        setActiveColorMesh(colorMeshes[0]);
      }
    } else {
      setActiveColorMesh('');
    }
  }, [colorStore.meshColorsRules]);

  useEffect(() => {
    if (textureMeshes.length > 0) {
      if (!textureMeshes.includes(activeTextureMesh)) {
        setActiveTextureMesh(textureMeshes[0]);
      }
    } else {
      setActiveTextureMesh('');
    }
  }, [colorStore.meshTexturesRules]);

  useEffect(() => {
    designManager.leftSideStore.fetchAllProducts();
  }, [designManager]);

  const productList = designManager.leftSideStore.productList;
  const activeProductId = designManager.leftSideStore.activeProductId;

  const targetColorMesh = activeColorMesh || colorMeshes[0] || '';
  const colorRule = colorStore.meshColorsRules.find(r => r.name === targetColorMesh);
  const colors = colorRule?.colors || [];

  const targetTextureMesh = activeTextureMesh || textureMeshes[0] || '';
  const textureRule = colorStore.meshTexturesRules.find(r => r.name === targetTextureMesh);
  const textures = textureRule?.files || [];

  const handleColorSelect = (hex) => {
    if (targetColorMesh) {
      colorStore.setOption(targetColorMesh, hex);
    }
  };

  const handleTextureSelect = (textureUrl) => {
    if (targetTextureMesh) {
      colorStore.setTextureOption(targetTextureMesh, textureUrl);
    }
  };



  return (
    <div 
      className="w-screen h-screen relative overflow-hidden bg-[#F5F2EB] flex flex-col select-none"
    >

      {/* Header Banner */}
      <Header />

      {/* Main Body */}
      <div className="flex-1 flex gap-6 px-6 py-4 overflow-hidden relative z-10 pointer-events-none">
        
        {/* Left Config Panel */}
        <div className="w-[410px] bg-[#FAF8F5]/90 backdrop-blur-md rounded-3xl shadow-xl border border-[#E9E4DC] p-5 flex flex-col h-[calc(100vh-100px)] overflow-y-auto pointer-events-auto transition-all duration-300">
          
          {/* Section: Select Model */}
          <div className="mb-6">
            <h2 className="text-[10px] font-extrabold text-[#8A7B68] uppercase tracking-[0.2em] mb-3">Select Model</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {productList.map((product) => {
                const isSelected = activeProductId === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => designManager.leftSideStore.setActiveProductId(product.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border bg-white transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#A38865] bg-[#FAF8F5] shadow-sm ring-1 ring-[#A38865]' 
                        : 'border-[#E9E4DC] hover:border-[#A38865]/50'
                    }`}
                  >
                    {product.thumbnail ? (
                      <div className="relative w-full h-16 mb-2 rounded-lg overflow-hidden bg-stone-50 flex items-center justify-center">
                        <img 
                          src={product.thumbnail} 
                          alt={product.title} 
                          className="w-full h-full object-cover" 
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-[#FAF8F5] rounded-full p-0.5 shadow-sm border border-[#E9E4DC]">
                            {SVG_ICONS.highlightCheck}
                          </div>
                        )}
                      </div>
                    ) : (
                      isSelected && (
                        <div className="mb-1.5 bg-[#FAF8F5] rounded-full p-0.5 shadow-sm border border-[#E9E4DC] flex items-center justify-center">
                          {SVG_ICONS.highlightCheck}
                        </div>
                      )
                    )}
                    <span className="text-[11px] font-bold text-[#5C4F43] truncate w-full text-center">
                      {product.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Color Options */}
          {colorStore.meshColorsRules.length > 0 && (
            <div className="mb-6 border-t border-[#E9E4DC] pt-5">
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-[10px] font-extrabold text-[#8A7B68] uppercase tracking-[0.2em]">Color</h2>
                
                {/* Part selector segmented buttons */}
                {colorMeshes.length > 1 && (
                  <div className="flex gap-1 bg-[#FAF8F5] border border-[#E9E4DC] p-0.5 rounded-lg">
                    {colorMeshes.map((meshName) => {
                      const isMeshActive = targetColorMesh === meshName;
                      return (
                        <button
                          key={meshName}
                          onClick={() => setActiveColorMesh(meshName)}
                          className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            isMeshActive 
                              ? 'bg-[#8A7B68] text-white' 
                              : 'text-[#8A7B68] hover:text-[#5C4F43]'
                          }`}
                        >
                          {meshName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Colors Swatches Grid */}
              <div className="grid grid-cols-5 gap-2">
                {colors.map((colorObj) => {
                  const isColorSelected = colorStore.selectedOptions[targetColorMesh] === colorObj.hexCode;
                  return (
                    <button
                      key={colorObj.hexCode}
                      onClick={() => handleColorSelect(colorObj.hexCode)}
                      className="flex flex-col items-center gap-1.5 cursor-pointer group"
                    >
                      <div 
                        className={`w-11 h-11 rounded-xl shadow-sm border transition-all ${
                          isColorSelected 
                            ? 'border-[#A38865] scale-105 ring-2 ring-[#E9E4DC]' 
                            : 'border-[#E9E4DC] hover:scale-105'
                        }`}
                        style={{ backgroundColor: colorObj.hexCode }}
                      />
                      <span className="text-[9px] font-bold text-[#8A7B68] truncate w-full text-center group-hover:text-[#5C4F43]">
                        {colorObj.name}
                      </span>
                    </button>
                  );
                })}
                {colors.length === 0 && (
                  <div className="col-span-5 text-center text-xs italic text-[#8A7B68]">
                    No mesh colors configured.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Texture Options */}
          {colorStore.meshTexturesRules.length > 0 && (
            <div className="mb-6 border-t border-[#E9E4DC] pt-5">
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-[10px] font-extrabold text-[#8A7B68] uppercase tracking-[0.2em]">Texture</h2>
                
                {/* Part selector segmented buttons */}
                {textureMeshes.length > 1 && (
                  <div className="flex gap-1 bg-[#FAF8F5] border border-[#E9E4DC] p-0.5 rounded-lg">
                    {textureMeshes.map((meshName) => {
                      const isMeshActive = targetTextureMesh === meshName;
                      return (
                        <button
                          key={meshName}
                          onClick={() => setActiveTextureMesh(meshName)}
                          className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            isMeshActive 
                              ? 'bg-[#8A7B68] text-white' 
                              : 'text-[#8A7B68] hover:text-[#5C4F43]'
                          }`}
                        >
                          {meshName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Texture Swatches Grid */}
              <div className="grid grid-cols-5 gap-2">
                {textures.map((swatch) => {
                  const isTextureSelected = colorStore.selectedTextures[targetTextureMesh] === swatch.url;
                  return (
                    <button
                      key={swatch.url}
                      onClick={() => handleTextureSelect(swatch.url)}
                      className="flex flex-col items-center gap-1.5 cursor-pointer group"
                    >
                      <div 
                        className={`w-11 h-11 rounded-xl shadow-sm border transition-all ${
                          isTextureSelected 
                            ? 'border-[#A38865] scale-105 ring-2 ring-[#E9E4DC]' 
                            : 'border-[#E9E4DC] hover:scale-105'
                        }`}
                        style={{ 
                          backgroundImage: `url(${swatch.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      <span className="text-[9px] font-bold text-[#8A7B68] truncate w-full text-center group-hover:text-[#5C4F43]">
                        {swatch.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}



          {/* Action Buttons */}
          <div className="mt-auto space-y-2 pt-2 border-t border-[#E9E4DC]">
            <button className="w-full bg-[#A38865] hover:bg-[#8F7453] text-[#FAF8F5] font-extrabold py-3.5 px-4 rounded-2xl shadow-md transition-all uppercase tracking-widest text-xs cursor-pointer">
              Add to Cart
            </button>
            <button className="w-full bg-[#FAF8F5] hover:bg-[#FAF8F5]/50 border border-[#A38865] text-[#A38865] font-extrabold py-3.5 px-4 rounded-2xl shadow-sm transition-all uppercase tracking-widest text-xs cursor-pointer">
              Save Design
            </button>
          </div>
        </div>

        {/* 3D Viewer Area */}
        <div className="flex-grow h-[calc(100vh-100px)] relative pointer-events-auto flex items-center justify-center">
          
          {design3dManager.configuratorStoreManager.glbUrl ? (
            /* Main 3D Canvas App */
            <div className="absolute inset-0 z-0">
              <CanvasApp />
            </div>
          ) : (
            <div className="text-center z-10 flex flex-col items-center gap-2.5 p-6 rounded-2xl bg-[#FAF8F5]/80 backdrop-blur-md border border-[#E9E4DC]">
              <svg className="w-8 h-8 text-[#8A7B68]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <span className="text-sm font-extrabold text-[#5C4F43] tracking-wider">No Model is Available</span>
            </div>
          )}



          {/* Loading state indicator */}
          {designManager.rightSideStore.isLoading && (
            <div className="absolute inset-0 bg-[#FAF8F5]/45 backdrop-blur-sm z-20 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-12 h-12 border-4 border-[#E9E4DC] border-t-[#A38865] rounded-full animate-spin mb-3"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8A7B68]">Loading 3D Workspace...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductPage;

