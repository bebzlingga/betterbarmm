'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import type { CraftModel, Pattern } from '../_lib/crafts'

/* ============================================================
   A craft in three dimensions

   No model files: every object is drawn here from a few numbers. Brass
   and gongs are lathed from a profile, the way they are cast and turned;
   cloth is a plane folded by sines and painted with its pattern on a
   canvas. They are studies of the form, not scans of one piece, and the
   page says so beside them. The reader can turn the object; it turns
   slowly by itself unless they prefer reduced motion.
   ============================================================ */

const BRASS = { color: 0xc89b4a, metalness: 1, roughness: 0.32 }

/* ---- Patterns, painted once per textile ---- */

function paint(p: Pattern, size = 1024): THREE.CanvasTexture {
	const c = document.createElement('canvas')
	c.width = c.height = size
	const g = c.getContext('2d')!
	const [base, a, b = a, d = b] = p.colors
	g.fillStyle = base!
	g.fillRect(0, 0, size, size)
	const s = size / 16
	if (p.style === 'plaid') {
		// Inaul: wide bands crossing, with fine threads between.
		g.globalAlpha = 0.55
		for (let i = 0; i < 16; i += 4) {
			g.fillStyle = a!
			g.fillRect(i * s, 0, s * 1.4, size)
			g.fillRect(0, i * s, size, s * 1.4)
		}
		g.globalAlpha = 0.9
		g.fillStyle = b!
		for (let i = 2; i < 16; i += 4) {
			g.fillRect(i * s, 0, s * 0.18, size)
			g.fillRect(0, i * s, size, s * 0.18)
		}
		g.fillStyle = d!
		for (let i = 0; i < 16; i += 4) g.fillRect(0, (i + 3) * s, size, s * 0.1)
	} else if (p.style === 'diamond') {
		// Yakan and Sama: nested diamonds in rows, a band between rows.
		for (let row = 0; row < 4; row++) {
			const y = row * s * 4 + s * 2
			g.fillStyle = d!
			g.fillRect(0, row * s * 4, size, s * 0.35)
			for (let col = 0; col < 8; col++) {
				const x = col * s * 2 + s
				;[1.7, 1.1, 0.5].forEach((r, i) => {
					g.fillStyle = [a, b, d][i]!
					g.beginPath()
					g.moveTo(x, y - r * s)
					g.lineTo(x + r * s * 0.9, y)
					g.lineTo(x, y + r * s)
					g.lineTo(x - r * s * 0.9, y)
					g.closePath()
					g.fill()
				})
			}
		}
	} else {
		// Landap: a plain ground with one band of small motifs, the langkit.
		g.fillStyle = a!
		g.fillRect(0, s * 6, size, s * 3)
		g.fillStyle = b!
		g.fillRect(0, s * 6.3, size, s * 0.25)
		g.fillRect(0, s * 8.45, size, s * 0.25)
		g.fillStyle = d!
		for (let x = 0; x < size; x += s) {
			g.beginPath()
			g.moveTo(x + s / 2, s * 6.8)
			g.lineTo(x + s * 0.9, s * 7.5)
			g.lineTo(x + s / 2, s * 8.2)
			g.lineTo(x + s * 0.1, s * 7.5)
			g.closePath()
			g.fill()
		}
	}
	// A weave: faint lines across both ways, so it reads as thread rather than print.
	g.globalAlpha = 0.08
	g.fillStyle = '#000'
	for (let i = 0; i < size; i += 4) {
		g.fillRect(i, 0, 1, size)
		g.fillRect(0, i, size, 1)
	}
	const t = new THREE.CanvasTexture(c)
	t.colorSpace = THREE.SRGBColorSpace
	t.anisotropy = 8
	return t
}

const cloth = (p: Pattern) => new THREE.MeshStandardMaterial({ map: paint(p), roughness: 0.85, side: THREE.DoubleSide })

/* ---- The objects ---- */

/** Points of a profile as [radius, height]; the lathe turns them into a solid. */
const lathe = (pts: [number, number][], mat: THREE.Material, segments = 96) =>
	new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), segments), mat)

/** A cloth hung from a rod, folding more toward its hem. */
function hanging(p: Pattern) {
	const geo = new THREE.PlaneGeometry(1.7, 2.2, 80, 80)
	const pos = geo.attributes.position!
	for (let i = 0; i < pos.count; i++) {
		const x = pos.getX(i)
		const fall = (1.1 - pos.getY(i)) / 2.2
		pos.setZ(i, Math.sin(x * 9) * 0.07 * (0.3 + fall) + Math.sin(x * 3.1 + 1) * 0.05 * fall)
		pos.setX(i, x * (1 - 0.06 * fall))
	}
	geo.computeVertexNormals()
	const group = new THREE.Group()
	group.add(new THREE.Mesh(geo, cloth(p)))
	const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.1, 24), new THREE.MeshStandardMaterial({ color: 0x8a6a3e, roughness: 0.6 }))
	rod.rotation.z = Math.PI / 2
	rod.position.y = 1.12
	group.add(rod)
	return group
}

/** A malong: a tube of cloth standing, its folds running down. */
function tube(p: Pattern) {
	const geo = new THREE.CylinderGeometry(0.62, 0.68, 1.9, 160, 40, true)
	const pos = geo.attributes.position!
	for (let i = 0; i < pos.count; i++) {
		const v = new THREE.Vector3().fromBufferAttribute(pos, i)
		const a = Math.atan2(v.z, v.x)
		const k = 1 + 0.045 * Math.sin(a * 11) + 0.03 * Math.sin(a * 4 + v.y * 2)
		pos.setXYZ(i, v.x * k, v.y, v.z * k)
	}
	geo.computeVertexNormals()
	const mat = cloth(p)
	mat.map!.wrapS = THREE.RepeatWrapping
	mat.map!.repeat.set(2, 1)
	return new THREE.Mesh(geo, mat)
}

/** A mat laid flat, its far end still rolled. */
function mat(p: Pattern) {
	const geo = new THREE.PlaneGeometry(1.8, 2.4, 40, 160)
	const pos = geo.attributes.position!
	const flat = 0.9
	const r = 0.16
	for (let i = 0; i < pos.count; i++) {
		const y = pos.getY(i)
		if (y <= flat) {
			pos.setXYZ(i, pos.getX(i), 0, -y)
		} else {
			const a = (y - flat) / r
			pos.setXYZ(i, pos.getX(i), r - Math.cos(a) * r, -flat - Math.sin(a) * r)
		}
	}
	geo.computeVertexNormals()
	const m = new THREE.Mesh(geo, cloth(p))
	m.position.set(0, -0.5, 0.2)
	return m
}

/** Tugaya brass: an urn with its lid and finial, or a kendi with its spout. */
function vessel(shape: 'gador' | 'kendi' | 'lamp') {
	const brass = new THREE.MeshStandardMaterial(BRASS)
	const group = new THREE.Group()
	if (shape === 'gador') {
		group.add(lathe([[0, -1], [0.42, -1], [0.44, -0.94], [0.3, -0.86], [0.36, -0.7], [0.62, -0.38], [0.7, -0.05], [0.62, 0.25], [0.36, 0.48], [0.3, 0.58], [0.4, 0.64], [0.41, 0.68], [0, 0.68]], brass))
		group.add(lathe([[0, 1.18], [0.06, 1.15], [0.09, 1.05], [0.05, 0.98], [0.1, 0.92], [0.3, 0.84], [0.42, 0.72], [0.43, 0.68], [0, 0.68]], brass))
	} else if (shape === 'kendi') {
		group.add(lathe([[0, -0.75], [0.36, -0.75], [0.3, -0.62], [0.58, -0.4], [0.7, -0.08], [0.6, 0.24], [0.2, 0.42], [0.16, 0.75], [0.24, 0.84], [0, 0.84]], brass))
		const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.11, 0.7, 32), brass)
		spout.position.set(0.72, 0.18, 0)
		spout.rotation.z = -0.85
		group.add(spout)
	} else {
		group.add(lathe([[0, -1], [0.5, -1], [0.48, -0.9], [0.12, -0.8], [0.08, 0.3], [0.2, 0.36], [0.38, 0.46], [0.4, 0.56], [0, 0.56]], brass))
	}
	return group
}

/** A gong: a flat face with its raised boss and a deep turned rim. */
function gongShape(r: number, depth: number, mat: THREE.Material) {
	return lathe([[0, 0.22 * r], [0.2 * r, 0.2 * r], [0.28 * r, 0.06 * r], [0.34 * r, 0], [r, 0], [r * 1.03, -depth], [r * 0.97, -depth], [r * 0.95, -0.04 * r], [0, -0.04 * r]], mat, 128)
}

/** The kulintang: a row of small gongs on two cords in a wooden frame; or one agung, hung. */
function gongs(count: number) {
	const brass = new THREE.MeshStandardMaterial({ ...BRASS, roughness: 0.38 })
	const group = new THREE.Group()
	if (count === 1) {
		// Hung in a frame, turned a little so its boss and deep rim both show.
		const g = gongShape(0.9, 0.36, brass)
		g.rotation.set(Math.PI / 2, 0, 0)
		const wood = new THREE.MeshStandardMaterial({ color: 0x6b3f22, roughness: 0.7 })
		for (const x of [-1.15, 1.15]) {
			const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.6, 0.1), wood)
			post.position.set(x, -0.25, -0.2)
			group.add(post)
		}
		const bar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 0.12), wood)
		bar.position.set(0, 1.05, -0.2)
		group.add(g, bar)
		group.rotation.y = 0.6
		return group
	}
	const wood = new THREE.MeshStandardMaterial({ color: 0x6b3f22, roughness: 0.7 })
	const span = 3.2
	for (const z of [-0.32, 0.32]) {
		const rail = new THREE.Mesh(new THREE.BoxGeometry(span, 0.12, 0.1), wood)
		rail.position.set(0, -0.12, z)
		group.add(rail)
	}
	for (let i = 0; i < count; i++) {
		const r = 0.22 - i * 0.008
		const g = gongShape(r, 0.12, brass)
		g.position.set(-span / 2 + 0.25 + (i * (span - 0.5)) / (count - 1), 0, 0)
		group.add(g)
	}
	group.rotation.x = 0.5
	return group
}

/** A kris: a waved blade, its guard and hilt. */
function kris() {
	const steel = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, metalness: 1, roughness: 0.28 })
	const shape = new THREE.Shape()
	const L = 2.2
	const waves = 7
	const half = (t: number) => 0.13 * (1 - t * 0.75)
	const curve = (t: number) => Math.sin(t * Math.PI * waves) * 0.035
	shape.moveTo(-half(0), 0)
	for (let i = 1; i <= 60; i++) shape.lineTo(curve(i / 60) - half(i / 60), (i / 60) * L)
	for (let i = 60; i >= 0; i--) shape.lineTo(curve(i / 60) + half(i / 60), (i / 60) * L)
	const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.012, bevelSegments: 2 }), steel)
	blade.position.set(0, -0.6, -0.01)
	const brass = new THREE.MeshStandardMaterial(BRASS)
	const guard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.08), brass)
	guard.position.y = -0.62
	const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.55, 32), new THREE.MeshStandardMaterial({ color: 0x4a2d1a, roughness: 0.6 }))
	hilt.position.y = -0.95
	const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 16), brass)
	pommel.scale.set(1.4, 0.8, 0.8)
	pommel.position.set(0.05, -1.25, 0)
	const group = new THREE.Group()
	group.add(blade, guard, hilt, pommel)
	group.rotation.z = -0.55
	return group
}

function build(m: CraftModel): THREE.Object3D {
	switch (m.kind) {
		case 'hanging':
			return hanging(m.pattern)
		case 'tube':
			return tube(m.pattern)
		case 'mat':
			return mat(m.pattern)
		case 'vessel':
			return vessel(m.shape)
		case 'gongs':
			return gongs(m.count)
		case 'kris':
			return kris()
	}
}

export default function CraftScene({ model, label }: { model: CraftModel; label: string }) {
	const hostRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const host = hostRef.current!
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = THREE.PCFSoftShadowMap
		renderer.toneMapping = THREE.ACESFilmicToneMapping
		host.appendChild(renderer.domElement)

		const scene = new THREE.Scene()
		const pmrem = new THREE.PMREMGenerator(renderer)
		scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
		const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)

		const sun = new THREE.DirectionalLight(0xfff4e6, 2.2)
		sun.position.set(2.5, 5, 3.5)
		sun.castShadow = true
		sun.shadow.mapSize.set(1024, 1024)
		Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 })
		sun.shadow.radius = 8
		scene.add(sun, new THREE.HemisphereLight(0xfff8ef, 0x6b4a36, 0.6))

		// Centre the object and stand it on a floor that shows only its shadow.
		const object = build(model)
		const box = new THREE.Box3().setFromObject(object)
		const size = box.getSize(new THREE.Vector3())
		const centre = box.getCenter(new THREE.Vector3())
		object.position.sub(centre)
		object.traverse((o) => {
			if (o instanceof THREE.Mesh) o.castShadow = true
		})
		const pivot = new THREE.Group()
		pivot.add(object)
		scene.add(pivot)
		const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.22 }))
		floor.rotation.x = -Math.PI / 2
		floor.position.y = -size.y / 2 - 0.02
		floor.receiveShadow = true
		scene.add(floor)

		// Flat things are seen from higher up, so their face shows rather than their edge.
		const lift = model.kind === 'mat' || (model.kind === 'gongs' && model.count > 1) ? 1.1 : 0.4
		const radius = size.length() / 2
		const distance = (radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))) * 0.85
		camera.position.set(0, radius * lift, distance)

		const controls = new OrbitControls(camera, renderer.domElement)
		controls.enableDamping = true
		controls.enablePan = false
		controls.minDistance = distance * 0.6
		controls.maxDistance = distance * 1.6
		controls.maxPolarAngle = THREE.MathUtils.degToRad(88)
		controls.autoRotate = !reduced
		controls.autoRotateSpeed = 1.2
		// A page that scrolls: the wheel and a vertical swipe stay with the page; a drag turns the object.
		controls.enableZoom = false
		renderer.domElement.style.touchAction = 'pan-y'

		const resize = () => {
			const { clientWidth: w, clientHeight: h } = host
			if (!w || !h) return
			renderer.setSize(w, h)
			camera.aspect = w / h
			camera.updateProjectionMatrix()
		}
		const sizeWatch = new ResizeObserver(resize)
		sizeWatch.observe(host)
		resize()

		let frame = 0
		const loop = () => {
			frame = requestAnimationFrame(loop)
			controls.update()
			renderer.render(scene, camera)
		}
		loop()

		return () => {
			cancelAnimationFrame(frame)
			sizeWatch.disconnect()
			controls.dispose()
			scene.traverse((o) => {
				if (o instanceof THREE.Mesh) {
					o.geometry.dispose()
					const m = o.material as THREE.MeshStandardMaterial
					m.map?.dispose()
					m.dispose()
				}
			})
			scene.environment?.dispose()
			pmrem.dispose()
			renderer.dispose()
			host.removeChild(renderer.domElement)
		}
	}, [model])

	return <div ref={hostRef} role='img' aria-label={`${label}, drawn in three dimensions; drag to turn it`} className='absolute inset-0 cursor-grab active:cursor-grabbing' />
}
