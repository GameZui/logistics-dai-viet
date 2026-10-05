import React from 'react';
import { WorldLabel as Text } from './WorldLabel';

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
      {/* Wood Base - Pallet gỗ thông chuẩn đóng kho */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.16, 1.3]} />
        <meshStandardMaterial color="#b45309" roughness={0.9} />
      </mesh>
      {/* 3 Thanh trượt chịu lực dưới đáy pallet */}
      {[-0.5, 0, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.03, 0]}>
          <boxGeometry args={[0.18, 0.06, 1.25]} />
          <meshStandardMaterial color="#92400e" roughness={0.95} />
        </mesh>
      ))}

      {/* CÁC LOẠI HÀNG HÓA THUẦN VIỆT */}
      {type === 'sack' ? (
        /* BAO TẢI DỨA GAI (LÚA GẠO ST25 & CÀ PHÊ HẠT) */
        <group>
          {[-0.32, 0.32].map((x) =>
            [-0.32, 0.32].map((z, idx) => (
              <group key={`${x}-${z}-${idx}`} position={[x, 0.52, z]}>
                {/* Thân bao tải căng phồng */}
                <mesh scale={[0.88, 1.15, 0.82]} castShadow>
                  <sphereGeometry args={[0.36, 10, 8]} />
                  <meshStandardMaterial color={color || '#e8d5a8'} roughness={0.95} />
                </mesh>
                {/* 2 Tai thắt dây rút ở đầu bao tải */}
                {[-0.14, 0.14].map((tx) => (
                  <mesh key={tx} position={[tx, 0.38, 0]} rotation={[0, 0, tx > 0 ? 0.4 : -0.4]}>
                    <cylinderGeometry args={[0.04, 0.07, 0.12, 6]} />
                    <meshStandardMaterial color="#d4b483" roughness={0.9} />
                  </mesh>
                ))}
                {/* Sọc chỉ dệt nhận diện nông sản */}
                <mesh position={[0, 0, 0.28]}>
                  <boxGeometry args={[0.3, 0.04, 0.02]} />
                  <meshStandardMaterial color="#15803d" />
                </mesh>
              </group>
            ))
          )}
        </group>
      ) : type === 'fruit' ? (
        /* SỌT NHỰA HOA QUẢ XUẤT KHẨU (SẦU RIÊNG / THANH LONG) */
        <group position={[0, 0.5, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.18, 0.8, 1.18]} />
            <meshStandardMaterial color="#ea580c" roughness={0.4} />
          </mesh>
          {/* Trái cây bên trong nhô lên */}
          {[-0.28, 0.28].map((fx) =>
            [-0.28, 0.28].map((fz) => (
              <mesh key={`fr-${fx}-${fz}`} position={[fx, 0.46, fz]}>
                <sphereGeometry args={[0.2, 8, 6]} />
                <meshStandardMaterial color="#84cc16" roughness={0.8} />
              </mesh>
            ))
          )}
          {/* Tem kiểm định chất lượng VietGAP */}
          <group position={[0, 0, 0.6]}>
            <mesh>
              <planeGeometry args={[0.35, 0.2]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <Text position={[0, 0, 0.01]} fontSize={0.08} color="#166534">
              VietGAP
            </Text>
          </group>
        </group>
      ) : type === 'drum' ? (
        /* PHUY CÔNG NGHIỆP / THỦY SẢN ĐÔNG LẠNH */
        <group>
          {[-0.32, 0.32].map((x) =>
            [-0.32, 0.32].map((z, idx) => (
              <group key={`${x}-${z}-${idx}`} position={[x, 0.55, z]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.26, 0.26, 0.82, 16]} />
                  <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.2} />
                </mesh>
                {/* 2 Vành đai thép tăng cứng thân phuy */}
                {[-0.2, 0.2].map((ry) => (
                  <mesh key={ry} position={[0, ry, 0]}>
                    <cylinderGeometry args={[0.27, 0.27, 0.04, 16]} />
                    <meshStandardMaterial color="#0369a1" />
                  </mesh>
                ))}
              </group>
            ))
          )}
        </group>
      ) : (
        /* THÙNG CARTON IN TEM LY HÀNG DỄ VỠ & MŨI TÊN THUẦN VIỆT */
        <group position={[0, 0.58, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.15, 0.88, 1.15]} />
            <meshStandardMaterial color={color || '#d97706'} roughness={0.8} />
          </mesh>
          {/* Băng dính vàng dán miệng thùng */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.24, 0.01, 1.16]} />
            <meshStandardMaterial color="#fef08a" roughness={0.3} />
          </mesh>
          {/* Biểu tượng in trên thùng carton: Ly rượu dễ vỡ 🍷 & Mũi tên ⬆ */}
          <group position={[0, 0.05, 0.59]}>
            <Text fontSize={0.26} color="#451a03" anchorX="center" anchorY="middle">
              🍷  ⬆⬆
            </Text>
            <Text position={[0, -0.22, 0]} fontSize={0.11} color="#78350f" anchorX="center" anchorY="middle">
              HÀNG DỄ VỠ - XIN NHẸ TAY
            </Text>
          </group>
        </group>
      )}
    </group>
  );
};
