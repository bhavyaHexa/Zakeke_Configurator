import { makeAutoObservable } from 'mobx';

class ConfiguratorStoreManager {
  design3dManager;

  // Active Configuration State
  glbUrl = null;
  configurationRules = null;
  selectedOptions = {};

  constructor(design3dManager) {
    this.design3dManager = design3dManager;
    makeAutoObservable(this, {
      design3dManager: false
    });
  }

  setGlbUrl(url) {
    this.glbUrl = url;
  }

  setConfigurationRules(rules) {
    this.configurationRules = rules;
    
    // Initialize default selections based on parsed rules
    const newOptions = {};
    if (rules && rules.selectColor) {
      const defaultColor = rules.selectColor.colorOptions && rules.selectColor.colorOptions.length > 0 
        ? rules.selectColor.colorOptions[0].hex 
        : null;
        
      if (defaultColor && rules.selectColor.targetedMeshNames) {
        rules.selectColor.targetedMeshNames.forEach(meshName => {
          newOptions[meshName] = defaultColor;
        });
      }
    }
    
    // Fallback for old schema if needed during transition
    if (rules && rules.areas && !rules.selectColor) {
      rules.areas.forEach(area => {
        if (area.colors && area.colors.length > 0) {
          newOptions[area.meshTargetName] = area.colors[0].hex;
        }
      });
    }

    this.selectedOptions = newOptions;
  }

  setOption(key, value) {
    this.selectedOptions = { ...this.selectedOptions, [key]: value };
  }
}

export default ConfiguratorStoreManager;
