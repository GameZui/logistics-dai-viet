import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export const IsometricCamera = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[28, 24, 28]}
        zoom={30}
        near={-100}
        far={300}
      />
      <OrbitControls
        ref={controlsRef}
        enableRotate={true}
        enablePan={true}
        enableZoom={true}
        minZoom={18}
        maxZoom={55}
        maxPolarAngle={Math.PI / 2.25}
        minPolarAngle={Math.PI / 6}
        target={[0, 1.5, 0]}
        dampingFactor={0.05}
      />
    </>
  );
};
