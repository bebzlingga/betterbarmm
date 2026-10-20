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
const ORDER = ['w-legislation', 'w-budget', 'w-directory', 'w-procurement', 'w-lgu', 'w-election', 'w-incidents', 'w-places', 'w-crafts', 'w-discover']
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
}

export function BrainGlobe({ nodes, edges, lit, edgeLit, picked, onHover, onPick }: Props) {
	const box = useRef<HTMLDivElement>(null)
	const state = useRef({ lit, edgeLit, picked, onHover, onPick })
	// The frame loop reads the latest of these; kept current after every render.
	useEffect(() => {
		state.current = { lit, edgeLit, picked, onHover, onPick }
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
		const atmosphere = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow('rgba(241,196,83,0.18)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
		atmosphere.scale.setScalar(11)
		scene.add(atmosphere)

		const at = place(nodes, edges)

		// Links, each a curve bowed toward the core, with a pulse riding it.
		type Wire = { e: BrainEdge; line: THREE.Line; mat: THREE.LineBasicMaterial; curve: THREE.QuadraticBezierCurve3; pulse?: THREE.Mesh; t: number; speed: number }
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
			const wire: Wire = { e, line, mat, curve, t: (i * 0.137) % 1, speed: 0.12 + ((i * 7) % 5) * 0.03 }
			if (!still && e.kind !== 'join') {
				wire.pulse = new THREE.Mesh(new THREE.SphereGeometry(e.kind === 'reads' ? 0.035 : 0.025, 8, 8), new THREE.MeshBasicMaterial({ color: e.kind === 'reads' ? '#ffd7a0' : '#f1c453', transparent: true }))
				scene.add(wire.pulse)
			}
			wires.push(wire)
		})

		// Nodes: a sphere each, a glow for Jo and the workspaces, a label that follows.
		type Dot = { n: BrainNode; mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; halo?: THREE.Sprite; label: CSS2DObject; el: HTMLDivElement }
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
			el.textContent = n.label
			el.className =
				n.kind === 'jo'
					? 'text-[15px] font-extrabold text-[#3a0f16]'
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
			dots.push({ n, mesh, mat, halo, label, el })
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

		// Flying the camera to a picked node, and back home.
		let flyTo: THREE.Vector3 | null = null
		let flyLook: THREE.Vector3 | null = null
		let lastPicked: string | null = null
		api.current = {
			zoom: (k) => {
				flyTo = camera.position.clone().multiplyScalar(k).clampLength(controls.minDistance, controls.maxDistance)
				flyLook = controls.target.clone()
			},
			reset: () => {
				flyTo = home.clone()
				flyLook = new THREE.Vector3()
			},
			spin: (on) => (controls.autoRotate = on && !still),
		}

		const camDir = new THREE.Vector3()
		const clock = new THREE.Clock()
		let frame = 0
		const tick = () => {
			frame = requestAnimationFrame(tick)
			const dt = clock.getDelta()
			const { lit, edgeLit, picked } = state.current

			if (picked !== lastPicked) {
				lastPicked = picked
				const pos = picked ? at.get(picked) : null
				if (pos && pos.length() > 0.01) {
					flyTo = pos.clone().setLength(pos.length() + 3.2)
					flyLook = pos.clone().multiplyScalar(0.55)
				} else if (picked === 'jo') {
					flyTo = new THREE.Vector3(0, 0.8, 4.2)
					flyLook = new THREE.Vector3()
				}
			}
			if (flyTo && flyLook) {
				camera.position.lerp(flyTo, 0.07)
				controls.target.lerp(flyLook, 0.07)
				if (camera.position.distanceTo(flyTo) < 0.02) flyTo = flyLook = null
			}

			camera.getWorldDirection(camDir)
			for (const d of dots) {
				const on = lit(d.n.id)
				d.mat.opacity = on ? 1 : 0.14
				if (d.halo) d.halo.material.opacity = on ? 1 : 0.1
				// A label on the far side of the globe fades, so the near side reads first.
				const facing = d.mesh.position.clone().sub(camera.position).normalize().dot(camDir)
				const behind = d.mesh.position.clone().normalize().dot(camera.position.clone().normalize()) < -0.25
				d.el.style.opacity = String((on ? 1 : 0.15) * (behind ? 0.35 : 1) * (facing > 0 ? 1 : 0))
				d.el.style.outline = picked === d.n.id ? '1px solid rgba(255,255,255,.8)' : 'none'
			}
			for (const w of wires) {
				const on = edgeLit(w.e)
				w.mat.opacity = on ? (w.e.kind === 'join' ? 0.85 : 0.38) : 0.04
				if (w.pulse) {
					w.t = (w.t + dt * w.speed) % 1
					w.pulse.position.copy(w.curve.getPoint(w.t))
					;(w.pulse.material as THREE.MeshBasicMaterial).opacity = on ? 0.95 : 0.05
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
			<div className='absolute right-2 bottom-2 flex flex-col gap-1.5'>
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
