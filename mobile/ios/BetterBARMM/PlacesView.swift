import MapKit
import SwiftUI

/* Places: the region's islands, lakes, mosques and heritage. The islands lead as tall photo cards, then each
   province's places in a row; Stay and Eat are chips at the end of the same row. Photos carry their credit
   wherever they are shown full size — most are Creative Commons and require it. */

struct PlacesView: View {
	@Environment(Store.self) private var store
	@State private var filter = "all"
	@State private var query = ""
	@State private var path: [Place] = []
	@AppStorage(Pref.stayEat) private var stayEat = true

	private let chips: [(id: String, label: String, symbol: String?)] = [
		("all", "All", nil), ("island", "Islands", "island"), ("beach", "Beaches", "waves"), ("lake", "Lakes", "drop"),
		("falls", "Falls", "drop"), ("mountain", "Mountains", "mountains"), ("mosque", "Mosques", "mosque"),
		("heritage", "Heritage", "columns"), ("stay", "Stay", "bed"), ("eat", "Eat", "fork-knife"),
	]

	var body: some View {
		NavigationStack(path: $path) {
			ScrollView {
				LazyVStack(alignment: .leading, spacing: 22) {
					ScreenHeader(eyebrow: "Discover the Bangsamoro", title: "Places")
					SearchPill(prompt: "Search places, provinces, municipalities", text: $query)
					ChipBar(items: stayEat ? chips : chips.filter { $0.id != "stay" && $0.id != "eat" }, selection: $filter)

					switch filter {
					case "stay": venues(store.places.stays, title: "Where to stay")
					case "eat": venues(store.places.eats, title: "Where to eat")
					default: placesBody
					}
					FeedNote()
				}
				.padding(.vertical, 8)
			}
			.scrollDismissesKeyboard(.immediately)
			.refreshable { await store.refresh() }
			.overlay { if store.places.places.isEmpty && store.loading { ProgressView() } }
			.toolbar(.hidden, for: .navigationBar)
			.navigationDestination(for: Place.self) { PlaceDetail(place: $0) }
			.onChange(of: stayEat) { if !stayEat, filter == "stay" || filter == "eat" { filter = "all" } }
			// `-openPlace bud-bongao` on launch opens a place directly (screenshots, testing).
			.onChange(of: store.places.places.count) {
				if path.isEmpty, let slug = UserDefaults.standard.string(forKey: "openPlace"),
				   let place = store.places.places.first(where: { $0.id == slug }) { path = [place] }
			}
		}
	}

	@ViewBuilder private var placesBody: some View {
		if filter == "all", query.isEmpty, !featured.isEmpty {
			SectionHead(title: "Islands to start with")
			ScrollView(.horizontal, showsIndicators: false) {
				LazyHStack(spacing: 14) {
					ForEach(featured) { place in NavigationLink(value: place) { TallCard(place: place) }.buttonStyle(.plain) }
				}
				.padding(.horizontal, Look.pad)
			}
		}
		ForEach(provinces, id: \.self) { area in
			SectionHead(title: areaName(area))
			ScrollView(.horizontal, showsIndicators: false) {
				LazyHStack(spacing: 14) {
					ForEach(places.filter { $0.area == area }) { place in
						NavigationLink(value: place) {
							FeatureCard(image: thumb(place.images?.first?.url, 500), kicker: place.kind, title: place.name,
							            meta: place.municipality ?? areaName(place.area), width: 240)
						}
						.buttonStyle(.plain)
					}
				}
				.padding(.horizontal, Look.pad)
			}
		}
		if places.isEmpty && !store.places.places.isEmpty { ContentUnavailableView.search(text: query) }
	}

	@ViewBuilder private func venues(_ list: [Venue], title: String) -> some View {
		SectionHead(title: title)
		ForEach(list.filter(matches)) { VenueCard(venue: $0).padding(.horizontal, Look.pad) }
	}

	/// Islands with a photo, for the opening row.
	private var featured: [Place] { store.places.places.filter { $0.kind == "island" && $0.images?.isEmpty == false } }

	private var places: [Place] {
		store.places.places.filter { p in
			(filter == "all" || p.kind == filter || (filter == "heritage" && ["heritage", "museum", "memory"].contains(p.kind)))
				&& (query.isEmpty || [p.name, p.municipality ?? "", areaName(p.area)].contains { $0.localizedCaseInsensitiveContains(query) })
		}
	}

	/// Provinces in the order they have the most to show.
	private var provinces: [String] {
		Dictionary(grouping: places, by: \.area).sorted { $0.value.count > $1.value.count }.map(\.key)
	}

	private func matches(_ v: Venue) -> Bool {
		query.isEmpty || [v.name, v.municipality ?? "", areaName(v.area)].contains { $0.localizedCaseInsensitiveContains(query) }
	}
}

/// The opening card: a tall photo with the name set over a soft shade at its foot.
private struct TallCard: View {
	let place: Place
	var body: some View {
		RemoteImage(url: thumb(place.images?.first?.url, 960))
			.frame(width: 270, height: 360)
			.overlay {
				LinearGradient(colors: [.clear, .black.opacity(0.65)], startPoint: .center, endPoint: .bottom)
			}
			.overlay(alignment: .bottomLeading) {
				VStack(alignment: .leading, spacing: 6) {
					Kicker(text: place.municipality ?? areaName(place.area), tint: .white.opacity(0.85))
					Text(place.name).font(.title2.bold()).foregroundStyle(.white)
				}
				.padding(18)
			}
			.clipShape(.rect(cornerRadius: Look.radius))
	}
}

struct PlaceDetail: View {
	let place: Place
	@State private var page = 0
	@State private var reading: URL?

	var body: some View {
		ScrollView {
			VStack(alignment: .leading, spacing: 18) {
				if let photos = place.images, !photos.isEmpty {
					TabView(selection: $page) {
						ForEach(Array(photos.enumerated()), id: \.offset) { i, photo in
							RemoteImage(url: thumb(photo.url, 960)).tag(i)
								.overlay(alignment: .bottomLeading) {
									if let credit = photo.credit {
										Text(credit).font(.caption2).padding(.horizontal, 8).padding(.vertical, 4)
											.background(.black.opacity(0.45), in: .rect(cornerRadius: 6))
											.foregroundStyle(.white).padding(12).padding(.bottom, 20)
									}
								}
						}
					}
					.tabViewStyle(.page)
					.frame(height: 360)
				}

				VStack(alignment: .leading, spacing: 16) {
					Kicker(text: place.kind, tint: .brand)
					Text(place.name).font(.system(size: 32, weight: .bold)).tracking(-0.5)
					Label { Text([place.municipality, areaName(place.area)].compactMap { $0 }.joined(separator: ", ")) } icon: { Icon("map-pin", size: 18) }
						.foregroundStyle(.secondary)
					if let summary = place.summary { Text(summary).font(.title3).lineSpacing(3) }
					ForEach(place.detail ?? [], id: \.self) { Text($0).foregroundStyle(.secondary).lineSpacing(4) }

					if let things = place.do, !things.isEmpty {
						Heading("What to do")
						ForEach(things, id: \.title) { thing in
							HStack(alignment: .top, spacing: 12) {
								Icon("sparkle", fill: true, size: 16).foregroundStyle(Color.brand).padding(.top, 3)
								VStack(alignment: .leading, spacing: 4) {
									Text(thing.title).font(.headline)
									if let d = thing.detail { Text(d).foregroundStyle(.secondary) }
								}
							}
						}
					}
					if let how = place.gettingThere { Heading("Getting there"); Text(how).foregroundStyle(.secondary) }
					if let when = place.bestTime { Heading("Best time"); Text(when).foregroundStyle(.secondary) }
					if let notes = place.beforeYouGo, !notes.isEmpty {
						Heading("Before you go")
						ForEach(notes, id: \.self) { note in
							HStack(alignment: .top, spacing: 12) {
								Icon("info", size: 18).foregroundStyle(.secondary).padding(.top, 2)
								Text(note).foregroundStyle(.secondary)
							}
						}
					}
					PrimaryButton(title: "More on BetterBARMM Travel") { reading = URL(string: place.url) }.padding(.top, 10)
				}
				.padding(.horizontal, Look.pad)
			}
			.padding(.bottom, 30)
		}
		.ignoresSafeArea(edges: .top)
		.overlay(alignment: .top) {
			DetailBar { if let url = URL(string: place.url) { ShareLink(item: url) { CircleIcon(icon: "send") } } }
				.padding(.top, 8)
		}
		.toolbar(.hidden, for: .navigationBar)
		.sheet(item: $reading) { SafariSheet(url: $0).ignoresSafeArea() }
	}
}

private struct Heading: View {
	let text: String
	init(_ text: String) { self.text = text }
	var body: some View { Text(text).font(.title3.bold()).padding(.top, 10) }
}

/// A stay or an eat: photo, name, where, and the ways to reach it.
private struct VenueCard: View {
	let venue: Venue
	var body: some View {
		VStack(alignment: .leading, spacing: 10) {
			if let image = venue.image {
				RemoteImage(url: image.url).frame(height: 180).frame(maxWidth: .infinity).clipShape(.rect(cornerRadius: Look.radius - 6))
			}
			HStack {
				Kicker(text: venue.kind ?? "")
				Spacer()
				if venue.halal == "halal" { Kicker(text: "Halal", tint: .green) }
			}
			Text(venue.name).font(.headline)
			Text([venue.municipality, areaName(venue.area)].compactMap { $0 }.joined(separator: ", ")).font(.subheadline).foregroundStyle(.secondary)
			if let note = venue.note { Text(note).font(.subheadline).lineLimit(3) }
			HStack(spacing: 10) {
				if let phone = venue.phone, let url = URL(string: "tel:\(phone.filter { $0.isNumber || $0 == "+" })") {
					Link(destination: url) { CircleIcon(icon: "phone") }
				}
				if let fb = venue.facebook, let url = URL(string: fb) { Link(destination: url) { CircleIcon(icon: "facebook") } }
				if let lat = venue.lat, let lon = venue.lon {
					Button {
						let item = MKMapItem(placemark: MKPlacemark(coordinate: .init(latitude: lat, longitude: lon)))
						item.name = venue.name
						item.openInMaps()
					} label: { CircleIcon(icon: "map") }
				}
			}
			.buttonStyle(.plain)
		}
		.padding(10)
		.background(.background, in: .rect(cornerRadius: Look.radius))
		.overlay(RoundedRectangle(cornerRadius: Look.radius).stroke(Look.line))
	}
}

/// Wikimedia serves any photo at a set of thumbnail widths; a card asks for a small one, not the 1280px original.
func thumb(_ url: String?, _ width: Int) -> String? {
	guard let url, url.contains("wikimedia.org"), let r = url.range(of: #"/\d+px-"#, options: .regularExpression) else { return url }
	return url.replacingCharacters(in: r, with: "/\(width)px-")
}
