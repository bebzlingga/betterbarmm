/* ============================================================
   The editorial layer

   Two things live here: the motion primitives every animated element
   on the public surfaces is built from, and the okir ornament that
   gives them their identity. The stylesheet beside them is imported
   separately, by each app's `globals.css`, because CSS and JS enter a
   Next app through different doors.

   Everything exported is a Client Component or is consumed by one.
   Importing from this index inside a Server Component is fine — the
   'use client' directives are on the modules themselves, so the
   boundary lands where it should without the caller thinking about it.
   ============================================================ */

export * from './cta-panel'
export * from './motion'
export * from './motion-provider'
export * from './okir'
export * from './okir-paths'
export * from './section-head'
export * from './site-footer'
export * from './subscribe-form'
