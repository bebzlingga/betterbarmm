/* ============================================================
   The travel guide

   Everything else on this estate is a record: Parliament's measures,
   COMELEC's canvass, PSA's census. This is not. Nobody publishes an
   official inventory of what there is to see in the Bangsamoro, what
   is worth eating, or where a traveler can sleep — so this is
   written rather than captured, and it says so on every page that
   shows it.

   That distinction is why this content lives in a package under
   `packages/` and not a file under `datasets/`. A file in `datasets/`
   is a claim that something was taken from a source that published
   it. Nothing here carries that claim.

   What it does carry:

   · Places, food and practicalities described from general knowledge
     of the region, checked against the geography this estate already
     holds — every place names the LGU it sits in, and that slug is
     resolved against the local government dataset rather than typed
     twice.

   · No invented specifics. There are no phone numbers, no room
     rates, no opening hours and no addresses beyond the municipality,
     because those are the fields a guide gets wrong first and the
     ones a traveler is most hurt by. Where a figure would be useful
     and is not reliably known, the text says what is known instead.

   · An honest security section. Parts of this region carry standing
     foreign-government travel advisories and parts of it do not, and
     the difference between them is sharp enough that a guide which
     flattens it is useless in both directions.

   The seven areas here are BARMM's own, and they are the seven the
   local government directory lists. Sulu is not among them: the
   Supreme Court removed it from the region in 2024. It borders this
   guide's subject on every side and appears in it only where the
   history or the food genuinely crosses over, marked each time.
   ============================================================ */

export * from './areas'
export * from './geo'
export * from './itineraries'
export * from './places'
export * from './food'
export * from './stays'
export * from './plan'
