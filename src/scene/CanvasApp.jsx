import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Center, Html } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import { useStore } from '../hooks/useStore';
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

const CanvasApp = observer(() => {
  const { configuratorStore } = useStore();
  
  return (
    <div className="w-full h-full bg-gray-200">
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Environment preset="city" />
        
        <Suspense fallback={<CanvasLoader />}>
          <Center>
            {configuratorStore.glbUrl ? (
              <ModelViewer />
            ) : null}
          </Center>
        </Suspense>

        <OrbitControls makeDefault minDistance={2} maxDistance={10} />
      </Canvas>
    </div>
  );
});

export default CanvasApp;
