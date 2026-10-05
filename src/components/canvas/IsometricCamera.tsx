import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrthographicCamera as ThreeOrthographicCamera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export const IsometricCamera = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  useEffect(() => {
    const view = camera as ThreeOrthographicCamera;
    const reset = () => {
      view.position.set(38, 32, 45);
      view.zoom = Math.max(5, Math.min(size.width / 78, size.height / 58));
      controlsRef.current?.target.set(0, 1.5, -3);
      view.updateProjectionMatrix();
      controlsRef.current?.update();
    };
    const zoomIn = () => { view.zoom = Math.min(45, view.zoom * 1.2); view.updateProjectionMatrix(); };
    const zoomOut = () => { view.zoom = Math.max(4, view.zoom / 1.2); view.updateProjectionMatrix(); };
    reset();
    window.addEventListener('camera-reset', reset);
    window.addEventListener('camera-home', reset);
    window.addEventListener('camera-zoom-in', zoomIn);
    window.addEventListener('camera-zoom-out', zoomOut);
    return () => {
      window.removeEventListener('camera-reset', reset);
      window.removeEventListener('camera-home', reset);
      window.removeEventListener('camera-zoom-in', zoomIn);
      window.removeEventListener('camera-zoom-out', zoomOut);
    };
  }, [camera, size.width, size.height]);

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[38, 32, 45]}
        zoom={12}
        near={0.1}
        far={300}
      />
      <OrbitControls
        ref={controlsRef}
        enableRotate={true}
        enablePan={true}
        enableZoom={true}
        minZoom={4}
        maxZoom={45}
        maxPolarAngle={Math.PI / 2.25}
        minPolarAngle={Math.PI / 6}
        target={[0, 1.5, 0]}
        dampingFactor={0.05}
      />
    </>
  );
};
