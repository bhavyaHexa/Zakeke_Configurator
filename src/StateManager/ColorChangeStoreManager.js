import { makeAutoObservable } from 'mobx';

class ColorChangeStoreManager {
  design3dManager;

  // Active Configuration State
  selectedOptions = {};   // meshName -> colorHex
  selectedTextures = {};  // meshName -> textureUrl
  roughness = 0.5;
  opacity = 1.0;

  // Configuration rules from the database format
  meshColorsRules = [];    // [{ name, colors: [{ name, hexCode }] }]
  meshTexturesRules = [];  // [{ name, files: [{ name, url }] }]

  constructor(design3dManager) {
    this.design3dManager = design3dManager;
    makeAutoObservable(this, {
      design3dManager: false
    });
  }

  setRoughness(val) {
    this.roughness = val;
  }

  setOpacity(val) {
    this.opacity = val;
  }

  setMeshColorsRules(meshColorsRules) {
    this.meshColorsRules = Array.isArray(meshColorsRules) ? meshColorsRules : [];
    
    // Initialize default color selections
    const newColors = { ...this.selectedOptions };
    this.meshColorsRules.forEach(rule => {
      if (rule.colors && rule.colors.length > 0 && !newColors[rule.name]) {
        newColors[rule.name] = rule.colors[0].hexCode;
      }
    });
    this.selectedOptions = newColors;
  }

  setMeshTexturesRules(meshTexturesRules) {
    this.meshTexturesRules = Array.isArray(meshTexturesRules) ? meshTexturesRules : [];
    
    // Initialize default texture selections
    const newTextures = { ...this.selectedTextures };
    this.meshTexturesRules.forEach(rule => {
      if (rule.files && rule.files.length > 0 && !newTextures[rule.name]) {
        newTextures[rule.name] = rule.files[0].url;
      }
    });
    this.selectedTextures = newTextures;
  }

  setOption(meshName, colorHex) {
    // Set color option
    this.selectedOptions = { ...this.selectedOptions, [meshName]: colorHex };
    
    // Clear texture for this mesh to avoid overlay overlap
    if (this.selectedTextures[meshName]) {
      const newTextures = { ...this.selectedTextures };
      delete newTextures[meshName];
      this.selectedTextures = newTextures;
    }
  }

  setTextureOption(meshName, textureUrl) {
    // Set texture option
    this.selectedTextures = { ...this.selectedTextures, [meshName]: textureUrl };
    
    // Clear color for this mesh to allow the texture map to render correctly without tinting
    if (this.selectedOptions[meshName]) {
      const newColors = { ...this.selectedOptions };
      delete newColors[meshName];
      this.selectedOptions = newColors;
    }
  }

  clearConfigurations() {
    this.selectedOptions = {};
    this.selectedTextures = {};
    this.meshColorsRules = [];
    this.meshTexturesRules = [];
    this.roughness = 0.5;
    this.opacity = 1.0;
  }
}

export default ColorChangeStoreManager;

