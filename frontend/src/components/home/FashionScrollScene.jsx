import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import fashionLooks from './fashionLooks';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = value => value * value * (3 - 2 * value);

function LookCards({ sectionRef, onReady }) {
  const cardRefs = useRef([]);
  const hasReportedReady = useRef(false);
  const sectionSize = useThree(state => state.size);
  const textures = useLoader(
    THREE.TextureLoader,
    fashionLooks.map(look => look.image),
    loader => loader.setCrossOrigin('anonymous'),
  );
  const isMobile = sectionSize.width < 680;
  const isTablet = sectionSize.width < 1100;

  useEffect(() => {
    textures.forEach(texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    });
  }, [textures]);

  useFrame(({ clock }) => {
    if (!hasReportedReady.current) {
      hasReportedReady.current = true;
      onReady();
    }

    const section = sectionRef.current;
    if (!section) return;

    const scrollRange = Math.max(section.offsetHeight - window.innerHeight, 1);
    const progress = clamp((window.scrollY - section.offsetTop) / scrollRange, 0, 1);
    const spread = smoothstep(clamp(progress / 0.72, 0, 1));
    const cardScale = isMobile ? 0.72 : isTablet ? 0.82 : 1;
    const cardSpacing = isMobile ? 0.52 : isTablet ? 2.45 : 2.9;
    const centerShift = isMobile ? 0 : isTablet ? 0.6 : 1.15;
    const baseY = isMobile ? -1.35 : -0.85;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const centerOffset = index - 1;
      const finalY = isMobile ? -centerOffset * 0.42 : -Math.abs(centerOffset) * 0.08;
      const depth = index === 1 ? 0.6 : -0.25;

      card.scale.setScalar(cardScale);
      card.position.x = centerShift + centerOffset * cardSpacing * spread;
      card.position.y = baseY + finalY * spread + Math.sin(clock.elapsedTime * 0.65 + index) * 0.035;
      card.position.z = depth + (1 - spread) * (index === 1 ? 0.55 : -0.8);
      card.rotation.y = centerOffset * (0.32 - spread * 0.24);
      card.rotation.z = isMobile ? centerOffset * -0.08 : centerOffset * -0.035;
    });
  });

  return fashionLooks.map((look, index) => (
    <group key={look.label} ref={node => { cardRefs.current[index] = node; }}>
      <mesh position={[0, 0, -0.035]}>
        <planeGeometry args={[2.58, 3.52]} />
        <meshBasicMaterial color="#c9a96e" />
      </mesh>
      <mesh>
        <planeGeometry args={[2.48, 3.42]} />
        <meshBasicMaterial map={textures[index]} toneMapped={false} />
      </mesh>
    </group>
  ));
}

export default function FashionScrollScene({ sectionRef, onReady }) {
  return (
    <Canvas
      className="fashion-scroll-canvas"
      camera={{ position: [0, 0, 12], fov: 36 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: true }}
      aria-label="Three dimensional arrangement of the new fashion collection"
    >
      <Suspense fallback={null}>
        <LookCards sectionRef={sectionRef} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
