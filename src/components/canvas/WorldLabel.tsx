import { useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

// Texture cache to prevent memory leaks and eliminate canvas creation overhead
const textureCache = new Map<string, { texture: CanvasTexture; width: number; height: number }>();

export const WorldLabel = ({
  children,
  position,
  rotation,
  fontSize = 0.5,
  color = '#176858',
}: {
  children: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  fontSize?: number;
  color?: string;
  anchorX?: string;
  anchorY?: string;
}) => {
  const asset = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const cacheKey = `${children}__${color}__${fontSize}`;
    if (textureCache.has(cacheKey)) {
      return textureCache.get(cacheKey)!;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.font = '600 64px "Segoe UI", sans-serif';
    const width = Math.ceil(context.measureText(children).width + 16);
    canvas.width = width;
    canvas.height = 88;

    context.font = '600 64px "Segoe UI", sans-serif';
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(children, width / 2, 44);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;

    const entry = {
      texture,
      width: (width / 64) * fontSize,
      height: (88 / 64) * fontSize,
    };
    textureCache.set(cacheKey, entry);
    return entry;
  }, [children, color, fontSize]);

  if (!asset) return null;

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[asset.width, asset.height]} />
      <meshBasicMaterial map={asset.texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
};
