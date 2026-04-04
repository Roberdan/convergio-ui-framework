/**
 * Maranello Brain 3D – Three.js scene lifecycle, bloom post-processing, animation.
 */
import {
  Scene, PerspectiveCamera, WebGLRenderer,
  AmbientLight, DirectionalLight, Points, PointsMaterial,
  Vector2, Color, Fog, Clock, Raycaster, Vector3,
  Mesh, MeshStandardMaterial, AdditiveBlending,
  CatmullRomCurve3, Group,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import type { Brain3DNode, Brain3DEdge } from "./mn-brain-3d.types"
import type { Brain3DPalette } from "./mn-brain-3d.helpers"
import { nodeColor } from "./mn-brain-3d.helpers"
import {
  createBrainCloud, brainSurfacePos,
  createNodeMesh, createConnectionCurve, createTravelParticle,
} from "./mn-brain-3d.geometry"

export interface BrainSceneOpts {
  canvas: HTMLCanvasElement
  nodes: Brain3DNode[]
  edges: Brain3DEdge[]
  palette: Brain3DPalette
  width: number
  height: number
  showLabels: boolean
  reducedMotion: boolean
  onNodeClick?: (node: Brain3DNode) => void
  onNodeHover?: (node: Brain3DNode | null) => void
}

export interface BrainSceneHandle {
  resize(w: number, h: number): void
  dispose(): void
  setAutoRotate(on: boolean, speed: number): void
}

const BG = 0x080810

export function createBrainScene(opts: BrainSceneOpts): BrainSceneHandle {
  const { canvas, nodes, edges, palette, showLabels, reducedMotion } = opts
  let { width, height } = opts

  /* ── Core setup ─────────────────────────────────────────── */
  const scene = new Scene()
  scene.background = new Color(BG)
  scene.fog = new Fog(BG, 55, 140)

  const camera = new PerspectiveCamera(55, width / height, 0.1, 500)
  camera.position.set(0, 15, 80)

  const renderer = new WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(new UnrealBloomPass(new Vector2(width, height), 0.5, 0.35, 0.4))

  scene.add(new AmbientLight(0x1a1a3a, 0.6))
  const dir = new DirectionalLight(0xffffff, 0.25)
  dir.position.set(20, 30, 20)
  scene.add(dir)

  /* ── Controls ───────────────────────────────────────────── */
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = !reducedMotion
  controls.autoRotateSpeed = 0.4
  controls.minDistance = 25
  controls.maxDistance = 110
  controls.enablePan = false

  let idleTimer: ReturnType<typeof setTimeout> | null = null
  controls.addEventListener("start", () => {
    controls.autoRotate = false
    if (idleTimer) clearTimeout(idleTimer)
  })
  controls.addEventListener("end", () => {
    idleTimer = setTimeout(() => { if (!reducedMotion) controls.autoRotate = true }, 3000)
  })

  /* ── Brain cloud ────────────────────────────────────────── */
  const cloud = new Points(
    createBrainCloud(3000),
    new PointsMaterial({
      size: 0.55, vertexColors: true, transparent: true,
      opacity: 0.5, blending: AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    }),
  )
  scene.add(cloud)

  /* ── Nodes ──────────────────────────────────────────────── */
  const nodeGroups: Group[] = []
  const posMap = new Map<string, Vector3>()
  nodes.forEach((node, i) => {
    const pos = brainSurfacePos(i, nodes.length)
    posMap.set(node.id, pos)
    const g = createNodeMesh(node, pos, palette, showLabels)
    scene.add(g)
    nodeGroups.push(g)
  })

  /* ── Connections + particles ────────────────────────────── */
  interface Traveler { mesh: Mesh; curve: CatmullRomCurve3; t: number; speed: number }
  const travelers: Traveler[] = []
  for (const edge of edges) {
    const from = posMap.get(edge.source), to = posMap.get(edge.target)
    if (!from || !to) continue
    const src = nodes.find((n) => n.id === edge.source) ?? nodes[0]
    const { tube, curve } = createConnectionCurve(from, to, edge, palette, src)
    scene.add(tube)
    if (edge.active && !reducedMotion) {
      const c = new Color(nodeColor(src, palette))
      for (let p = 0; p < 4; p++) {
        const m = createTravelParticle(c)
        scene.add(m)
        travelers.push({ mesh: m, curve, t: Math.random(), speed: 0.0015 + Math.random() * 0.003 })
      }
    }
  }

  /* ── Raycasting (click + hover) ─────────────────────────── */
  const raycaster = new Raycaster()
  const mouse = new Vector2()
  let hovered: Brain3DNode | null = null

  const getHit = (e: Event): Brain3DNode | null => {
    const me = e as MouseEvent
    const rect = canvas.getBoundingClientRect()
    mouse.x = ((me.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((me.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    for (const g of nodeGroups) {
      if (raycaster.intersectObject(g, true).length > 0) return g.userData.node as Brain3DNode
    }
    return null
  }
  const onMove = (e: Event) => {
    const hit = getHit(e)
    canvas.style.cursor = hit ? "pointer" : "default"
    if (hit !== hovered) { hovered = hit; opts.onNodeHover?.(hit) }
  }
  const onClick = (e: Event) => { const hit = getHit(e); if (hit) opts.onNodeClick?.(hit) }
  canvas.addEventListener("pointermove", onMove)
  canvas.addEventListener("click", onClick)

  /* ── Animation loop ─────────────────────────────────────── */
  const clock = new Clock()
  let raf = 0
  const animate = () => {
    raf = requestAnimationFrame(animate)
    const t = clock.getElapsedTime()
    if (!reducedMotion) {
      for (const g of nodeGroups) {
        const nd = g.userData.node as Brain3DNode
        if (nd.status === "active") {
          g.children[0].scale.setScalar(1 + Math.sin(t * 2.5 + g.position.x) * 0.06)
          const mat = (g.children[0] as Mesh).material as MeshStandardMaterial
          mat.emissiveIntensity = 0.5 + Math.sin(t * 3.2 + g.position.z) * 0.25
        }
      }
      for (const p of travelers) {
        p.t = (p.t + p.speed) % 1
        p.mesh.position.copy(p.curve.getPointAt(p.t))
      }
      cloud.rotation.y += 0.0002
    }
    controls.update()
    composer.render()
  }
  animate()

  /* ── Handle ─────────────────────────────────────────────── */
  return {
    resize(w: number, h: number) {
      width = w; height = h
      camera.aspect = w / h; camera.updateProjectionMatrix()
      renderer.setSize(w, h); composer.setSize(w, h)
    },
    dispose() {
      cancelAnimationFrame(raf)
      if (idleTimer) clearTimeout(idleTimer)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("click", onClick)
      controls.dispose(); renderer.dispose(); composer.dispose()
    },
    setAutoRotate(on: boolean, speed: number) {
      controls.autoRotate = on && !reducedMotion
      controls.autoRotateSpeed = speed
    },
  }
}
