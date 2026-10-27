/** "Lamitan, Basilan"; once only where the town is the area, as Cotabato City is. A module of its own, with no
    imports, so the browser's cards and the server's place page can both call it without pulling in the places. */
export const whereLine = (place: { municipality: string; areaName: string }) => {
	const town = place.municipality.split(/,| \(| —/)[0]!.trim()
	return town === place.areaName ? town : `${town}, ${place.areaName}`
}
