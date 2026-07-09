import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Center, Html } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import { useMainContext } from '../context/MainContextProvider';
import ModelViewer from './models/ModelViewer';

const CanvasLoader = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-4 bg-white/80 p-6 rounded-xl shadow-lg backdrop-blur-md">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-700 whitespace-nowrap">Parsing 3D Model...</p>
      </div>
    </Html>
  );
};

// Maps backend lightMode strings to react-three-drei Environment presets
const PRESET_MAP = {
  dark: 'night',
  bright: 'apartment',
  city: 'city',
  sunset: 'sunset',
  studio: 'studio',
  forest: 'forest',
  dawn: 'dawn',
  lobby: 'lobby',
  park: 'park',
  warehouse: 'warehouse'
};

// Controller to position and update camera based on backend configurations
const CameraController = observer(() => {
  const { design3dManager } = useMainContext();
  const { camera, controls } = useThree();
  const cameraAngle = design3dManager.configuratorStoreManager.cameraAngle;

  useEffect(() => {
    if (cameraAngle && cameraAngle.defaultAngle) {
      const [pitch, yaw, roll] = cameraAngle.defaultAngle;
      
      // Let's assume a default camera distance of 5 units
      const radius = 5;
      const pitchRad = (pitch * Math.PI) / 180;
      const yawRad = (yaw * Math.PI) / 180;
      
      const x = radius * Math.sin(yawRad) * Math.cos(pitchRad);
      const y = radius * Math.sin(pitchRad);
      const z = radius * Math.cos(yawRad) * Math.cos(pitchRad);
      
      camera.position.set(x, y, z);
      
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      } else {
        camera.lookAt(0, 0, 0);
      }
    }
  }, [cameraAngle, camera, controls]);

  return null;
});

const CanvasApp = observer(() => {
  const { design3dManager } = useMainContext();
  const envStore = design3dManager.environmentStoreManager;
  const configStore = design3dManager.configuratorStoreManager;

  const glbUrl = configStore.glbUrl;
  const intensity = envStore.intensity ?? 1;
  const shadows = envStore.shadows ?? true;
  const lightMode = envStore.lightMode || 'city';

  // Determine environment file or preset (must be an image or HDR/EXR, not a .glb model)
  const isUrl = lightMode.startsWith('http') && 
                 (lightMode.endsWith('.hdr') || 
                  lightMode.endsWith('.exr'));
  const preset = !isUrl ? (PRESET_MAP[lightMode.toLowerCase()] || 'city') : null;

  // Zoom Limit bounds from cameraAngle config
  const minZoom = configStore.cameraAngle?.zoomLimit?.[0] ?? 2;
  const maxZoom = configStore.cameraAngle?.zoomLimit?.[1] ?? 10;

  const envRotation = [
    envStore.rotation?.x || 0,
    envStore.rotation?.y || 0,
    envStore.rotation?.z || 0
  ];

  return (
    <div className="w-full h-full bg-gray-200">
      <Canvas 
        key={glbUrl || 'empty'}
        shadows={shadows} 
        camera={{ position: [0, 2, 5], fov: 50 }}
      >
        <ambientLight intensity={0.5 * intensity} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.0 * intensity} 
          castShadow={shadows} 
        />
        
        {isUrl ? (
          <Environment 
            files={lightMode} 
            background={true}
            backgroundIntensity={intensity}
            environmentIntensity={intensity}
            rotation={envRotation}
          />
        ) : (
          <Environment 
            preset={preset} 
            background={true}
            backgroundIntensity={intensity}
            environmentIntensity={intensity}
            rotation={envRotation}
          />
        )}
        
        <Suspense fallback={<CanvasLoader />}>
          <Center>
            {glbUrl ? (
              <ModelViewer />
            ) : null}
          </Center>
        </Suspense>

        <CameraController />
        <OrbitControls makeDefault minDistance={minZoom} maxDistance={maxZoom} />
      </Canvas>
    </div>
  );
});

export default CanvasApp;
