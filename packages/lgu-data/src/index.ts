/* ============================================================
   The local government dataset

   Province → city or municipality → barangay, for every unit in
   BARMM, plus the plain-language guide that goes with it: the ladder
   of units, what each rung elects, the offices that hold the parts of
   the record we do not, and the legal basis underneath.

   It is a package rather than a folder in one app because two
   surfaces read it and neither owns it. The Local Government
   workspace is the directory — every province, every town, every
   barangay, and who was elected to each. Discover, on the landing
   site, is the explainer: what a barangay is, why the totals here are
   smaller than PSA's, and which ballot elects whom. Both need the
   same counts, and two copies would have disagreed by the first time
   a figure changed.
   ============================================================ */

export * from './dataset'
export * from './guide'
export * from './reference'
