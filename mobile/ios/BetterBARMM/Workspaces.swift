import SwiftUI

/* Every BetterBARMM workspace and project, as the website lists them (apps/www/app/_lib/workspaces.ts), and the
   reader's choice of which the app carries.

   Three have native screens — Parliament, Places, and incidents on Home. The rest open in the app as their own
   site, from the Explore tab. A reader can switch any of them off: a native one takes its tab with it, a web one
   leaves Explore. Only live workspaces are here; planned ones (public works) and the sector workspaces the site
   still hides are left out until the site shows them. */

struct Workspace: Identifiable, Hashable {
	let id: String
	let title: String
	let blurb: String
	let measure: String
	let icon: String
	let group: String
	let url: String
	/// The tab that shows it natively, if any.
	var tab: AppTab?
}

enum Workspaces {
	static let groups: [(id: String, title: String)] = [
		("government", "Laws & elections"), ("money", "Public money"), ("services", "Services & safety"),
		("places", "Places & culture"), ("data", "Data"),
	]

	static let all: [Workspace] = [
		.init(id: "legislation", title: "Legislation", blurb: "Bills, autonomy acts and the members who filed them, with the stage each has reached.", measure: "Bangsamoro Parliament", icon: "bank", group: "government", url: "https://legislation.betterbarmm.com", tab: .parliament),
		.init(id: "lgu", title: "Local government", blurb: "Every province, city, municipality and barangay — population, land area and the officials elected to each.", measure: "LGU directory", icon: "buildings", group: "government", url: "https://lgu.betterbarmm.com"),
		.init(id: "election", title: "Election", blurb: "Parties, candidates, districts and sectoral seats for the 2026 Parliamentary Elections.", measure: "2026 Parliament", icon: "check-square", group: "government", url: "https://election.betterbarmm.com"),
		.init(id: "budget", title: "Budget", blurb: "Every enacted appropriation by sector, office, program and project, traced to the page of the Act.", measure: "GAAB FY 2020–2026", icon: "coins", group: "money", url: "https://budget.betterbarmm.com"),
		.init(id: "procurement", title: "Procurement", blurb: "Every bid notice BARMM offices posted on PhilGEPS since 2019, its budget, and who won.", measure: "PhilGEPS 2019–2026", icon: "cart", group: "money", url: "https://procurement.betterbarmm.com"),
		.init(id: "plan", title: "Development Plan Scorecard", blurb: "The regional plan’s targets for poverty, jobs, schools, health and peace, beside the latest figure.", measure: "BDP 2023–2028", icon: "chart-up", group: "money", url: "https://betterbarmm.com/development-plan"),
		.init(id: "incidents", title: "Incident Watch", blurb: "Road crashes, sea mishaps, fires, floods and shootings across the region, from the news.", measure: "Since 2019", icon: "warning", group: "services", url: "https://betterbarmm.com/accidents", tab: .news),
		.init(id: "preparedness", title: "Preparedness", blurb: "Flood, landslide and storm surge hazard for every barangay, with the nearest evacuation sites.", measure: "Project NOAH hazards", icon: "lifebuoy", group: "services", url: "https://betterbarmm.com/preparedness"),
		.init(id: "services", title: "Public services", blurb: "What each office offers the public: who it is for, what to bring, the fee and how long it takes.", measure: "Citizen’s Charters", icon: "handshake", group: "services", url: "https://betterbarmm.com/services"),
		.init(id: "education", title: "Education", blurb: "Every school in the region on a map, with its learners each year, scholarships and the budget.", measure: "DepEd · MBHTE", icon: "graduation-cap", group: "services", url: "https://education.betterbarmm.com"),
		.init(id: "travel", title: "Travel & Places", blurb: "Beaches, islands, lakes, mosques and heritage sites, with where to stay and eat and how to get there.", measure: "104 places", icon: "map", group: "places", url: "https://travel.betterbarmm.com", tab: .places),
		.init(id: "library", title: "Library", blurb: "Books about the Bangsamoro and its peoples, where to buy, borrow or read them free.", measure: "Books · Authors · Magazines", icon: "books", group: "places", url: "https://library.betterbarmm.com"),
		.init(id: "crafts", title: "Crafts", blurb: "The weaves, mats, brass and gongs of the region: where each is made and who makes it.", measure: "Weaves, brass, gongs", icon: "yarn", group: "places", url: "https://betterbarmm.com/crafts"),
		.init(id: "data", title: "Open Data", blurb: "The records under every workspace as tables anyone can download, each with its source.", measure: "CSV and JSON", icon: "database", group: "data", url: "https://betterbarmm.com/data"),
	]

	static func on(_ id: String, _ off: String) -> Bool { !off.split(separator: ",").contains { $0 == id } }

	/// The stored list with one workspace switched on or off.
	static func toggled(_ id: String, _ off: String, to on: Bool) -> String {
		var set = Set(off.split(separator: ",").map(String.init))
		if on { set.remove(id) } else { set.insert(id) }
		return set.sorted().joined(separator: ",")
	}
}

/// The settings every screen reads. AppStorage, so a change in You redraws the tabs and screens at once.
enum Pref {
	static let workspacesOff = "workspacesOff"
	static let topStories = "show.topStories"
	static let newestLaws = "show.newestLaws"
	static let stayEat = "show.stayEat"
	static let appearance = "appearance"
	static let textScale = "textScale"
}

/// Explore: the workspaces without a native screen, grouped as the website groups them, each opening in the app.
struct ExploreView: View {
	@AppStorage(Pref.workspacesOff) private var off = ""
	@State private var reading: URL?

	var body: some View {
		ScrollView {
			LazyVStack(alignment: .leading, spacing: 22) {
				ScreenHeader(eyebrow: "Every BetterBARMM workspace", title: "Explore") {
					Button { Router.shared.tab = .you } label: { CircleIcon(icon: "sliders") }.buttonStyle(.plain)
				}
				ForEach(Workspaces.groups, id: \.id) { group in
					let list = Workspaces.all.filter { $0.group == group.id && $0.tab == nil && Workspaces.on($0.id, off) }
					if !list.isEmpty {
						SectionHead(title: group.title)
						ForEach(list) { ws in
							Button { reading = URL(string: ws.url) } label: { WorkspaceRow(workspace: ws) }
								.buttonStyle(.plain).padding(.horizontal, Look.pad)
						}
					}
				}
				Text("Switch workspaces on or off in You.").font(.footnote).foregroundStyle(.secondary)
					.frame(maxWidth: .infinity).padding(.vertical, 20)
			}
			.padding(.vertical, 8)
		}
		.sheet(item: $reading) { SafariSheet(url: $0).ignoresSafeArea() }
	}
}

private struct WorkspaceRow: View {
	let workspace: Workspace
	var body: some View {
		HStack(alignment: .top, spacing: 14) {
			Icon(workspace.icon, size: 24).foregroundStyle(Color.brand)
				.frame(width: 52, height: 52).background(Color.brand.opacity(0.08), in: Circle())
			VStack(alignment: .leading, spacing: 5) {
				Kicker(text: workspace.measure)
				Text(workspace.title).font(.headline)
				Text(workspace.blurb).font(.subheadline).foregroundStyle(.secondary).lineLimit(2).multilineTextAlignment(.leading)
			}
			Spacer(minLength: 0)
			Icon("arrow-up-right", size: 18).foregroundStyle(.tertiary)
		}
		.padding(14)
		.background(.background, in: .rect(cornerRadius: Look.radius - 4))
		.overlay(RoundedRectangle(cornerRadius: Look.radius - 4).stroke(Look.line))
		.contentShape(.rect)
	}
}
