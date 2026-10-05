import React from 'react';

export const GroundAndRoads = () => {
  return (
    <group>
      {/* Main Ground Tarmac */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#e5edf5" roughness={0.85} />
      </mesh>

      {/* Main Driveway / Roadway in front of docks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 14]} receiveShadow>
        <planeGeometry args={[90, 14]} />
        <meshStandardMaterial color="#d4e2ee" roughness={0.7} />
      </mesh>

      {/* White dashed road center line */}
      {[-36, -24, -12, 0, 12, 24, 36].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.015, 14]}>
          <planeGeometry args={[5, 0.45]} />
          <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
        </mesh>
      ))}

      {/* Solid Road Borders */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 7.1]}>
        <planeGeometry args={[90, 0.25]} />
        <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 20.9]}>
        <planeGeometry args={[90, 0.25]} />
        <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>

      {/* Dock Staging Parking Guidelines (Vạch sơn vàng/trắng chỉ dẫn lùi xe) */}
      {[-12, -4, 4, 12].map((x, idx) => (
        <group key={`guide-${idx}`} position={[x, 0.015, 5]}>
          {/* Left guideline */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.7, 0, 0]}>
            <planeGeometry args={[0.2, 9]} />
            <meshBasicMaterial color="#ffd166" opacity={0.85} transparent />
          </mesh>
          {/* Right guideline */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.7, 0, 0]}>
            <planeGeometry args={[0.2, 9]} />
            <meshBasicMaterial color="#ffd166" opacity={0.85} transparent />
          </mesh>
          {/* Back stop line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 4.4]}>
            <planeGeometry args={[3.2, 0.2]} />
            <meshBasicMaterial color="#ffd166" opacity={0.85} transparent />
          </mesh>
        </group>
      ))}

      {/* Low-poly Round Trees along the border (like in reference video) */}
      {[
        { x: -38, z: 24, scale: 1.1 },
        { x: -28, z: 25, scale: 0.95 },
        { x: -16, z: 24.5, scale: 1.05 },
        { x: -5, z: 25, scale: 0.9 },
        { x: 8, z: 24.5, scale: 1.0 },
        { x: 20, z: 25.2, scale: 1.15 },
        { x: 32, z: 24.8, scale: 0.9 },
        { x: 40, z: 25.5, scale: 1.05 },
        // Back/Side trees
        { x: -35, z: -10, scale: 1.0 },
        { x: -35, z: 2, scale: 1.1 },
        { x: 35, z: -10, scale: 0.95 },
        { x: 35, z: 2, scale: 1.05 },
      ].map((tree, i) => (
        <group key={`tree-${i}`} position={[tree.x, 0, tree.z]} scale={tree.scale}>
          {/* Trunk */}
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.22, 2.8, 8]} />
            <meshStandardMaterial color="#8c786a" roughness={0.9} />
          </mesh>
          {/* Stylized Foliage Ball */}
          <mesh position={[0, 3.6, 0]} castShadow>
            <sphereGeometry args={[1.35, 16, 16]} />
            <meshStandardMaterial color="#5cb874" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Modern Perimeter Fence (Hàng rào nan kim loại trắng xám) */}
      <group position={[0, 0, 22.5]}>
        {/* Posts */}
        {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((x) => (
          <mesh key={`post-${x}`} position={[x, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.3} />
          </mesh>
        ))}
        {/* Horizontal rails */}
        <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 82, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.4} />
        </mesh>
        <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 82, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
};
