import React from 'react';
import { observer } from 'mobx-react-lite';
import { useMainContext } from '../../context/MainContextProvider';

const ColorChangeComponent = observer(() => {
  const rootStore = useMainContext();
  const design3dManager = rootStore.design3dManager;
  const rules = design3dManager.colorChangeStoreManager.configurationRules;

  // Render nothing if there is no selectColor configuration
  if (!rules?.selectColor) return null;

  const handleGlobalColorChange = (color) => {
    if (rules.selectColor.targetedMeshNames) {
      rules.selectColor.targetedMeshNames.forEach(meshName => {
        design3dManager.colorChangeStoreManager.setOption(meshName, color);
      });
    }
  };

  return (
    <div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Color Change</h3>
      <div className="flex flex-wrap gap-3">
        {rules.selectColor.colorOptions && rules.selectColor.colorOptions.map((colorObj) => {
          // Determine if this color is currently active for all meshes (or just check the first one)
          const firstMesh = rules.selectColor.targetedMeshNames[0];
          const isSelected = firstMesh && design3dManager.colorChangeStoreManager.selectedOptions[firstMesh] === colorObj.hex;
          
          return (
            <button
              key={colorObj.hex}
              onClick={() => handleGlobalColorChange(colorObj.hex)}
              className={`w-10 h-10 rounded-full border-2 ${
                isSelected ? 'border-indigo-600 scale-110 shadow-md' : 'border-gray-200'
              } shadow-sm hover:scale-110 transition-all duration-200 ease-in-out`}
              style={{ backgroundColor: colorObj.hex }}
              title={colorObj.name}
              aria-label={`Select ${colorObj.name}`}
            />
          );
        })}
      </div>
    </div>
  );
});

export default ColorChangeComponent;
