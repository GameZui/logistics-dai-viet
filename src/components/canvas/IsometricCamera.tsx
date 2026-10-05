import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera as ThreeOrthographicCamera, Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CAMERA_VIEWS } from '../../utils/cameraViews';

interface FocusRequest {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

const clampZoom = (zoom: number) => Math.max(4, Math.min(45, zoom));

export const IsometricCamera = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  const requested = useRef<FocusRequest | null>(null);
  const desiredZoom = useRef(12);
  const zoomRequested = useRef(false);
  const tween = useRef({
    active: false, t: 0, duration: 0.9,
    fromPos: new Vector3(), fromTarget: new Vector3(), fromZoom: 12,
    toPos: new Vector3(), toTarget: new Vector3(), toZoom: 12,
  });

  useEffect(() => {
    const view = camera as ThreeOrthographicCamera;
    const frameZoom = () => clampZoom(Math.max(5, Math.min(size.width / 78, size.height / 58)));
    const overview = CAMERA_VIEWS[0];
    const reset = () => { requested.current = { position: overview.position, target: overview.target, zoom: frameZoom() }; };
    const applyView = (event: Event) => {
      const id = (event as CustomEvent<{ id: string }>).detail?.id;
      const found = CAMERA_VIEWS.find((item) => item.id === id);
      if (found) requested.current = { position: found.position, target: found.target, zoom: found.zoom };
    };
    const focusTarget = (event: Event) => {
      const target = (event as CustomEvent<{ target: [number, number, number] }>).detail?.target;
      if (!target) return;
      const current = controlsRef.current?.target ?? new Vector3(0, 1.5, -3);
      const offset = view.position.clone().sub(current);
      requested.current = {
        position: [target[0] + offset.x, target[1] + offset.y, target[2] + offset.z],
        target,
        zoom: clampZoom(desiredZoom.current * 1.25),
      };
    };
    const zoomIn = () => { desiredZoom.current = clampZoom(desiredZoom.current * 1.2); zoomRequested.current = true; };
    const zoomOut = () => { desiredZoom.current = clampZoom(desiredZoom.current / 1.2); zoomRequested.current = true; };

    // Snap to the opening overview before the first frame is drawn.
    view.position.set(...overview.position);
    view.zoom = frameZoom();
    desiredZoom.current = view.zoom;
    view.updateProjectionMatrix();
    controlsRef.current?.target.set(...overview.target);
    controlsRef.current?.update();

    window.addEventListener('camera-reset', reset);
    window.addEventListener('camera-home', reset);
    window.addEventListener('camera-view', applyView as EventListener);
    window.addEventListener('camera-focus', focusTarget as EventListener);
    window.addEventListener('camera-zoom-in', zoomIn);
    window.addEventListener('camera-zoom-out', zoomOut);
    return () => {
      window.removeEventListener('camera-reset', reset);
      window.removeEventListener('camera-home', reset);
      window.removeEventListener('camera-view', applyView as EventListener);
      window.removeEventListener('camera-focus', focusTarget as EventListener);
      window.removeEventListener('camera-zoom-in', zoomIn);
      window.removeEventListener('camera-zoom-out', zoomOut);
    };
  }, [camera, size.width, size.height]);

  useFrame((_, delta) => {
    const view = camera as ThreeOrthographicCamera;
    const controls = controlsRef.current;
    if (!controls) return;

    // Start a smooth move whenever a preset or focus request has arrived.
    const req = requested.current;
    if (req) {
      requested.current = null;
      tween.current.fromPos.copy(view.position);
      tween.current.fromTarget.copy(controls.target);
      tween.current.fromZoom = view.zoom;
      tween.current.toPos.set(...req.position);
      tween.current.toTarget.set(...req.target);
      tween.current.toZoom = req.zoom;
      tween.current.t = 0;
      tween.current.active = true;
    }

    if (tween.current.active) {
      const { fromPos, fromTarget, toPos, toTarget, fromZoom, toZoom } = tween.current;
      tween.current.t = Math.min(1, tween.current.t + delta / tween.current.duration);
      const k = tween.current.t * tween.current.t * (3 - 2 * tween.current.t);
      view.position.lerpVectors(fromPos, toPos, k);
      controls.target.lerpVectors(fromTarget, toTarget, k);
      view.zoom = fromZoom + (toZoom - fromZoom) * k;
      desiredZoom.current = view.zoom;
      view.updateProjectionMatrix();
      controls.update();
      if (tween.current.t >= 1) tween.current.active = false;
    } else if (zoomRequested.current) {
      view.zoom += (desiredZoom.current - view.zoom) * Math.min(1, delta * 8);
      view.updateProjectionMatrix();
      controls.update();
      if (Math.abs(view.zoom - desiredZoom.current) < 0.05) zoomRequested.current = false;
    } else if (Math.abs(view.zoom - desiredZoom.current) > 0.01) {
      // The player zoomed with the wheel/gesture; follow it instead of fighting it.
      desiredZoom.current = view.zoom;
    }
  });

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={CAMERA_VIEWS[0].position}
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
        target={CAMERA_VIEWS[0].target}
        dampingFactor={0.05}
      />
    </>
  );
};
