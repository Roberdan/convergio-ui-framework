/**
 * Maranello Brain 3D – Three.js geometry builders.
 * Brain-shaped point cloud, node meshes with glow, curved connections, particles.
 */
import {
  BufferGeometry, Float32BufferAttribute, Vector3, Color,
  IcosahedronGeometry, MeshStandardMaterial, MeshBasicMaterial, Mesh,
  SphereGeometry, PointLight, Group, AdditiveBlending,
  CatmullRomCurve3, TubeGeometry,
} from "three"
import SpriteText from "three-spritetext"
import type { Brain3DNode, Brain3DEdge } from "./mn-brain-3d.types"
import type { Brain3DPalette } from "./mn-brain-3d.helpers"
import { nodeColor } from "./mn-brain-3d.helpers"

/* ── Brain-shaped point cloud ────────────────────────────── */
export function createBrainCloud(count: number): BufferGeometry {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const rF = 0.15 + Math.pow(Math.random(), 0.35) * 0.85
    const ax = 32, ay = 24, az = 28

    let rz = 1
    const fwd = Math.sin(phi) * Math.cos(theta)
    if (fwd > 0.3) rz += 0.12

    let x = ax * rF * Math.sin(phi) * Math.cos(theta)
    let y = ay * rF * Math.cos(phi)
    let z = az * rF * rz * Math.sin(phi) * Math.sin(theta)

    /* longitudinal fissure */
    const lat = Math.abs(Math.sin(phi) * Math.sin(theta))
    if (Math.cos(phi) > 0.4 && lat < 0.15) y -= 2.5

    x += (Math.random() - 0.5) * 3
    y += (Math.random() - 0.5) * 3
    z += (Math.random() - 0.5) * 3

    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z

    const c = new Color().setHSL(
      0.65 + Math.random() * 0.12,
      0.25 + Math.random() * 0.25,
      0.06 + rF * 0.1 + Math.random() * 0.04,
    )
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
  }

  const geo = new BufferGeometry()
  geo.setAttribute("position", new Float32BufferAttribute(pos, 3))
  geo.setAttribute("color", new Float32BufferAttribute(col, 3))
  return geo
}

/* ── Place nodes on brain surface ────────────────────────── */
export function brainSurfacePos(index: number, total: number): Vector3 {
  const golden = (1 + Math.sqrt(5)) / 2
  const theta = (2 * Math.PI * index) / golden
  const phi = Math.acos(1 - 2 * (index + 0.5) / total)
  const ax = 36, ay = 26, az = 32
  return new Vector3(
    ax * Math.sin(phi) * Math.cos(theta),
    ay * Math.cos(phi),
    az * Math.sin(phi) * Math.sin(theta) * (Math.cos(theta) > 0 ? 1.1 : 1),
  )
}

/* ── Node mesh with glow ─────────────────────────────────── */
export function createNodeMesh(
  node: Brain3DNode, position: Vector3,
  palette: Brain3DPalette, showLabels: boolean,
): Group {
  const group = new Group()
  const color = new Color(nodeColor(node, palette))
  const baseR = node.type === "coordinator" ? 1.8 : 1.2
  const r = baseR + Math.min(node.activeTasks ?? 0, 20) * 0.06

  const core = new Mesh(
    new IcosahedronGeometry(r, 3),
    new MeshStandardMaterial({
      color, emissive: color,
      emissiveIntensity: node.status === "active" ? 0.5 : 0.1,
      metalness: 0.3, roughness: 0.4,
    }),
  )
  group.add(core)

  if (node.status === "active") {
    group.add(new Mesh(
      new SphereGeometry(r * 2, 16, 16),
      new MeshBasicMaterial({
        color, transparent: true, opacity: 0.05, blending: AdditiveBlending,
      }),
    ))
    group.add(new PointLight(color.getHex(), 0.5, r * 8))
  }

  if (showLabels) {
    const sprite = new SpriteText(node.label, 1.6, "#ffffff")
    sprite.fontFace = "Inter, system-ui, sans-serif"
    sprite.fontWeight = "600"
    sprite.backgroundColor = "rgba(0,0,0,0.6)"
    sprite.borderRadius = 2
    sprite.padding = 2
    sprite.position.set(0, -(r + 3.5), 0)
    group.add(sprite)
  }

  group.position.copy(position)
  group.userData = { node, radius: r }
  return group
}

/* ── Connection curve ────────────────────────────────────── */
export function createConnectionCurve(
  from: Vector3, to: Vector3, edge: Brain3DEdge,
  palette: Brain3DPalette, srcNode: Brain3DNode,
): { tube: Mesh; curve: CatmullRomCurve3 } {
  const mid = new Vector3().addVectors(from, to).multiplyScalar(0.5)
  mid.multiplyScalar(0.5)
  const curve = new CatmullRomCurve3([from.clone(), mid, to.clone()])
  const thick = 0.12 + (edge.strength ?? 0.5) * 0.22
  const tube = new Mesh(
    new TubeGeometry(curve, 28, thick, 6, false),
    new MeshBasicMaterial({
      color: new Color(nodeColor(srcNode, palette)),
      transparent: true, opacity: edge.active ? 0.3 : 0.06,
    }),
  )
  return { tube, curve }
}

/* ── Traveling particle sphere ───────────────────────────── */
export function createTravelParticle(color: Color): Mesh {
  return new Mesh(
    new SphereGeometry(0.45, 8, 8),
    new MeshBasicMaterial({
      color, transparent: true, opacity: 0.9, blending: AdditiveBlending,
    }),
  )
}
