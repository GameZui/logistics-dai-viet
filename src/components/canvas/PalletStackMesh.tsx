import React from 'react';

interface PalletStackMeshProps {
  position?: [number, number, number];
  color?: string;
  type?: string;
  scale?: number;
}

export const PalletStackMesh = ({
  position = [0, 0, 0],
  color = '#d97706',
  type = 'box',
  scale = 1,
}: PalletStackMeshProps) => {
  return (
    <group position={position} scale={scale}>
      {/* Wood Base - Euro Pallet */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.16, 1.3]} />
        <meshStandardMaterial color="#b45309" roughness={0.9} />
      </mesh>
      {/* Pallet Bottom Runners */}
      {[-0.5, 0, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.03, 0]}>
          <boxGeometry args={[0.18, 0.06, 1.25]} />
          <meshStandardMaterial color="#92400e" roughness={0.9} />
        </mesh>
      ))}

      {/* Cargo on pallet */}
      {type === 'drum' ? (
        // 4 Blue Plastic Drums
        [-0.3, 0.3].map((x) =>
          [-0.3, 0.3].map((z, idx) => (
            <mesh key={`${x}-${z}-${idx}`} position={[x, 0.55, z]} castShadow>
              <cylinderGeometry args={[0.26, 0.26, 0.8, 16]} />
              <meshStandardMaterial color="#2563eb" roughness={0.4} metalness={0.1} />
            </mesh>
          ))
        )
      ) : (
        // Stack of Cardboard Boxes with Tape
        <group position={[0, 0.6, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.15, 0.9, 1.15]} />
            <meshStandardMaterial color={color} roughness={0.75} />
          </mesh>
          {/* Packing tape stripe across box */}
          <mesh position={[0, 0.46, 0]}>
            <boxGeometry args={[0.22, 0.01, 1.16]} />
            <meshStandardMaterial color="#fef08a" roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
};
