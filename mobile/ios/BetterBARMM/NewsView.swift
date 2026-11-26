import MapKit
import SwiftUI

/* Home: the region today. A greeting with the date, search, a chip row, then the top stories as a full-photo
   hero you swipe through, and the rest as a list. A story opens on its photo with the text on a sheet over it,
   an Aa panel for text size and theme, and the full article one tap further. */

enum NewsFilter: Hashable { case all, government, media, incidents }

struct NewsView: View {
	@Environment(Store.self) private var store
	@AppStorage(Pref.workspacesOff) private var off = ""
	@AppStorage(Pref.topStories) private var topStories = true
	@State private var filter: NewsFilter = .all
	@State private var query = ""
	@State private var path = NavigationPath()

	var body: some View {
		NavigationStack(path: $path) {
			ScrollView {
				LazyVStack(alignment: .leading, spacing: 22) {
					ScreenHeader(eyebrow: greeting, title: "BetterBARMM") {
						Button { Router.shared.tab = .you } label: { CircleIcon(icon: "bell", badge: Topic.allCases.contains(where: \.on)) }
							.buttonStyle(.plain)
					}
					SearchPill(prompt: "Search news and incidents", text: $query)
					ChipBar(items: chips, selection: $filter)

					if filter == .incidents {
						SectionHead(title: "Incidents")
						ForEach(incidents) { incident in
							NavigationLink(value: incident) {
								RowCard(image: nil, kicker: incident.kind ?? "Incident", kickerTint: .orange,
								        trailing: Dates.pretty(incident.date), title: incident.title, subtitle: toll(incident))
							}
							.buttonStyle(.plain).padding(.horizontal, Look.pad)
						}
					} else {
						if showHero { Hero(stories: top).padding(.horizontal, Look.pad) }
						SectionHead(title: query.isEmpty ? "Latest" : "Results")
						ForEach(rest) { story in
							NavigationLink(value: story) {
								RowCard(image: story.image, kicker: story.source ?? "News", trailing: ago(story.date), title: story.title)
							}
							.buttonStyle(.plain).padding(.horizontal, Look.pad)
						}
					}
					FeedNote()
				}
				.padding(.vertical, 8)
			}
			.scrollDismissesKeyboard(.immediately)
			.refreshable { await store.refresh() }
			.overlay { if store.news.isEmpty && store.loading { ProgressView() } }
			.toolbar(.hidden, for: .navigationBar)
			.navigationDestination(for: Story.self) { StoryDetail(story: $0) }
			.navigationDestination(for: Incident.self) { IncidentDetail(incident: $0) }
			// `-openStory 1` on launch opens the first top story (screenshots, testing).
			.onChange(of: store.news.count) {
				if path.isEmpty, UserDefaults.standard.bool(forKey: "openStory"), let story = top.first { path.append(story) }
			}
			.onChange(of: off) { if filter == .incidents, !Workspaces.on("incidents", off) { filter = .all } }
		}
	}

	private var chips: [(id: NewsFilter, label: String, symbol: String?)] {
		var list: [(id: NewsFilter, label: String, symbol: String?)] = [(.all, "All", nil), (.government, "Government", "bank"), (.media, "Media", "newspaper")]
		if Workspaces.on("incidents", off) { list.append((.incidents, "Incidents", "warning")) }
		return list
	}

	private var greeting: String {
		let hour = Calendar.current.component(.hour, from: .now)
		let part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
		return "\(part) · \(Date.now.formatted(.dateTime.weekday(.wide).day().month(.wide)))"
	}

	private static let government = ["Bangsamoro Government", "Information Agency", "News Agency", "Ministry", "Parliament", "BARMM"]

	private var stories: [Story] {
		store.news.filter { s in
			let gov = Self.government.contains { (s.source ?? "").localizedCaseInsensitiveContains($0) }
			let fits = filter == .all || (filter == .government && gov) || (filter == .media && !gov)
			return fits && (query.isEmpty || s.title.localizedCaseInsensitiveContains(query) || (s.source ?? "").localizedCaseInsensitiveContains(query))
		}
	}
	private var showHero: Bool { topStories && query.isEmpty && !top.isEmpty }
	/// The hero: the newest stories that have a photo to show.
	private var top: [Story] { Array(stories.filter { $0.image != nil }.prefix(5)) }
	private var rest: [Story] {
		let shown = Set(showHero ? top.map(\.id) : [])
		return Array(stories.filter { !shown.contains($0.id) }.prefix(120))
	}
	private var incidents: [Incident] {
		query.isEmpty ? store.incidents : store.incidents.filter { $0.title.localizedCaseInsensitiveContains(query) || $0.place.localizedCaseInsensitiveContains(query) }
	}
	private func toll(_ i: Incident) -> String? {
		let parts = [i.place.isEmpty ? nil : i.place, (i.deaths ?? 0) > 0 ? "\(i.deaths!) dead" : nil, (i.injured ?? 0) > 0 ? "\(i.injured!) hurt" : nil]
		let line = parts.compactMap { $0 }.joined(separator: " · ")
		return line.isEmpty ? nil : line
	}
}

/// The top stories, one full photo at a time, the headline set over it; swipe for the next.
private struct Hero: View {
	let stories: [Story]
	@State private var page = 0

	var body: some View {
		VStack(spacing: 12) {
			TabView(selection: $page) {
				ForEach(Array(stories.enumerated()), id: \.element.id) { i, story in
					NavigationLink(value: story) {
						RemoteImage(url: fullSize(story.image))
							.overlay { LinearGradient(colors: [.clear, .black.opacity(0.15), .black.opacity(0.8)], startPoint: .top, endPoint: .bottom) }
							.overlay(alignment: .topTrailing) { SaveButton(story: story, onPhoto: true).padding(14) }
							.overlay(alignment: .bottomLeading) {
								VStack(alignment: .leading, spacing: 10) {
									Text(story.title).font(.system(size: 24, weight: .bold)).tracking(-0.3).lineLimit(4)
										.multilineTextAlignment(.leading)
									HStack {
										Text(story.source ?? "News").fontWeight(.semibold)
										Spacer()
										Text(ago(story.date))
									}
									.font(.footnote).opacity(0.85)
								}
								.foregroundStyle(.white).padding(20)
							}
							.clipShape(.rect(cornerRadius: Look.radius + 4))
					}
					.buttonStyle(.plain).tag(i)
				}
			}
			.tabViewStyle(.page(indexDisplayMode: .never))
			.frame(height: 430)

			HStack(spacing: 6) {
				ForEach(stories.indices, id: \.self) { i in
					Capsule().fill(i == page ? Color.brand : Look.line).frame(width: i == page ? 22 : 8, height: 6)
				}
			}
			.animation(.snappy, value: page)
		}
	}
}

/// Save a story for later; it stays saved after it leaves the feed.
struct SaveButton: View {
	let story: Story
	var onPhoto = false
	@AppStorage(Saved.key) private var saved = Data()
	var body: some View {
		let on = Saved.list(saved).contains { $0.id == story.id }
		Button { withAnimation(.snappy) { saved = Saved.toggled(story, in: saved) } } label: {
			Icon("bookmark", fill: on, size: 20)
				.foregroundStyle(onPhoto ? .white : (on ? Color.brand : .primary))
				.frame(width: 44, height: 44)
				.background(onPhoto ? AnyShapeStyle(on ? Color.brand : Color.black.opacity(0.35)) : AnyShapeStyle(.background), in: Circle())
				.overlay(Circle().stroke(onPhoto ? .clear : Look.line))
		}
		.buttonStyle(.plain)
		.accessibilityLabel(on ? "Remove from saved" : "Save")
	}
}

/// Where the data comes from and how fresh it is, at the foot of every tab.
struct FeedNote: View {
	@Environment(Store.self) private var store
	var body: some View {
		VStack(spacing: 4) {
			if let error = store.error { Text(error).foregroundStyle(.orange) }
			if let updated = store.updated { Text("Updated \(updated.formatted(.relative(presentation: .named))) · betterbarmm.com") }
		}
		.font(.footnote).foregroundStyle(.secondary)
		.frame(maxWidth: .infinity).padding(.top, 8).padding(.bottom, 24)
	}
}

struct StoryDetail: View {
	let story: Story
	@AppStorage(Pref.textScale) private var scale = 1.0
	@State private var reading: URL?
	@State private var settings = false

	var body: some View {
		ScrollView {
			VStack(alignment: .leading, spacing: 0) {
				if story.image != nil {
					RemoteImage(url: fullSize(story.image)).frame(height: 400)
				}
				VStack(alignment: .leading, spacing: 18) {
					Kicker(text: story.source ?? "News", tint: .brand)
					Text(story.title).font(.system(size: 28 * scale, weight: .bold)).tracking(-0.4)
					Text(ago(story.date)).font(.subheadline).foregroundStyle(.secondary)
					if let summary = story.summary {
						Text(summary).font(.system(size: 18 * scale)).foregroundStyle(.secondary).lineSpacing(6 * scale)
					}
					PrimaryButton(title: "Read the full story") { reading = URL(string: story.url) }.padding(.top, 6)
					Text("Opens at \(URL(string: story.url)?.host() ?? "the source"). BetterBARMM links to the original report.")
						.font(.footnote).foregroundStyle(.secondary)
				}
				.padding(.horizontal, Look.pad).padding(.top, 28).padding(.bottom, 40)
				.frame(maxWidth: .infinity, alignment: .leading)
				.background(.background, in: UnevenRoundedRectangle(topLeadingRadius: 30, topTrailingRadius: 30))
				.offset(y: story.image == nil ? 0 : -30)
				.padding(.top, story.image == nil ? 70 : 0)
			}
		}
		.ignoresSafeArea(edges: .top)
		.overlay(alignment: .top) {
			DetailBar {
				Button { settings = true } label: { CircleIcon(icon: "text-aa") }
				SaveButton(story: story)
				if let url = URL(string: story.url) { ShareLink(item: url) { CircleIcon(icon: "send") } }
			}
			.padding(.top, 4)
		}
		.toolbar(.hidden, for: .navigationBar)
		.sheet(item: $reading) { SafariSheet(url: $0).ignoresSafeArea() }
		.sheet(isPresented: $settings) { ReadingSettings().presentationDetents([.height(300)]).presentationCornerRadius(28) }
	}
}

/// The Aa panel: text size and theme, for every story.
struct ReadingSettings: View {
	@AppStorage(Pref.textScale) private var scale = 1.0
	@AppStorage(Pref.appearance) private var appearance = "system"
	var body: some View {
		VStack(alignment: .leading, spacing: 22) {
			Text("Reading").font(.title3.bold())
			VStack(alignment: .leading, spacing: 10) {
				Text("Text size").font(.subheadline).foregroundStyle(.secondary)
				HStack(spacing: 14) {
					Text("A").font(.system(size: 14))
					Slider(value: $scale, in: 0.9 ... 1.4, step: 0.1).tint(.brand)
					Text("A").font(.system(size: 24, weight: .semibold))
				}
			}
			VStack(alignment: .leading, spacing: 10) {
				Text("Theme").font(.subheadline).foregroundStyle(.secondary)
				Picker("Theme", selection: $appearance) {
					Text("Automatic").tag("system")
					Text("Light").tag("light")
					Text("Dark").tag("dark")
				}
				.pickerStyle(.segmented)
			}
		}
		.padding(24)
	}
}

private struct IncidentDetail: View {
	let incident: Incident
	var body: some View {
		ScrollView {
			VStack(alignment: .leading, spacing: 18) {
				Kicker(text: "\(incident.kind ?? "Incident") · \(Dates.pretty(incident.date))", tint: .orange)
				Text(incident.title).font(.system(size: 26, weight: .bold)).tracking(-0.4)
				if !incident.place.isEmpty { Label { Text(incident.place) } icon: { Icon("map-pin", size: 18) }.foregroundStyle(.secondary) }
				HStack(spacing: 10) {
					if let d = incident.deaths, d > 0 { Stat(value: d, label: "dead", tint: .red) }
					if let i = incident.injured, i > 0 { Stat(value: i, label: "hurt", tint: .orange) }
				}
				if let lat = incident.lat, let lon = incident.lon {
					let spot = CLLocationCoordinate2D(latitude: lat, longitude: lon)
					Map(initialPosition: .region(.init(center: spot, latitudinalMeters: 6000, longitudinalMeters: 6000))) {
						Marker(incident.kind ?? "Incident", coordinate: spot).tint(.orange)
					}
					.frame(height: 220).clipShape(.rect(cornerRadius: Look.radius))
				}
				if let summary = incident.summary { Text(summary).font(.body).lineSpacing(4) }
			}
			.padding(.horizontal, Look.pad).padding(.top, 76).padding(.bottom, 30)
		}
		.overlay(alignment: .top) { DetailBar {}.padding(.top, 8).background(.background.opacity(0.92)) }
		.toolbar(.hidden, for: .navigationBar)
	}
}

private struct Stat: View {
	let value: Int, label: String, tint: Color
	var body: some View {
		HStack(alignment: .firstTextBaseline, spacing: 4) {
			Text("\(value)").font(.title2.bold()).monospacedDigit()
			Text(label).font(.subheadline)
		}
		.foregroundStyle(tint)
		.padding(.horizontal, 14).frame(height: 44)
		.background(tint.opacity(0.1), in: Capsule())
	}
}
