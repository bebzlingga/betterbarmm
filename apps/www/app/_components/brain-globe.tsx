'use client'

import { ArrowsInIcon, MinusIcon, PauseIcon, PlayIcon, PlusIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'
import type { BrainEdge, BrainNode } from '../_lib/brain'

/* ============================================================
   The brain as a globe

   Jo glows at the core; the workspaces orbit on an inner shell, the
   datasets on a middle one, the sources on the outer, glass shell.
   Links arc between the shells and pulses run inward along them.
   Drag to turn it, scroll or pinch to zoom, click a node to fly to
   it. It turns by itself while left alone, unless the reader has
   asked for less motion.

   The left column owns the state (what is hovered, picked, lit);
   this only draws it, and reads it through refs every frame so a
   hover never rebuilds the scene.
   ============================================================ */

const SHELL = { jo: 0, workspace: 1.85, dataset: 2.95, source: 3.95 } as const

/** Phosphor's filled brain, drawn at the centre in place of Jo's name (labels are plain DOM, not React). */
const BRAIN =
	'<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M212,76V72a44,44,0,0,0-74.86-31.31,3.93,3.93,0,0,0-1.14,2.8v88.72a4,4,0,0,0,6.2,3.33A47.67,47.67,0,0,1,167.68,128a8.18,8.18,0,0,1,8.31,7.58,8,8,0,0,1-8,8.42,32,32,0,0,0-32,32v33.88a4,4,0,0,0,1.49,3.12,47.92,47.92,0,0,0,74.21-17.16,4,4,0,0,0-4.49-5.56A68.06,68.06,0,0,1,192,192h-7.73a8.18,8.18,0,0,1-8.25-7.47,8,8,0,0,1,8-8.53h8a51.6,51.6,0,0,0,24-5.88v0A52,52,0,0,0,212,76Zm-12,36h-4a36,36,0,0,1-36-36V72a8,8,0,0,1,16,0v4a20,20,0,0,0,20,20h4a8,8,0,0,1,0,16ZM88,28A44.05,44.05,0,0,0,44,72v4a52,52,0,0,0-4,94.12h0A51.6,51.6,0,0,0,64,176h7.73A8.18,8.18,0,0,1,80,183.47,8,8,0,0,1,72,192H64a67.48,67.48,0,0,1-15.21-1.73,4,4,0,0,0-4.5,5.55A47.93,47.93,0,0,0,118.51,213a4,4,0,0,0,1.49-3.12V176a32,32,0,0,0-32-32,8,8,0,0,1-8-8.42A8.18,8.18,0,0,1,88.32,128a47.67,47.67,0,0,1,25.48,7.54,4,4,0,0,0,6.2-3.33V43.49a4,4,0,0,0-1.14-2.81A43.85,43.85,0,0,0,88,28Zm8,48a36,36,0,0,1-36,36H56a8,8,0,0,1,0-16h4A20,20,0,0,0,80,76V72a8,8,0,0,1,16,0Z"/></svg>'
const ORDER = ['w-legislation', 'w-budget', 'w-directory', 'w-services', 'w-procurement', 'w-lgu', 'w-election', 'w-incidents', 'w-places', 'w-crafts', 'w-discover']
const COLOR = { jo: '#ffe9b0', workspace: '#d8343f', dataset: '#e8b043', source: '#86b3b4' }
const SIZE = { jo: 0.32, workspace: 0.13, dataset: 0.085, source: 0.06 }
const EDGE = { feeds: '#d9b77a', reads: '#ee8b90', join: '#f1c453' }

const mean = (as: number[]) => Math.atan2(as.reduce((s, a) => s + Math.sin(a), 0), as.reduce((s, a) => s + Math.cos(a), 0))

/** Longitude from what each node feeds, as on the flat map; latitude spread so a shell reads as a sphere. */
function place(nodes: BrainNode[], edges: BrainEdge[]): Map<string, THREE.Vector3> {
	const lon = new Map<string, number>()
	const at = new Map<string, THREE.Vector3>()
	const put = (id: string, kind: keyof typeof SHELL, a: number, lat: number) => {
		lon.set(id, a)
		const r = SHELL[kind]
		at.set(id, new THREE.Vector3(r * Math.cos(lat) * Math.cos(a), r * Math.sin(lat), r * Math.cos(lat) * Math.sin(a)))
	}
	ORDER.forEach((id, i) => put(id, 'workspace', (i / ORDER.length) * Math.PI * 2, (i % 2 ? 1 : -1) * 0.38))
	at.set('jo', new THREE.Vector3())
	for (const [kind, lats] of [
		['dataset', [-0.55, 0.05, 0.6]],
		['source', [0.75, -0.3, 0.25, -0.8]],
	] as const) {
		const ring = nodes.filter((n) => n.kind === kind)
		const wanted = ring.map((n) => {
			const targets = edges.filter((e) => e.from === n.id && lon.has(e.to)).map((e) => lon.get(e.to)!)
			const a = targets.length ? mean(targets) : 0
			return { n, a: ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) }
		})
		wanted.sort((p, q) => p.a - q.a)
		wanted.forEach(({ n }, i) => put(n.id, kind, ((i + 0.5) / wanted.length) * Math.PI * 2, lats[i % lats.length]!))
	}
	return at
}

/** A soft round glow, drawn once on a canvas. */
function glow(color: string): THREE.Texture {
	const c = document.createElement('canvas')
	c.width = c.height = 128
	const g = c.getContext('2d')!
	const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
	r.addColorStop(0, color)
	r.addColorStop(1, 'rgba(0,0,0,0)')
	g.fillStyle = r
	g.fillRect(0, 0, 128, 128)
	return new THREE.CanvasTexture(c)
}

type Props = {
	nodes: BrainNode[]
	edges: BrainEdge[]
	lit: (id: string) => boolean
	edgeLit: (e: BrainEdge) => boolean
	picked: string | null
	onHover: (id: string | null) => void
	onPick: (id: string | null) => void
	/** Drawn above the zoom buttons: the 3D / 2D switch. */
	toolbar?: React.ReactNode
	/** Everything a pick reaches; the camera fits it on screen. */
	chain?: Set<string> | null
}

export function BrainGlobe({ nodes, edges, lit, edgeLit, picked, onHover, onPick, toolbar, chain }: Props) {
	const box = useRef<HTMLDivElement>(null)
	const state = useRef({ lit, edgeLit, picked, onHover, onPick, chain })
	// The frame loop reads the latest of these; kept current after every render.
	useEffect(() => {
		state.current = { lit, edgeLit, picked, onHover, onPick, chain }
	})
	const api = useRef<{ zoom: (k: number) => void; reset: () => void; spin: (on: boolean) => void } | null>(null)
	const [spinning, setSpinning] = useState(true)

	useEffect(() => {
		const host = box.current!
		const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		const w = () => host.clientWidth
		const h = () => host.clientHeight

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(45, w() / h(), 0.1, 100)
		const home = new THREE.Vector3(0, 2.2, 10.5)
		camera.position.copy(home)

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		renderer.setSize(w(), h())
		host.appendChild(renderer.domElement)
		const labels = new CSS2DRenderer()
		labels.setSize(w(), h())
		Object.assign(labels.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' })
		host.appendChild(labels.domElement)

		const controls = new OrbitControls(camera, renderer.domElement)
		controls.enableDamping = true
		controls.dampingFactor = 0.08
		controls.minDistance = 2.5
		controls.maxDistance = 18
		controls.enablePan = false
		controls.autoRotate = !still
		controls.autoRotateSpeed = 0.55

		// The glass globe: a faint graticule on the outer shell and a fainter one inside.
		for (const [r, o] of [
			[SHELL.source + 0.05, 0.07],
			[SHELL.dataset, 0.035],
		] as const) {
			const grid = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(r, 36, 18)), new THREE.LineBasicMaterial({ color: '#f3d9a8', transparent: true, opacity: o }))
			scene.add(grid)
		}

		const at = place(nodes, edges)

		// Links, each a curve bowed toward the core, with a pulse riding it.
		type Wire = { e: BrainEdge; line: THREE.Line; mat: THREE.LineBasicMaterial; curve: THREE.QuadraticBezierCurve3; pulse?: THREE.Mesh; tail: THREE.Mesh[]; t: number; speed: number; count: number }
		const wires: Wire[] = []
		edges.forEach((e, i) => {
			const p = at.get(e.from)
			const q = at.get(e.to)
			if (!p || !q) return
			const mid = p.clone().add(q).multiplyScalar(0.5).multiplyScalar(e.kind === 'join' ? 0.55 : 0.82)
			const curve = new THREE.QuadraticBezierCurve3(p, mid, q)
			const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40))
			const mat =
				e.kind === 'join'
					? new THREE.LineDashedMaterial({ color: EDGE.join, dashSize: 0.08, gapSize: 0.06, transparent: true, opacity: 0.85 })
					: new THREE.LineBasicMaterial({ color: EDGE[e.kind], transparent: true, opacity: 0.35 })
			const line = new THREE.Line(geo, mat)
			if (e.kind === 'join') line.computeLineDistances()
			scene.add(line)
			mat.opacity = still ? mat.opacity : 0
			if (!still) geo.setDrawRange(0, 0)
			const wire: Wire = { e, line, mat, curve, tail: [], t: (i * 0.137) % 1, speed: 0.12 + ((i * 7) % 5) * 0.03, count: 41 }
			if (!still && e.kind !== 'join') {
				// A comet: a bright head and a short tail of fading beads behind it.
				const color = e.kind === 'reads' ? '#ffd7a0' : '#f1c453'
				const size = e.kind === 'reads' ? 0.035 : 0.025
				wire.pulse = new THREE.Mesh(new THREE.SphereGeometry(size, 10, 10), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }))
				scene.add(wire.pulse)
				for (let k = 1; k <= 4; k++) {
					const bead = new THREE.Mesh(new THREE.SphereGeometry(size * (1 - k * 0.17), 6, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }))
					scene.add(bead)
					wire.tail.push(bead)
				}
			}
			wires.push(wire)
		})

		// Nodes: a sphere each, a glow for Jo and the workspaces, a label that follows.
		type Dot = { n: BrainNode; mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; halo?: THREE.Sprite; haloSize: number; label: CSS2DObject; el: HTMLDivElement; home: THREE.Vector3; born: number; size: number }
		const dots: Dot[] = []
		const hits: THREE.Mesh[] = []
		for (const n of nodes) {
			const pos = at.get(n.id)
			if (!pos) continue
			const r = n.kind === 'dataset' && n.count ? Math.min(0.16, SIZE.dataset + Math.log10(n.count) * 0.012) : SIZE[n.kind]
			// Drawn over the glass and the links, so the graticule never stripes a node.
			const mat = new THREE.MeshBasicMaterial({ color: COLOR[n.kind], transparent: true, depthTest: false })
			const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), mat)
			mesh.renderOrder = 10
			mesh.position.copy(pos)
			mesh.userData.id = n.id
			scene.add(mesh)
			// A larger invisible sphere to hit, so a small node is easy to point at.
			const hit = new THREE.Mesh(new THREE.SphereGeometry(Math.max(r * 2.2, 0.16), 8, 8), new THREE.MeshBasicMaterial({ visible: false }))
			hit.position.copy(pos)
			hit.userData.id = n.id
			scene.add(hit)
			hits.push(hit)
			let halo: THREE.Sprite | undefined
			if (n.kind === 'jo' || n.kind === 'workspace') {
				halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(n.kind === 'jo' ? 'rgba(255,214,120,0.9)' : 'rgba(216,52,63,0.55)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
				halo.scale.setScalar(n.kind === 'jo' ? 1.9 : 0.75)
				halo.position.copy(pos)
				scene.add(halo)
			}
			const el = document.createElement('div')
			if (n.kind === 'jo') el.innerHTML = BRAIN
			else el.textContent = n.label
			el.className =
				n.kind === 'jo'
					? 'size-6 text-[#3a0f16]'
					: n.kind === 'workspace'
						? 'mt-7 text-[13px] font-bold text-white [text-shadow:0_1px_4px_rgba(0,0,0,.8)]'
						: n.kind === 'dataset'
							? 'mt-5 text-[11px] text-[#f3dcae] [text-shadow:0_1px_3px_rgba(0,0,0,.8)]'
							: 'mt-4 text-[10.5px] text-[#a9c6c6] [text-shadow:0_1px_3px_rgba(0,0,0,.8)]'
			el.style.whiteSpace = 'nowrap'
			el.style.transition = 'opacity .25s'
			const label = new CSS2DObject(el)
			label.position.copy(pos)
			scene.add(label)
			// Born from the core outward, ring by ring, a little apart within each ring.
			const born = { jo: 0, workspace: 0.18, dataset: 0.45, source: 0.72 }[n.kind] + (dots.length % 9) * 0.035
			dots.push({ n, mesh, mat, halo, haloSize: halo ? halo.scale.x : 0, label, el, home: pos.clone(), born, size: 1 })
		}

		// Pointing and picking. A press that moved is a turn of the globe, not a click.
		const ray = new THREE.Raycaster()
		const pointer = new THREE.Vector2()
		let down: { x: number; y: number } | null = null
		let hovered: string | null = null
		const aim = (ev: PointerEvent) => {
			const r = renderer.domElement.getBoundingClientRect()
			pointer.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
			ray.setFromCamera(pointer, camera)
			return (ray.intersectObjects(hits)[0]?.object.userData.id as string | undefined) ?? null
		}
		const move = (ev: PointerEvent) => {
			const id = aim(ev)
			if (id !== hovered) {
				hovered = id
				state.current.onHover(id)
				renderer.domElement.style.cursor = id ? 'pointer' : 'grab'
			}
		}
		const press = (ev: PointerEvent) => (down = { x: ev.clientX, y: ev.clientY })
		const release = (ev: PointerEvent) => {
			if (!down || Math.hypot(ev.clientX - down.x, ev.clientY - down.y) > 5) return
			state.current.onPick(aim(ev))
		}
		const leave = () => {
			hovered = null
			state.current.onHover(null)
		}
		renderer.domElement.addEventListener('pointermove', move)
		renderer.domElement.addEventListener('pointerdown', press)
		renderer.domElement.addEventListener('pointerup', release)
		renderer.domElement.addEventListener('pointerleave', leave)
		renderer.domElement.style.cursor = 'grab'

		/* The camera's two motions. A flight (to frame a pick, or home) eases the
		   camera and its target toward a goal; a zoom eases only the distance.
		   Either gives way the moment the reader drags, scrolls or pinches, and a
		   flight gives up after a moment, so neither ever fights the hand. */
		const clock = new THREE.Clock()
		let flyTo: THREE.Vector3 | null = null
		let flyLook: THREE.Vector3 | null = null
		let flyUntil = 0
		let zoomTo: number | null = null
		let lastPicked: string | null = null
		const fly = (to: THREE.Vector3, look: THREE.Vector3) => {
			flyTo = to
			flyLook = look
			flyUntil = clock.elapsedTime + 1.6
			zoomTo = null
		}
		const land = () => {
			flyTo = flyLook = null
		}
		controls.addEventListener('start', land)
		const clampDist = (d: number) => Math.min(controls.maxDistance, Math.max(controls.minDistance, d))
		// The wheel (and a trackpad's pinch, which arrives as one) zooms by how far it turned.
		const wheel = (e: WheelEvent) => {
			e.preventDefault()
			e.stopPropagation()
			land()
			const delta = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY
			const from = zoomTo ?? camera.position.distanceTo(controls.target)
			zoomTo = clampDist(from * Math.exp(Math.max(-120, Math.min(120, delta)) * 0.0016))
		}
		host.addEventListener('wheel', wheel, { passive: false, capture: true })

		/** Fit a set of nodes on screen, labels and all. The camera always looks at the globe's centre,
		 *  so the globe still turns about itself afterwards; only the angle it is seen from and the
		 *  distance change. */
		const frame3d = (ids: string[]) => {
			const pts = ids.map((id) => at.get(id)).filter(Boolean) as THREE.Vector3[]
			if (!pts.length) return
			const centre = pts.reduce((c, p) => c.add(p), new THREE.Vector3()).multiplyScalar(1 / pts.length)
			const dir = centre.length() > 0.3 ? centre.normalize() : camera.position.clone().normalize()
			const v = THREE.MathUtils.degToRad(camera.fov) / 2
			const reach = Math.tan(Math.min(v, Math.atan(Math.tan(v) * camera.aspect))) * 0.86
			// Far enough back that every point, with room for its label, sits inside the view cone.
			let dist = controls.minDistance
			for (const p of pts) {
				const along = p.dot(dir)
				const across = p.clone().sub(dir.clone().multiplyScalar(along)).length() + 0.45
				dist = Math.max(dist, along + across / reach)
			}
			fly(dir.clone().multiplyScalar(clampDist(dist)), new THREE.Vector3())
		}

		api.current = {
			zoom: (k) => {
				land()
				zoomTo = clampDist((zoomTo ?? camera.position.distanceTo(controls.target)) * k)
			},
			reset: () => fly(home.clone(), new THREE.Vector3()),
			spin: (on) => (controls.autoRotate = on && !still),
		}

		const camDir = new THREE.Vector3()
		let frame = 0
		const tick = () => {
			frame = requestAnimationFrame(tick)
			const dt = clock.getDelta()
			const { lit, edgeLit, picked, chain } = state.current

			if (picked !== lastPicked) {
				lastPicked = picked
				if (picked) frame3d(chain?.size ? [...chain] : [picked])
			}
			if (flyTo && flyLook) {
				const k = 1 - Math.exp(-dt * 4.5)
				camera.position.lerp(flyTo, k)
				controls.target.lerp(flyLook, k)
				if (camera.position.distanceTo(flyTo) < 0.03 || clock.elapsedTime > flyUntil) land()
			}
			if (zoomTo !== null) {
				const offset = camera.position.clone().sub(controls.target)
				const d = offset.length()
				const next = d + (zoomTo - d) * (1 - Math.exp(-dt * 10))
				camera.position.copy(controls.target).add(offset.setLength(next))
				if (Math.abs(next - zoomTo) < 0.01) zoomTo = null
			}

			camera.getWorldDirection(camDir)
			const age = still ? 99 : clock.elapsedTime
			const ease = (u: number) => 1 - (1 - Math.min(1, Math.max(0, u))) ** 3
			const smooth = Math.min(1, dt * 9)
			const grown = new Map<string, number>()
			for (const d of dots) {
				const on = lit(d.n.id)
				// Growing out of Jo when the dialog opens.
				const g = ease((age - d.born) / 1.1)
				grown.set(d.n.id, g)
				const at = d.home.clone().multiplyScalar(g)
				d.mesh.position.copy(at)
				d.label.position.copy(at)
				// Swell under the pointer; a picked node breathes.
				const target = d.n.id === hovered ? 1.6 : picked === d.n.id ? 1.4 + Math.sin(age * 4) * 0.12 : 1
				d.size += (target - d.size) * Math.min(1, dt * 12)
				const breath = d.n.kind === 'jo' && !still ? 1 + Math.sin(age * 1.6) * 0.04 : 1
				d.mesh.scale.setScalar(Math.max(0.001, g * d.size * breath))
				d.mat.opacity += ((on ? 1 : 0.14) - d.mat.opacity) * smooth
				if (d.halo) {
					d.halo.position.copy(at)
					const pulse = d.n.kind === 'jo' && !still ? 1 + Math.sin(age * 1.6) * 0.09 : 1
					d.halo.scale.setScalar(d.haloSize * g * pulse * (d.n.id === hovered ? 1.25 : 1))
					d.halo.material.opacity += ((on ? 1 : 0.1) - d.halo.material.opacity) * smooth
				}
				// A label on the far side of the globe fades, so the near side reads first.
				const facing = at.clone().sub(camera.position).normalize().dot(camDir)
				const behind = at.clone().normalize().dot(camera.position.clone().normalize()) < -0.25
				d.el.style.opacity = String(g * (on ? 1 : 0.15) * (behind ? 0.35 : 1) * (facing > 0 ? 1 : 0))
			}
			for (const w of wires) {
				const on = edgeLit(w.e)
				// A link draws itself from its source once both its ends have grown.
				const g = Math.min(grown.get(w.e.from) ?? 1, grown.get(w.e.to) ?? 1)
				const drawn = still ? 1 : ease((g - 0.6) / 0.4)
				w.line.geometry.setDrawRange(0, Math.ceil(w.count * drawn))
				const want = (on ? (w.e.kind === 'join' ? 0.85 : 0.38) : 0.04) * drawn
				w.mat.opacity += (want - w.mat.opacity) * smooth
				if (w.pulse) {
					w.t = (w.t + dt * w.speed) % 1
					const bright = (on ? 0.95 : 0.05) * (drawn >= 1 ? 1 : 0)
					w.pulse.position.copy(w.curve.getPoint(w.t))
					;(w.pulse.material as THREE.MeshBasicMaterial).opacity = bright
					w.tail.forEach((bead, k) => {
						bead.position.copy(w.curve.getPoint(Math.max(0, w.t - (k + 1) * 0.018)))
						;(bead.material as THREE.MeshBasicMaterial).opacity = w.t > (k + 1) * 0.018 ? bright * (0.55 - k * 0.12) : 0
					})
				}
			}
			controls.update()
			renderer.render(scene, camera)
			labels.render(scene, camera)
		}
		tick()

		const fit = new ResizeObserver(() => {
			camera.aspect = w() / h()
			camera.updateProjectionMatrix()
			renderer.setSize(w(), h())
			labels.setSize(w(), h())
		})
		fit.observe(host)

		return () => {
			cancelAnimationFrame(frame)
			fit.disconnect()
			controls.removeEventListener('start', land)
			host.removeEventListener('wheel', wheel, { capture: true })
			controls.dispose()
			renderer.domElement.removeEventListener('pointermove', move)
			renderer.domElement.removeEventListener('pointerdown', press)
			renderer.domElement.removeEventListener('pointerup', release)
			renderer.domElement.removeEventListener('pointerleave', leave)
			scene.traverse((o) => {
				const m = o as THREE.Mesh
				m.geometry?.dispose()
				const mat = m.material as THREE.Material | THREE.Material[] | undefined
				if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
				else mat?.dispose()
			})
			renderer.dispose()
			host.replaceChildren()
			api.current = null
		}
	}, [nodes, edges])

	const button = 'flex size-9 items-center justify-center border border-white/20 bg-black/30 text-white/85 backdrop-blur transition hover:border-white hover:text-white'
	return (
		<div className='relative h-full min-h-[60vh] w-full lg:min-h-0'>
			<div ref={box} className='absolute inset-0 overflow-hidden' aria-label='A globe of BetterBARMM: drag to turn it, scroll to zoom, click a node for its details' role='img' />
			<div className='absolute right-4 bottom-4 flex flex-col gap-1.5'>
				{toolbar}
				<button type='button' className={button} aria-label='Zoom in' onClick={() => api.current?.zoom(0.75)}>
					<PlusIcon size={16} weight='bold' />
				</button>
				<button type='button' className={button} aria-label='Zoom out' onClick={() => api.current?.zoom(1.33)}>
					<MinusIcon size={16} weight='bold' />
				</button>
				<button type='button' className={button} aria-label='Reset the view' onClick={() => (api.current?.reset(), onPick(null))}>
					<ArrowsInIcon size={16} weight='bold' />
				</button>
				<button
					type='button'
					className={button}
					aria-label={spinning ? 'Stop turning' : 'Turn by itself'}
					onClick={() => {
						api.current?.spin(!spinning)
						setSpinning(!spinning)
					}}
				>
					{spinning ? <PauseIcon size={16} weight='bold' /> : <PlayIcon size={16} weight='bold' />}
				</button>
			</div>
		</div>
	)
}
