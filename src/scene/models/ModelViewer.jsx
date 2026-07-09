import { useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import { useMainContext } from '../../context/MainContextProvider';
import { TextureLoader } from 'three';

const textureLoader = new TextureLoader();

const ModelViewer = observer(() => {
  const { design3dManager } = useMainContext();
  const { glbUrl, selectedOptions, selectedTextures } = design3dManager.configuratorStoreManager;

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
              if (child.name === targetName || child.name.includes(targetName)) {
                child.material.color.set(colorHex);
                child.material.map = null; // clear textures if color is selected
                child.material.needsUpdate = true;
                colorApplied = true;
              }
            }

            // Check if there is an active texture selection for this mesh
            if (!colorApplied) {
              for (const [targetName, textureUrl] of Object.entries(selectedTextures)) {
                if ((child.name === targetName || child.name.includes(targetName)) && textureUrl) {
                  textureLoader.load(
                    textureUrl,
                    (texture) => {
                      texture.colorSpace = 'srgb'; // for Three.js color accuracy
                      child.material.color.set('#ffffff'); // reset color to avoid tinting the texture
                      child.material.map = texture;
                      child.material.needsUpdate = true;
                    },
                    undefined,
                    (err) => {
                      console.error(`Failed to load texture at ${textureUrl}:`, err);
                    }
                  );
                }
              }
            }
          }
        }
      });
    }
  }, [clonedScene, selectedOptions, selectedTextures]);

  if (!glbUrl) return null;

  return (
    <primitive object={clonedScene} scale={[1, 1, 1]} position={[0, -1, 0]} />
  );
});

export default ModelViewer;
