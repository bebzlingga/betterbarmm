import type { StaticImageData } from 'next/image'

import drone from '../_images/travel/cotabato/drone.jpg'
import tamontaka from '../_images/travel/cotabato/tamontaka.jpg'
import oldCityHall from '../_images/travel/cotabato/old-city-hall.jpg'
import pcHill from '../_images/travel/cotabato/pc-hill.jpg'
import kutawatoCave from '../_images/travel/cotabato/kutawato-cave.jpg'
import baywalk from '../_images/travel/cotabato/baywalk.jpg'
import rioGrande from '../_images/travel/cotabato/rio-grande.jpg'
import deltaBridge from '../_images/travel/cotabato/delta-bridge.jpg'
import sultanKudarat from '../_images/travel/cotabato/sultan-kudarat.jpg'
import kuyog from '../_images/travel/cotabato/kuyog.jpg'
import cityMuseum from '../_images/travel/cotabato/city-museum.jpg'

/* Cotabato City's photographs, all from Wikimedia Commons under the license
   each names; credit, license and source are what the license asks for. */

export type CityPhoto = { src: StaticImageData; alt: string; credit: string; license: string; source: string }

export const cotabatoPhotos: Record<string, CityPhoto> = {
	'drone': { src: drone, alt: "Cotabato City from the air, the Rio Grande de Mindanao curving past the rooftops", credit: "Francis 188", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Cotabato_City_October_2023_drone_shot.jpg" },
	'tamontaka': { src: tamontaka, alt: "The white facade of Tamontaka Church", credit: "Joelaldor", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Immaculate_Conception_Parish_Church_of_Tamontaka,_Cotabato_City.jpg" },
	'old-city-hall': { src: oldCityHall, alt: "The Old Cotabato City Hall on Dorotheo Street", credit: "Patrickroque01", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Old_Cotabato_City_Hall_(Dorotheo_Street,_Cotabato_City;_08-15-2023).jpg" },
	'pc-hill': { src: pcHill, alt: "Pedro Colina Hill above the city", credit: "MarkoDalisay", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Pedro_Colina_(PC)_Hill_Cotabato_City.jpg" },
	'kutawato-cave': { src: kutawatoCave, alt: "The entrance to Kutawato Cave in PC Hill", credit: "Patrickroque01", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Kutawato_Cave_(PC_Hill,_Cotabato_City;_08-15-2023).jpg" },
	'baywalk': { src: baywalk, alt: "The Cotabato City Baywalk", credit: "PeterParker22", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Cotabato_City_Baywalk_1.jpg" },
	'rio-grande': { src: rioGrande, alt: "The Rio Grande de Mindanao at Cotabato City", credit: "Shubert Ciencia", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Rio_Grande_de_Mindanao_(Cotabato_City).jpg" },
	'delta-bridge': { src: deltaBridge, alt: "The Delta Bridge over the river", credit: "Francis 188", license: "CC0", source: "https://commons.wikimedia.org/wiki/File:Delta_Bridge_Cotabato_City.jpg" },
	'sultan-kudarat': { src: sultanKudarat, alt: "The statue of Sultan Dipatuan Kudarat", credit: "Jahwulf935", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Sultan_Dipatuan_Kudarat_-_Cotabato_City.jpg" },
	'kuyog': { src: kuyog, alt: "Kuyog street dancers at the city plaza during the Shariff Kabunsuan Festival", credit: "PeterParker22", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Kuyog_Street_Dance_at_city_Plaza_Shariff_Kabunsuan_Festival_2018.jpg" },
	'city-museum': { src: cityMuseum, alt: "Exhibits in the Cotabato City Museum", credit: "MarkoDalisay", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Cotabato_City_Museum.jpg" },
}
