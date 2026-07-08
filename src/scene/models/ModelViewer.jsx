import { useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import { useMainContext } from '../../context/MainContextProvider';

const ModelViewer = observer(() => {
  const { design3dManager } = useMainContext();
  const { glbUrl, selectedOptions } = design3dManager.configuratorStoreManager;

  // useGLTF relies on Suspense, so this component will suspend if it's fetching the .glb
  const { scene } = useGLTF(glbUrl || '');

  // Clone the scene so we can modify it safely without mutating the cached version
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    return scene.clone(true);
  }, [scene]);

  useEffect(() => {
    if (clonedScene && selectedOptions) {
      clonedScene.traverse((child) => {
        if (child.isMesh && child.material) {
          // Debug: print out the mesh name so the user can verify it matches the JSON
          console.log(`Available Mesh Name in GLB: "${child.name}"`);
          // Clone material to ensure we don't mutate shared materials unintentionally
          if (!child.userData.materialCloned) {
            child.material = child.material.clone();
            child.userData.materialCloned = true;
          }

          // Check if this mesh matches any of our target names
          for (const [targetName, colorHex] of Object.entries(selectedOptions)) {
            // Check for exact match or if the name includes the target name (e.g. "Side_Panel" matches "Side_Panel_1")
            if (child.name === targetName || child.name.includes(targetName)) {
              child.material.color.set(colorHex);
              child.material.needsUpdate = true;
            }
          }
        }
      });
    }
  }, [clonedScene, selectedOptions]);

  if (!glbUrl) return null;

  return (
    <primitive object={clonedScene} scale={[1, 1, 1]} position={[0, -1, 0]} />
  );
});

// Preload to ensure the browser fetches it early if needed
// However, since we dynamically set the URL from the API, we can't statically preload here
// useGLTF.preload('your-static-url.glb')

export default ModelViewer;
