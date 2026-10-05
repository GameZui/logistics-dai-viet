import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

// Draw Vietnamese labels locally; no remote font fetch can suspend the whole scene.
export const WorldLabel = ({ children, position, rotation, fontSize = .5, color = '#176858' }: {
  children: string; position?: [number, number, number]; rotation?: [number, number, number];
  fontSize?: number; color?: string; anchorX?: string; anchorY?: string;
}) => {
  const asset = useMemo(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.font = '600 64px "Segoe UI", sans-serif';
    const width = Math.ceil(context.measureText(children).width + 12);
    canvas.width = width; canvas.height = 88;
    context.font = '600 64px "Segoe UI", sans-serif';
    context.fillStyle = color; context.textAlign = 'center'; context.textBaseline = 'middle';
    context.fillText(children, width / 2, 44);
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace;
    return { texture, width: width / 64 * fontSize, height: 88 / 64 * fontSize };
  }, [children, color, fontSize]);
  useEffect(() => () => asset?.texture.dispose(), [asset]);
  if (!asset) return null;
  return <mesh position={position} rotation={rotation}><planeGeometry args={[asset.width, asset.height]} /><meshBasicMaterial map={asset.texture} transparent depthWrite={false} toneMapped={false} /></mesh>;
};
