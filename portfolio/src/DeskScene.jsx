import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// Wraps an object: hover grows it, click selects it.
function Hotspot({ id, onSelect, position, rotation = [0, 0, 0], active, children }) {
  const ref = useRef()
  const [hover, setHover] = useState(false)
  useFrame((_, d) => {
    const target = hover || active ? 1.07 : 1
    ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, target, 8, d))
  })
  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onSelect(id) }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto' }}
    >
      {children}
    </group>
  )
}

const mat = (color, extra = {}) => <meshStandardMaterial color={color} roughness={0.6} {...extra} />

function Monitor() {
  return (
    <group>
      <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.9, 0.08, 0.5]} />{mat('#1a170a')}</mesh>
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.07, 0.07, 0.9, 16]} />{mat('#1a170a')}</mesh>
      <mesh position={[0, 1.35, 0]}><boxGeometry args={[2.3, 1.35, 0.1]} />{mat('#1a170a')}</mesh>
      <mesh position={[0, 1.35, 0.06]}>
        <planeGeometry args={[2.1, 1.15]} />
        <meshStandardMaterial color="#2C5745" emissive="#2C5745" emissiveIntensity={0.9} />
      </mesh>
      {[0.3, 0.1, -0.1, -0.3].map((y, i) => (
        <mesh key={i} position={[-0.9 + (i % 2 ? 0.35 : 0) + (2 - i) * 0.15 + 0.3, 1.35 + y, 0.07]}>
          <boxGeometry args={[0.7 + (i % 3) * 0.35, 0.05, 0.01]} />
          <meshBasicMaterial color={i === 1 ? '#EB7D00' : '#EBE3A7'} />
        </mesh>
      ))}
    </group>
  )
}

function Lamp({ on }) {
  return (
    <group>
      <mesh position={[0, 0.04, 0]}><cylinderGeometry args={[0.28, 0.32, 0.08, 24]} />{mat('#1a170a')}</mesh>
      <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.03, 0.03, 1.1, 12]} />{mat('#1a170a')}</mesh>
      <mesh position={[0, 1.25, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.38, 0.45, 24, 1, true]} /><meshStandardMaterial color="#EB7D00" side={THREE.DoubleSide} roughness={0.5} /></mesh>
      <mesh position={[0, 1.12, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#EBE3A7" emissive="#EBE3A7" emissiveIntensity={on ? 2 : 0} />
      </mesh>
      <pointLight position={[0, 1.0, 0.2]} intensity={on ? 14 : 0} color="#ffcf8a" distance={7} />
    </group>
  )
}

function Books() {
  const stack = [['#EB7D00', 1.1, 0.16, 0.1], ['#2C5745', 1.0, 0.14, -0.08], ['#EBE3A7', 0.9, 0.13, 0.05]]
  let y = 0
  return (
    <group>
      {stack.map(([c, w, h, r], i) => {
        y += h
        return (
          <mesh key={i} position={[0, y - h / 2, 0]} rotation={[0, r, 0]}>
            <boxGeometry args={[w, h, 0.75]} />{mat(c)}
          </mesh>
        )
      })}
    </group>
  )
}

function Mug() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.2, 0.18, 0.4, 24]} />{mat('#EBE3A7')}</mesh>
      <mesh position={[0.22, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.11, 0.035, 12, 24]} />{mat('#EBE3A7')}</mesh>
      <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.17, 0.17, 0.02, 24]} />{mat('#3b2a12')}</mesh>
    </group>
  )
}

// Pulls the camera back on narrow canvases so the whole desk stays visible.
function FitCamera() {
  const { camera, size } = useThree()
  useEffect(() => {
    const f = Math.max(1, 1.45 / (size.width / size.height))
    camera.position.set(0, 2.6 * f, 6.4 * f)
  }, [camera, size.width, size.height])
  return null
}

export default function DeskScene({ active, onSelect, lampOn, onLamp }) {
  const pick = (id) => { if (id === 'lamp') onLamp(); onSelect(id) }
  return (
    <Canvas camera={{ position: [0, 2.6, 6.4], fov: 45 }} dpr={[1, 2]}>
      <FitCamera />
      <ambientLight intensity={lampOn ? 0.35 : 0.6} />
      <directionalLight position={[4, 6, 3]} intensity={lampOn ? 0.8 : 1.4} />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <circleGeometry args={[6, 48]} />{mat('#2C5745')}
      </mesh>
      <ContactShadows position={[0, -1.49, 0]} opacity={0.5} scale={9} blur={2.5} far={3} />

      {/* desk */}
      <mesh position={[0, -0.1, 0]}><boxGeometry args={[5.6, 0.2, 2.6]} />{mat('#8a7430')}</mesh>
      {[[-2.6, -1.2], [2.6, -1.2], [-2.6, 1.1], [2.6, 1.1]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.8, z]}><boxGeometry args={[0.18, 1.4, 0.18]} />{mat('#1f1b08')}</mesh>
      ))}

      <Hotspot id="monitor" position={[0, 0, -0.5]} active={active === 'monitor'} onSelect={pick}><Monitor /></Hotspot>
      <Hotspot id="lamp" position={[-2.1, 0, -0.6]} active={active === 'lamp'} onSelect={pick}><Lamp on={lampOn} /></Hotspot>
      <Hotspot id="books" position={[2.0, 0, -0.2]} rotation={[0, -0.3, 0]} active={active === 'books'} onSelect={pick}><Books /></Hotspot>
      <Hotspot id="mug" position={[1.1, 0, 0.7]} active={active === 'mug'} onSelect={pick}><Mug /></Hotspot>

      <OrbitControls
        enableZoom={false} enablePan={false}
        target={[0, 0.6, 0]}
        minPolarAngle={0.9} maxPolarAngle={1.5}
        minAzimuthAngle={-0.9} maxAzimuthAngle={0.9}
      />
    </Canvas>
  )
}
