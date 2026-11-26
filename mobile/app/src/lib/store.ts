import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSyncExternalStore } from 'react'

/* The app's state, without a state library: each value is a small store any component can read with `use()`
   and any code can `set()`. A persisted one is written to AsyncStorage on every change and read back once at
   launch (hydrate, awaited by the root layout before anything renders). */

export type Store<T> = {
	get: () => T
	set: (value: T | ((prev: T) => T)) => void
	use: () => T
	subscribe: (fn: () => void) => () => void
}

export function store<T>(initial: T, persistKey?: string): Store<T> & { hydrate: () => Promise<void> } {
	let value = initial
	const subs = new Set<() => void>()
	const subscribe = (fn: () => void) => {
		subs.add(fn)
		return () => subs.delete(fn)
	}
	const get = () => value
	const set = (next: T | ((prev: T) => T)) => {
		value = typeof next === 'function' ? (next as (prev: T) => T)(value) : next
		subs.forEach((fn) => fn())
		if (persistKey) AsyncStorage.setItem(persistKey, JSON.stringify(value)).catch(() => {})
	}
	const hydrate = async () => {
		if (!persistKey) return
		try {
			const raw = await AsyncStorage.getItem(persistKey)
			if (raw != null) value = JSON.parse(raw)
		} catch {}
	}
	return { get, set, subscribe, hydrate, use: () => useSyncExternalStore(subscribe, get, get) }
}
