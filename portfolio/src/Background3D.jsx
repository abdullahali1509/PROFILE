import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

const T = '#EB7D00', V = '#EBE3A7', G = '#2C5745'

// Shapes are spread down the page so scrolling travels through them.
const shapes = [
  { type: 'ico',   color: T, pos: [-3.2, 1.2, 0],   s: 1.3 },
  { type: 'torus', color: V, pos: [3.4, 0, -1],     s: 1.1 },
  { type: 'oct',   color: G, pos: [0.6, -2.4, 1],   s: 0.9 },
  { type: 'knot',  color: T, pos: [-3.4, -5, -1],   s: 1.0 },
  { type: 'ico',   color: V, pos: [3.2, -7, 0],     s: 0.9 },
  { type: 'torus', color: G, pos: [-2.8, -9.5, 0],  s: 1.2 },
  { type: 'oct',   color: T, pos: [3, -12, -1],     s: 1.1 },
  { type: 'knot',  color: V, pos: [-1, -14, 0],     s: 0.9 },
]

function Shape({ type, color, pos, s }) {
  const ref = useRef()
  useFrame((_, d) => {
    ref.current.rotation.x += d * 0.25
    ref.current.rotation.y += d * 0.35
  })
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.2}>
      <mesh ref={ref} position={pos} scale={s}>
        {type === 'ico' && <icosahedronGeometry args={[1, 0]} />}
        {type === 'torus' && <torusGeometry args={[0.8, 0.3, 16, 48]} />}
        {type === 'oct' && <octahedronGeometry args={[1]} />}
        {type === 'knot' && <torusKnotGeometry args={[0.65, 0.22, 100, 16]} />}
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} flatShading={type !== 'torus' && type !== 'knot'} />
      </mesh>
    </Float>
  )
}

// k is 1 on desktop and shrinks on narrow screens so shapes stay small and inside the view.
const useFit = () => Math.min(1, useThree((s) => s.viewport.width) / 11)

function Shapes() {
  const k = useFit()
  return shapes.map((s, i) => (
    <Shape key={i} type={s.type} color={s.color} pos={[s.pos[0] * k, s.pos[1], s.pos[2]]} s={s.s * Math.max(k, 0.35)} />
  ))
}

// Camera follows scroll position and leans slightly toward the pointer.
function Rig() {
  const k = useFit()
  useFrame((state, d) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? window.scrollY / max : 0
    const cam = state.camera
    cam.position.y = THREE.MathUtils.damp(cam.position.y, -p * 14, 4, d)
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 0.9 * k, 3, d)
  })
  return null
}

export default function Background3D() {
  return (
    <div className="bg3d" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.75]}
        eventSource={document.getElementById('root')}
        eventPrefix="client"
      >
        <color attach="background" args={['#2E2910']} />
        <fog attach="fog" args={['#2E2910', 9, 22]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 6, 5]} intensity={2} />
        <pointLight position={[-5, -2, 4]} intensity={30} color={T} />
        <Shapes />
        <Rig />
      </Canvas>
    </div>
  )
}
