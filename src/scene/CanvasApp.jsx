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
  const rootStore = useMainContext();
  const design3dManager = rootStore.design3dManager;
  const { camera, controls } = useThree();
  const cameraAngle = design3dManager.cameraStoreManager.cameraAngle;

  useEffect(() => {
    if (cameraAngle) {
      console.log("CameraController: cameraAngle config values:", {
        fov: cameraAngle.fov,
        near: cameraAngle.near,
        far: cameraAngle.far,
        position: cameraAngle.position,
        target: cameraAngle.target,
        maxDim: cameraAngle.maxDim,
        maxDistance: cameraAngle.maxDistance,
        minDistance: cameraAngle.minDistance
      });

      if (cameraAngle.position && cameraAngle.target) {
        // Set exact camera coordinates
        camera.position.set(cameraAngle.position[0], cameraAngle.position[1], cameraAngle.position[2]);
        if (cameraAngle.fov) camera.fov = cameraAngle.fov;
        if (cameraAngle.near) camera.near = cameraAngle.near;
        if (cameraAngle.far) camera.far = cameraAngle.far;
        camera.updateProjectionMatrix();

        if (controls) {
          controls.target.set(cameraAngle.target[0], cameraAngle.target[1], cameraAngle.target[2]);
          if (cameraAngle.minDistance) controls.minDistance = cameraAngle.minDistance;
          if (cameraAngle.maxDistance) controls.maxDistance = cameraAngle.maxDistance;
          controls.update();
        } else {
          camera.lookAt(cameraAngle.target[0], cameraAngle.target[1], cameraAngle.target[2]);
        }
      } else if (cameraAngle.defaultAngle) {
        // Fallback pitch/yaw math
        const [pitch, yaw, roll] = cameraAngle.defaultAngle;
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
    }
  }, [cameraAngle, camera, controls]);

  return null;
});

const CanvasApp = observer(() => {
  const rootStore = useMainContext();
  const design3dManager = rootStore.design3dManager;
  const envStore = design3dManager.environmentStoreManager;
  const configStore = design3dManager.configuratorStoreManager;
  const cameraStore = design3dManager.cameraStoreManager;

  const glbUrl = configStore.glbUrl;
  const intensity = envStore.intensity ?? 1;
  const shadows = envStore.shadows ?? true;
  const lightMode = envStore.lightMode || 'city';

  // Determine environment file or preset (must be an image or HDR/EXR, not a .glb model)
  const cleanUrl = lightMode.split('?')[0];
  const isUrl = lightMode.startsWith('http') && 
                 (cleanUrl.toLowerCase().endsWith('.hdr') || 
                  cleanUrl.toLowerCase().endsWith('.exr'));
  const preset = !isUrl ? (PRESET_MAP[lightMode.toLowerCase()] || 'city') : null;

  // Zoom Limit bounds from cameraAngle config
  const minZoom = cameraStore.cameraAngle?.zoomLimit?.[0] ?? 2;
  const maxZoom = cameraStore.cameraAngle?.zoomLimit?.[1] ?? 10;

  const envRotation = [
    envStore.rotation?.x || 0,
    envStore.rotation?.y || 0,
    envStore.rotation?.z || 0
  ];

  return (
    <div className="w-full h-full bg-transparent">
      <Canvas 
        key={glbUrl || 'empty'}
        shadows={shadows} 
        camera={{
          position: cameraStore.cameraAngle?.position || [0, 2, 5],
          fov: cameraStore.cameraAngle?.fov || 50,
          near: cameraStore.cameraAngle?.near || 0.1,
          far: cameraStore.cameraAngle?.far || 1000
        }}
      >

        {isUrl ? (
          <Environment 
            files={cleanUrl} 
            background={false}
            backgroundIntensity={intensity}
            environmentIntensity={intensity}
            rotation={envRotation}
          />
        ) : (
          <Environment 
            preset={preset} 
            background={false}
            backgroundIntensity={intensity}
            environmentIntensity={intensity}
            rotation={envRotation}
          />
        )}
        
        <Suspense fallback={<CanvasLoader />}>
          {glbUrl ? (
            <ModelViewer />
          ) : null}
        </Suspense>

        <CameraController />
        <OrbitControls 
          makeDefault 
          minDistance={minZoom} 
          maxDistance={maxZoom} 
          target={cameraStore.cameraAngle?.target || [0, 0, 0]}
        />
      </Canvas>
    </div>
  );
});

export default CanvasApp;
