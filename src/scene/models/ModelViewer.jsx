import { useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import { useMainContext } from '../../context/MainContextProvider';
import { TextureLoader, RepeatWrapping } from 'three';

const textureLoader = new TextureLoader();

const isMeshMatch = (childName, targetName) => {
  if (childName === targetName) return true;
  const escapedTarget = targetName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`^${escapedTarget}(?:[._-]?\\d+)?$`);
  return regex.test(childName);
};

const ModelViewer = observer(() => {
  const rootStore = useMainContext();
  const design3dManager = rootStore.design3dManager;
  const { glbUrl } = design3dManager.configuratorStoreManager;
  const { selectedOptions, selectedTextures } = design3dManager.colorChangeStoreManager;

  // useGLTF relies on Suspense, so this component will suspend if it's fetching the .glb
  const { scene } = useGLTF(glbUrl || '');

  // Clone the scene so we can modify it safely without mutating the cached version
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    return scene.clone(true);
  }, [scene]);

  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          console.log(`Configuring GLB Mesh: "${child.name}"`);

          // In the new schema, all meshes are visible by default
          child.visible = true;

          // Apply customization styles (color and/or texture)
          if (child.material) {
            // Clone material to ensure we don't mutate shared materials unintentionally
            if (!child.userData.materialCloned) {
              child.material = child.material.clone();
              child.userData.materialCloned = true;
            }

            let colorApplied = false;

            // Check if there is an active color selection for this mesh
            for (const [targetName, colorHex] of Object.entries(selectedOptions)) {
              if (isMeshMatch(child.name, targetName)) {
                child.material.color.set(colorHex);
                child.material.map = null; // clear textures if color is selected
                
                const rule = design3dManager.colorChangeStoreManager.meshColorsRules.find(
                  (r) => r.name === targetName
                );
                if (rule) {
                  const swatch = rule?.colors?.find((c) => c.hexCode === colorHex);

                  const metalnessValue = swatch?.metalness !== undefined ? swatch.metalness :
                                        (swatch?.metalnessValue !== undefined ? swatch.metalnessValue :
                                        (rule.metalnessValue !== undefined ? rule.metalnessValue :
                                        (rule.metallic !== undefined ? rule.metallic : 0)));

                  const roughnessValue = swatch?.roughness !== undefined ? swatch.roughness :
                                        (swatch?.roughnessValue !== undefined ? swatch.roughnessValue :
                                        (rule.roughnessValue !== undefined ? rule.roughnessValue :
                                        (rule.roughness !== undefined ? rule.roughness : 0.75)));

                  const metalnessTexture = swatch?.metalnessUrl || swatch?.metalnessTexture || (rule.metalnessTexture ?? rule.metallicGlossMapUrl);
                  const roughnessTexture = swatch?.roughnessUrl || swatch?.roughnessTexture || rule.roughnessTexture;

                  child.material.roughness = roughnessValue;
                  child.material.metalness = metalnessValue;
                  
                  if (metalnessTexture) {
                    textureLoader.load(metalnessTexture, (tex) => {
                      child.material.metalnessMap = tex;
                      child.material.needsUpdate = true;
                    });
                  } else {
                    child.material.metalnessMap = null;
                  }

                  if (roughnessTexture) {
                    textureLoader.load(roughnessTexture, (tex) => {
                      child.material.roughnessMap = tex;
                      child.material.needsUpdate = true;
                    });
                  } else if (metalnessTexture && !roughnessTexture) {
                    textureLoader.load(metalnessTexture, (tex) => {
                      child.material.roughnessMap = tex;
                      child.material.needsUpdate = true;
                    });
                  } else {
                    child.material.roughnessMap = null;
                  }

                  // Apply Normal map and scale/intensity
                  const normalIntensityVal = swatch?.normalIntensity !== undefined ? swatch.normalIntensity :
                                             swatch?.normalScale !== undefined ? swatch.normalScale :
                                             rule?.normalIntensity !== undefined ? rule.normalIntensity :
                                             1.0;

                  const normalMapUrl = swatch?.normalMap ||
                                       swatch?.normalUrl ||
                                       swatch?.normalMapUrl ||
                                       swatch?.normalTexture ||
                                       rule?.normalMap;

                  if (normalMapUrl) {
                    textureLoader.load(normalMapUrl, (tex) => {
                      tex.wrapS = RepeatWrapping;
                      tex.wrapT = RepeatWrapping;
                      child.material.normalMap = tex;
                      child.material.normalScale.set(normalIntensityVal, normalIntensityVal);
                      child.material.needsUpdate = true;
                    });
                  } else {
                    child.material.normalMap = null;
                  }
                }

                child.material.needsUpdate = true;
                colorApplied = true;
              }
            }

            // Check if there is an active texture selection for this mesh
            if (!colorApplied) {
              for (const [targetName, textureUrl] of Object.entries(selectedTextures)) {
                if (isMeshMatch(child.name, targetName) && textureUrl) {
                  // Find the matched rule and texture swatch to retrieve roughness and metalness
                  const rule = design3dManager.colorChangeStoreManager.meshTexturesRules.find(
                    (r) => r.name === targetName
                  );
                  const swatch = rule?.files?.find((f) => f.url === textureUrl);

                  // 1. Apply Albedo Texture Map
                  textureLoader.load(
                    textureUrl,
                    (texture) => {
                      texture.colorSpace = 'srgb';
                      child.material.color.set('#ffffff'); // reset color to avoid tinting the texture
                      child.material.map = texture;
                      child.material.needsUpdate = true;
                    },
                    undefined,
                    (err) => {
                      console.error(`Failed to load texture at ${textureUrl}:`, err);
                    }
                  );

                  // 2. Apply Roughness value and map
                  const roughnessVal = swatch?.roughness !== undefined 
                    ? swatch.roughness 
                    : (rule?.roughnessValue !== undefined ? rule.roughnessValue : (rule?.roughness !== undefined ? rule.roughness : 0.75));
                  child.material.roughness = roughnessVal;

                  const roughnessMapUrl = swatch?.roughnessUrl || rule?.roughnessTexture || (!rule?.roughnessTexture ? (swatch?.metalnessUrl || rule?.metalnessTexture) : null);
                  if (roughnessMapUrl) {
                    textureLoader.load(roughnessMapUrl, (tex) => {
                      child.material.roughnessMap = tex;
                      child.material.needsUpdate = true;
                    });
                  } else {
                    child.material.roughnessMap = null;
                  }

                  // 3. Apply Metalness value and map
                  const metalnessVal = swatch?.metalness !== undefined 
                    ? swatch.metalness 
                    : (rule?.metalnessValue !== undefined ? rule.metalnessValue : (rule?.metallic !== undefined ? rule.metallic : 0));
                  child.material.metalness = metalnessVal;

                  const metalnessMapUrl = swatch?.metalnessUrl || rule?.metalnessTexture || (!rule?.metalnessTexture ? (swatch?.roughnessUrl || rule?.roughnessTexture) : null);
                  if (metalnessMapUrl) {
                    textureLoader.load(metalnessMapUrl, (tex) => {
                      child.material.metalnessMap = tex;
                      child.material.needsUpdate = true;
                    });
                  } else {
                    child.material.metalnessMap = null;
                  }

                  // 4. Apply Normal map and scale/intensity
                  const normalIntensityVal = swatch?.normalIntensity !== undefined ? swatch.normalIntensity :
                                             swatch?.normalScale !== undefined ? swatch.normalScale :
                                             rule?.normalIntensity !== undefined ? rule.normalIntensity :
                                             1.0;

                  const normalMapUrl = swatch?.normalMap ||
                                       swatch?.normalUrl ||
                                       swatch?.normalMapUrl ||
                                       swatch?.normalTexture ||
                                       rule?.normalMap;

                  if (normalMapUrl) {
                    textureLoader.load(normalMapUrl, (tex) => {
                      tex.wrapS = RepeatWrapping;
                      tex.wrapT = RepeatWrapping;
                      child.material.normalMap = tex;
                      child.material.normalScale.set(normalIntensityVal, normalIntensityVal);
                      child.material.needsUpdate = true;
                    });
                  } else {
                    child.material.normalMap = null;
                  }

                  child.material.needsUpdate = true;
                }
              }
            }
          }
        }
      });
    }
  }, [
    clonedScene,
    selectedOptions,
    selectedTextures,
    design3dManager.colorChangeStoreManager.meshColorsRules,
    design3dManager.colorChangeStoreManager.meshTexturesRules
  ]);

  if (!glbUrl) return null;

  return (
    <primitive object={clonedScene} />
  );
});

export default ModelViewer;
