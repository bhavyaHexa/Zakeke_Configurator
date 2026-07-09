import { makeAutoObservable } from 'mobx';

class ConfiguratorStoreManager {
  design3dManager;

  // Active Configuration State
  glbUrl = null;
  selectedOptions = {};   // meshName -> colorHex
  selectedTextures = {};  // meshName -> textureUrl
  
  // Camera settings
  cameraAngle = null;

  // Configuration rules from the new database format
  meshColorsRules = [];    // [{ name, colors: [{ name, hexCode }] }]
  meshTexturesRules = [];  // [{ name, files: [{ name, url }] }]

  constructor(design3dManager) {
    this.design3dManager = design3dManager;
    makeAutoObservable(this, {
      design3dManager: false
    });
  }

  setGlbUrl(url) {
    this.glbUrl = url;
  }

  setCameraAngle(cameraAngle) {
    this.cameraAngle = cameraAngle;
  }

  setMeshColorsRules(meshColorsRules) {
    this.meshColorsRules = meshColorsRules || [];
    
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
    this.meshTexturesRules = meshTexturesRules || [];
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
    this.cameraAngle = null;
  }
}

export default ConfiguratorStoreManager;
