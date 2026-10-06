'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import { MapControls } from 'three/addons/controls/MapControls.js'

/* ============================================================
   The region in three dimensions

   Every town is its PSA outline extruded into a block. What a block's height
   and colour mean is the layer the reader picked — people, money, the travel
   guide, the 2026 vote — so switching layers is the city rising and falling
   into a new shape rather than a legend changing.

   The SVG path data is already projected (see build_boundaries.py) and is
   absolute M/L/Z only, so it is read here as polygons with no SVG parser.
   Map units are kept as world units: y is flipped so north is up, z is up.

   The camera flies between framings the parent asks for; in between, the
   reader can drag, rotate and zoom it themselves. A click (not a drag) on a
   town or barangay is reported up; the scene holds no navigation state.
   ============================================================ */

export type SceneStyle = { height: number; color: string }
export type SceneFocus =
	| { kind: 'region' }
	| { kind: 'area'; area: string }
	| { kind: 'unit'; key: string }
	| { kind: 'barangay'; key: string; index: number }
export type SceneBarangay = { name: string; d: string | null; color: string }

type Props = {
	units: { key: string; name: string; area: string; d: string }[]
	land: string
	outside: string[]
	styles: Map<string, SceneStyle>
	focus: SceneFocus
	barangays: SceneBarangay[] | null
	reduced: boolean
	onHover: (key: string | null, label: string | null) => void
	onUnit: (key: string) => void
	onBarangay: (index: number) => void
	onBackground: () => void
}

/** Degrees from straight down the camera sits at, per level. */
const TILT = { region: 52, area: 46, unit: 40, barangay: 32 } as const
const FLY_MS = 1300

/* ---- Path data to shapes ---- */

function rings(d: string): THREE.Vector2[][] {
	return d
		.split(/M/)
		.filter(Boolean)
		.map((part) => {
			const n = part.replace(/[LZ]/g, ' ').trim().split(/[\s,]+/).map(Number)
			const pts: THREE.Vector2[] = []
			for (let i = 0; i + 1 < n.length; i += 2) pts.push(new THREE.Vector2(n[i], -n[i + 1]))
			return pts
		})
		.filter((r) => r.length > 2)
}

function inside(p: THREE.Vector2, ring: THREE.Vector2[]) {
	let hit = false
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const a = ring[i]
		const b = ring[j]
		if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) hit = !hit
	}
	return hit
}

/** Rings inside another ring of the same path are holes (Lake Lanao in its shore towns). */
function shapes(d: string): THREE.Shape[] {
	const all = rings(d)
	const holeOf = all.map((r, i) => all.findIndex((o, j) => j !== i && inside(r[0], o)))
	const out = new Map<number, THREE.Shape>()
	all.forEach((r, i) => {
		if (holeOf[i] === -1) out.set(i, new THREE.Shape(r))
	})
	all.forEach((r, i) => {
		const parent = out.get(holeOf[i])
		if (parent) parent.holes.push(new THREE.Path(r))
	})
	return [...out.values()]
}

function outline(d: string, z: number): THREE.BufferGeometry {
	const pts: number[] = []
	for (const r of rings(d)) {
		for (let i = 0; i < r.length; i++) {
			const a = r[i]
			const b = r[(i + 1) % r.length]
			pts.push(a.x, a.y, z, b.x, b.y, z)
		}
	}
	return new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/* ---- Theme ---- */

function palette(el: HTMLElement) {
	const css = getComputedStyle(el)
	const read = (name: string, fallback: string) => {
		const value = css.getPropertyValue(name).trim()
		try {
			return new THREE.Color(value || fallback)
		} catch {
			return new THREE.Color(fallback)
		}
	}
	return { paper: read('--paper', '#ffffff'), paper2: read('--paper-2', '#f7f7f5'), ink: read('--ink', '#191713') }
}

type UnitNode = { mesh: THREE.Mesh; edge: THREE.LineSegments; area: string; h: number; target: SceneStyle; color: THREE.Color }
type BarangayNode = { mesh: THREE.Mesh; edge: THREE.LineSegments; born: number; color: THREE.Color }

export default function MapScene(props: Props) {
	const hostRef = useRef<HTMLDivElement>(null)
	// The render loop reads the latest props through this rather than restarting.
	const live = useRef(props)
	useLayoutEffect(() => {
		live.current = props
	})
	const api = useRef<{
		units: Map<string, UnitNode>
		setBarangays: (list: SceneBarangay[] | null) => void
		fly: (focus: SceneFocus) => void
	} | null>(null)

	/* ---- Build the scene once ---- */
	useEffect(() => {
		const host = hostRef.current!
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = THREE.PCFSoftShadowMap
		host.appendChild(renderer.domElement)
		renderer.domElement.style.touchAction = 'none'

		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(35, 1, 0.5, 20000)
		camera.up.set(0, 0, 1)

		const controls = new MapControls(camera, renderer.domElement)
		controls.enableDamping = true
		controls.dampingFactor = 0.08
		controls.maxPolarAngle = THREE.MathUtils.degToRad(72)
		controls.screenSpacePanning = false
		controls.minDistance = 2
		controls.maxDistance = 4000

		scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8178, 1.6))
		const sun = new THREE.DirectionalLight(0xffffff, 1.6)
		sun.position.set(-300, -500, 900)
		sun.castShadow = true
		sun.shadow.mapSize.set(2048, 2048)
		Object.assign(sun.shadow.camera, { left: -700, right: 700, top: 700, bottom: -700, near: 1, far: 3000 })
		sun.shadow.bias = -0.0005
		scene.add(sun)

		let colors = palette(host)

		/* Land that is not the region: flat, receiving the towns' shadows. */
		const landMat = new THREE.MeshStandardMaterial({ roughness: 1 })
		const ground = new THREE.Group()
		for (const d of [live.current.land, ...live.current.outside]) {
			const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shapes(d)), landMat)
			mesh.receiveShadow = true
			ground.add(mesh)
		}
		scene.add(ground)

		/* The towns. Unit height geometry, scaled in z by the layer. */
		const edgeMat = new THREE.LineBasicMaterial({ transparent: true })
		const units = new Map<string, UnitNode>()
		const towns = new THREE.Group()
		for (const u of live.current.units) {
			const geo = new THREE.ExtrudeGeometry(shapes(u.d), { depth: 1, bevelEnabled: false })
			const mat = new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.02, transparent: true })
			const mesh = new THREE.Mesh(geo, mat)
			mesh.castShadow = true
			mesh.receiveShadow = true
			mesh.userData = { key: u.key, label: u.name }
			mesh.scale.z = 0.001
			const edge = new THREE.LineSegments(outline(u.d, 1.001), edgeMat)
			mesh.add(edge)
			towns.add(mesh)
			const target = live.current.styles.get(u.key) ?? { height: 2, color: '#999' }
			units.set(u.key, { mesh, edge, area: u.area, h: 0.001, target, color: new THREE.Color(target.color) })
		}
		scene.add(towns)

		const applyTheme = () => {
			colors = palette(host)
			landMat.color.copy(colors.paper2).lerp(colors.ink, 0.06)
			edgeMat.color.copy(colors.paper)
		}
		applyTheme()
		const themeWatch = new MutationObserver(applyTheme)
		themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })

		/* Barangays: rebuilt per town, rising out of its top. */
		const brgyGroup = new THREE.Group()
		scene.add(brgyGroup)
		let barangays: BarangayNode[] = []
		const clearBarangays = () => {
			for (const b of barangays) {
				b.mesh.geometry.dispose()
				;(b.mesh.material as THREE.Material).dispose()
				b.edge.geometry.dispose()
			}
			brgyGroup.clear()
			barangays = []
		}
		const brgyEdge = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
		const setBarangays = (list: SceneBarangay[] | null) => {
			clearBarangays()
			if (!list) return
			const now = performance.now()
			list.forEach((b, index) => {
				if (!b.d) return
				const mesh = new THREE.Mesh(
					new THREE.ExtrudeGeometry(shapes(b.d), { depth: 1, bevelEnabled: false }),
					new THREE.MeshStandardMaterial({ roughness: 0.7, color: b.color }),
				)
				mesh.castShadow = true
				mesh.receiveShadow = true
				mesh.scale.z = 0.001
				mesh.userData = { barangay: index, label: b.name }
				const edge = new THREE.LineSegments(outline(b.d, 1.001), brgyEdge)
				mesh.add(edge)
				brgyGroup.add(mesh)
				barangays[index] = { mesh, edge, born: now + 350 + Math.min(index, 60) * 14, color: new THREE.Color(b.color) }
			})
		}

		/* ---- Camera flights ---- */
		let flight: { from: [THREE.Vector3, THREE.Vector3]; to: [THREE.Vector3, THREE.Vector3]; start: number } | null = null

		const boxOf = (focus: SceneFocus) => {
			const box = new THREE.Box3()
			const add = (mesh: THREE.Object3D) => box.expandByObject(mesh)
			if (focus.kind === 'region') units.forEach((n) => add(n.mesh))
			else if (focus.kind === 'area') units.forEach((n) => n.area === focus.area && add(n.mesh))
			else if (focus.kind === 'unit') {
				const n = units.get(focus.key)
				if (n) add(n.mesh)
			} else {
				const b = barangays[focus.index]
				if (b) add(b.mesh)
				else if (units.get(focus.key)) add(units.get(focus.key)!.mesh)
			}
			return box.isEmpty() ? null : box
		}

		const fly = (focus: SceneFocus) => {
			const box = boxOf(focus)
			if (!box) return
			const center = box.getCenter(new THREE.Vector3())
			const size = box.getSize(new THREE.Vector3())
			const aspect = camera.aspect || 1
			const vfov = THREE.MathUtils.degToRad(camera.fov)
			const fitH = size.y / 2 / Math.tan(vfov / 2)
			const fitW = size.x / 2 / (Math.tan(vfov / 2) * aspect)
			const pad = focus.kind === 'barangay' ? 2.4 : focus.kind === 'region' ? 1.05 : 1.35
			const distance = Math.max(fitH, fitW, focus.kind === 'barangay' ? 6 : 12) * pad
			const tilt = THREE.MathUtils.degToRad(live.current.reduced ? 0.01 : TILT[focus.kind])
			center.z = focus.kind === 'region' ? 0 : center.z * 0.5
			const position = center.clone().add(new THREE.Vector3(0, -Math.sin(tilt), Math.cos(tilt)).multiplyScalar(distance))
			if (live.current.reduced) {
				camera.position.copy(position)
				controls.target.copy(center)
				return
			}
			flight = {
				from: [camera.position.clone(), controls.target.clone()],
				to: [position, center],
				start: performance.now(),
			}
		}

		api.current = { units, setBarangays, fly }

		/* ---- Pointer ---- */
		const ray = new THREE.Raycaster()
		const pointer = new THREE.Vector2()
		let moved = true
		let pointerIn = false
		let down: { x: number; y: number } | null = null
		let hovered: THREE.Object3D | null = null

		const pick = () => {
			ray.setFromCamera(pointer, camera)
			const targets = barangays.length ? brgyGroup.children : towns.children
			return ray.intersectObjects(targets, false)[0]?.object ?? null
		}
		const onMove = (event: PointerEvent) => {
			const rect = renderer.domElement.getBoundingClientRect()
			pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
			moved = true
			pointerIn = true
		}
		const onLeave = () => {
			pointerIn = false
			moved = true
		}
		const onDown = (event: PointerEvent) => (down = { x: event.clientX, y: event.clientY })
		const onUp = (event: PointerEvent) => {
			if (!down || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) return
			down = null
			const hit = pick()
			if (!hit) return live.current.onBackground()
			if (hit.userData.barangay != null) live.current.onBarangay(hit.userData.barangay)
			else if (hit.userData.key) {
				const focus = live.current.focus
				// Inside a town, the other towns are scenery; a click there flies out first.
				if ((focus.kind === 'unit' || focus.kind === 'barangay') && focus.key !== hit.userData.key) live.current.onUnit(hit.userData.key)
				else if (focus.kind !== 'unit' && focus.kind !== 'barangay') live.current.onUnit(hit.userData.key)
			}
		}
		const el = renderer.domElement
		el.addEventListener('pointermove', onMove)
		el.addEventListener('pointerleave', onLeave)
		el.addEventListener('pointerdown', onDown)
		el.addEventListener('pointerup', onUp)

		/* ---- Size ---- */
		const resize = () => {
			const { clientWidth: w, clientHeight: h } = host
			if (!w || !h) return
			renderer.setSize(w, h, false)
			renderer.domElement.style.width = `${w}px`
			renderer.domElement.style.height = `${h}px`
			camera.aspect = w / h
			camera.updateProjectionMatrix()
		}
		const sizeWatch = new ResizeObserver(resize)
		sizeWatch.observe(host)
		resize()

		/* ---- The loop ---- */
		let frame = 0
		let last = performance.now()
		let first = true
		const tmp = new THREE.Color()
		const loop = (now: number) => {
			frame = requestAnimationFrame(loop)
			const dt = Math.min(0.25, (now - last) / 1000)
			last = now
			const k = live.current.reduced ? 1 : 1 - Math.exp(-dt * 5)
			const focus = live.current.focus
			const inTown = focus.kind === 'unit' || focus.kind === 'barangay'
			const focusKey = inTown ? focus.key : null
			const focusArea = focus.kind === 'area' ? focus.area : null

			units.forEach((n, key) => {
				n.target = live.current.styles.get(key) ?? n.target
				const isHover = hovered === n.mesh
				// Hover glows rather than rises: a block that grows under the cursor can
				// shift the hit to its neighbour, and the two then trade the hover.
				n.h += (n.target.height - n.h) * k
				n.mesh.scale.z = Math.max(0.001, n.h)
				n.color.lerp(tmp.set(n.target.color), k)
				const mat = n.mesh.material as THREE.MeshStandardMaterial
				mat.color.copy(n.color)
				mat.emissive.copy(n.color).multiplyScalar(isHover && !inTown ? 0.35 : 0)
				const dim = (focusArea && n.area !== focusArea) || (focusKey && key !== focusKey)
				const opacity = key === focusKey && barangays.length ? 0.15 : dim ? 0.22 : 1
				mat.opacity += (opacity - mat.opacity) * k
				mat.depthWrite = mat.opacity > 0.5
				n.mesh.castShadow = mat.opacity > 0.5
			})
			edgeMat.opacity = 0.9

			// Barangays sit on the town's current top and rise in one after another.
			const host = focusKey ? units.get(focusKey) : null
			brgyGroup.position.z = host ? host.h + 0.02 : 0
			barangays.forEach((b, index) => {
				if (!b) return
				const selected = focus.kind === 'barangay' && focus.index === index
				const isHover = hovered === b.mesh
				const grown = live.current.reduced || now > b.born
				const want = grown ? (selected ? 2.2 : 0.6) : 0.001
				b.mesh.scale.z += (want - b.mesh.scale.z) * k
				const mat = b.mesh.material as THREE.MeshStandardMaterial
				mat.emissive.copy(b.color).multiplyScalar(selected ? 0.35 : isHover ? 0.2 : 0)
			})

			if (flight) {
				const t = Math.min(1, (now - flight.start) / FLY_MS)
				const e = ease(t)
				camera.position.lerpVectors(flight.from[0], flight.to[0], e)
				controls.target.lerpVectors(flight.from[1], flight.to[1], e)
				if (t === 1) flight = null
			}
			controls.enabled = !flight
			controls.update()

			if (moved || flight) {
				moved = false
				const hit = pointerIn ? pick() : null
				if (hit !== hovered) {
					hovered = hit
					el.style.cursor = hit ? 'pointer' : 'grab'
					live.current.onHover(hit?.userData.key ?? (hit ? `b-${hit.userData.barangay}` : null), hit?.userData.label ?? null)
				}
			}

			if (first) {
				first = false
				fly(live.current.focus)
				if (flight) {
					// The opening shot: from high overhead, settling onto the table.
					const f = flight as NonNullable<typeof flight>
					f.from = [f.to[1].clone().add(new THREE.Vector3(0, -50, 1800)), f.to[1].clone()]
				}
			}
			renderer.render(scene, camera)
		}
		frame = requestAnimationFrame(loop)

		return () => {
			cancelAnimationFrame(frame)
			sizeWatch.disconnect()
			themeWatch.disconnect()
			el.removeEventListener('pointermove', onMove)
			el.removeEventListener('pointerleave', onLeave)
			el.removeEventListener('pointerdown', onDown)
			el.removeEventListener('pointerup', onUp)
			clearBarangays()
			controls.dispose()
			scene.traverse((obj) => {
				if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
					obj.geometry.dispose()
					const m = obj.material as THREE.Material | THREE.Material[]
					;(Array.isArray(m) ? m : [m]).forEach((one) => one.dispose())
				}
			})
			renderer.dispose()
			host.removeChild(renderer.domElement)
			api.current = null
		}
		// Built once; everything after reads `live`.
	}, [])

	/* ---- Follow the parent ---- */
	useEffect(() => {
		api.current?.setBarangays(props.barangays)
	}, [props.barangays])

	const focusId =
		props.focus.kind === 'region'
			? 'region'
			: props.focus.kind === 'area'
				? `a:${props.focus.area}`
				: props.focus.kind === 'unit'
					? `u:${props.focus.key}`
					: `b:${props.focus.key}:${props.focus.index}`
	useEffect(() => {
		// A frame later, so a barangay mesh built this render has a size to frame.
		const id = requestAnimationFrame(() => api.current?.fly(live.current.focus))
		return () => cancelAnimationFrame(id)
	}, [focusId])

	return <div ref={hostRef} className='absolute inset-0 cursor-grab' />
}
