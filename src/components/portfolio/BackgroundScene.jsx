// components/portfolio/BackgroundScene.jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshWobbleMaterial } from '@react-three/drei';

const Shape = ({ color, position }) => (
  <Float speed={1} rotationIntensity={2} floatIntensity={5}>
    <mesh position={position}>
      <dodecahedronGeometry args={[1, 0]} />
      <MeshWobbleMaterial color={color} speed={1} factor={0.5} />
    </mesh>
  </Float>
);

const BackgroundScene = () => {
  return (
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} />
        <OrbitControls enableZoom={false} enablePan={false} />
        
        <Shape color="#FF6B6B" position={[-5, 5, 0]} />
        <Shape color="#6BCB77" position={[2, 1, -2]} />
        <Shape color="#4D96FF" position={[-1, -2, 1]} />
        <Shape color="#FFD93D" position={[3, -1, -3]} />
        <Shape color="#C65DFF" position={[0, 3, -1]} />
      </Canvas>
  );
};

export default BackgroundScene;
