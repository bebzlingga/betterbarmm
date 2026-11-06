import data from '../../../datasets/travel/transport.json'

/* ============================================================
   Flights and boats into the region

   Unlike the rest of this package, these are sourced: each route
   was taken from an airline's, an operator's or a news report's
   own page and carries that page and the month it was read. They
   live in datasets/travel/transport.json for that reason.

   Nothing here is sold or reserved. A route says who flies or
   sails it and roughly how long it takes; fares and timetables
   are the airline's and the operator's, a link away.
   ============================================================ */

export type Airport = {
	code: string
	name: string
	/** What a traveler calls it: Cotabato, not Datu Odin Sinsuat. */
	short: string
	city: string
	/** Inside BARMM, rather than the city next door a traveler flies into. */
	inBarmm: boolean
	/** Travel area slugs this airport is the way into. */
	serves: string[]
	note: string
	source: string
}

export type Flight = {
	from: string
	to: string
	airlines: string[]
	duration: string | null
	frequency: string | null
	note?: string
	source: string
	asOf: string | null
}

export type Ferry = {
	from: string
	to: string
	operators: string[]
	kind: 'fast craft' | 'RORO' | 'conventional' | 'mixed' | 'pump boat'
	duration: string | null
	frequency: string | null
	note?: string
	source: string
	asOf: string
}

type Transport = { names: Record<string, string>; airports: Airport[]; flights: Flight[]; ferries: Ferry[] }

const transport = data as Transport

export const airports = transport.airports
export const flights = transport.flights
export const ferries = transport.ferries
export const airportByCode = new Map(airports.map((airport) => [airport.code, airport]))

/** "Cotabato (CBO)": an airport by the name a traveler uses, origins outside the region included. */
export const airportLabel = (code: string) => `${airportByCode.get(code)?.short ?? transport.names[code] ?? code} (${code})`

/** Google Flights with the route already filled in: the fare search a traveler would run anyway, a click shorter. */
export function flightSearchUrl(from: string, to: string, date?: string, adults = 1) {
	const query = `Flights from ${from} to ${to}${date ? ` on ${date}` : ''}${adults > 1 ? ` for ${adults} adults` : ''}`
	return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`
}
