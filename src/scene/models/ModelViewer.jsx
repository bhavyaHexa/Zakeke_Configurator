import React, { useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../hooks/useStore';
import * as THREE from 'three';

const ModelViewer = observer(() => {
  const { configuratorStore } = useStore();
  const { glbUrl, selectedOptions } = configuratorStore;

  // useGLTF relies on Suspense, so this component will suspend if it's fetching the .glb
  const { scene, materials } = useGLTF(glbUrl || '');

  // Clone the scene so we can modify it safely without mutating the cached version
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    return scene.clone(true);
  }, [scene]);

  useEffect(() => {
    if (clonedScene && selectedOptions.color) {
      clonedScene.traverse((child) => {
        if (child.isMesh && child.material) {
          // If the model shares materials, it's safe to clone it here or just mutate the cloned material
          child.material = child.material.clone();
          child.material.color.set(selectedOptions.color);
          child.material.needsUpdate = true;
        }
      });
    }
  }, [clonedScene, selectedOptions.color]);

  if (!glbUrl) return null;

  return (
    <primitive object={clonedScene} scale={[1, 1, 1]} position={[0, -1, 0]} />
  );
});

// Preload to ensure the browser fetches it early if needed
// However, since we dynamically set the URL from the API, we can't statically preload here
// useGLTF.preload('your-static-url.glb')

export default ModelViewer;
