import Observation
import SafariServices
import SwiftUI

/* BetterBARMM for iOS: Home, Parliament, Places, Explore and You, over the feed in Feed.swift. Which tabs show
   follows the reader's choice of workspaces (Workspaces.swift); Home and You are always there. */

enum AppTab: String { case news, parliament, places, explore, you }

@MainActor @Observable
final class Router {
	static let shared = Router()
	/// `-startTab places` on launch opens a tab directly (screenshots, testing).
	var tab: AppTab = UserDefaults.standard.string(forKey: "startTab").flatMap(AppTab.init(rawValue:)) ?? .news
	/// Set from You to open the first-launch steps again.
	var setup = false
}

@main
struct BetterBARMMApp: App {
	@UIApplicationDelegateAdaptor private var delegate: AppDelegate
	@Environment(\.scenePhase) private var phase
	@State private var store = Store()
	@State private var router = Router.shared
	/// Read once at launch (a `-onboarded YES` launch argument counts), written when the first-launch screen closes.
	@State private var onboarded = UserDefaults.standard.bool(forKey: "onboarded")
	@AppStorage(Pref.workspacesOff) private var off = ""
	@AppStorage(Pref.appearance) private var appearance = "system"

	/// A tab's label: the Phosphor icon, filled while the tab is open.
	private func tab(_ title: String, _ icon: String, _ id: AppTab) -> some View {
		Label { Text(title) } icon: { Image("ph-\(icon)\(router.tab == id ? "-fill" : "")") }
	}

	private var explore: Bool { Workspaces.all.contains { $0.tab == nil && Workspaces.on($0.id, off) } }

	var body: some Scene {
		WindowGroup {
			TabView(selection: $router.tab) {
				NewsView().tabItem { tab("Home", "house", .news) }.tag(AppTab.news)
				if Workspaces.on("legislation", off) {
					ParliamentView().tabItem { tab("Parliament", "bank", .parliament) }.tag(AppTab.parliament)
				}
				if Workspaces.on("travel", off) {
					PlacesView().tabItem { tab("Places", "map", .places) }.tag(AppTab.places)
				}
				if explore {
					NavigationStack { ExploreView() }.tabItem { tab("Explore", "squares", .explore) }.tag(AppTab.explore)
				}
				YouView().tabItem { tab("You", "user", .you) }.tag(AppTab.you)
			}
			.fullScreenCover(isPresented: .constant(!onboarded || router.setup)) {
				Onboarding { onboarded = true; router.setup = false; UserDefaults.standard.set(true, forKey: "onboarded") }
			}
			.tint(.brand)
			.preferredColorScheme(appearance == "light" ? .light : appearance == "dark" ? .dark : nil)
			.environment(store)
		}
		.onChange(of: phase) { _, now in if now == .background { Alerts.schedule() } }
		.backgroundTask(.appRefresh(Alerts.taskID)) {
			await Alerts.check()
			await MainActor.run { Alerts.schedule() }
		}
	}
}

/// Stories the reader saved, kept whole so they outlive the feed's five weeks.
enum Saved {
	static let key = "savedStories"
	static func list(_ data: Data) -> [Story] { (try? JSONDecoder().decode([Story].self, from: data)) ?? [] }
	static func toggled(_ story: Story, in data: Data) -> Data {
		var list = list(data)
		if let i = list.firstIndex(where: { $0.id == story.id }) { list.remove(at: i) } else { list.insert(story, at: 0) }
		return (try? JSONEncoder().encode(list)) ?? data
	}
}

// MARK: - Shared pieces

/// A story or document opens in Safari's own sheet, so the reader never leaves the app.
struct SafariSheet: UIViewControllerRepresentable {
	let url: URL
	func makeUIViewController(context _: Context) -> SFSafariViewController { SFSafariViewController(url: url) }
	func updateUIViewController(_: SFSafariViewController, context _: Context) {}
}

extension URL: @retroactive Identifiable { public var id: String { absoluteString } }

/// Photos come from www, travel and Wikimedia Commons. One session for all of them: a disk cache so a photo is
/// fetched once, a few connections per host, and the descriptive User-Agent Wikimedia's policy asks clients for.
enum Images {
	static let session: URLSession = {
		let config = URLSessionConfiguration.default
		config.httpAdditionalHeaders = ["User-Agent": "BetterBARMM-iOS/1.0 (https://betterbarmm.com)"]
		config.httpMaximumConnectionsPerHost = 4
		config.urlCache = URLCache(memoryCapacity: 50 << 20, diskCapacity: 300 << 20)
		config.requestCachePolicy = .returnCacheDataElseLoad
		return URLSession(configuration: config)
	}()

	static func load(_ url: URL) async -> UIImage? {
		for attempt in 0 ..< 2 {
			if let (data, response) = try? await session.data(from: url),
			   (response as? HTTPURLResponse)?.statusCode == 200,
			   let image = UIImage(data: data) {
				return await image.byPreparingForDisplay() ?? image
			}
			if attempt == 0 { try? await Task.sleep(for: .seconds(1)) }
		}
		return nil
	}
}

/// A remote photo that fills its frame, with a quiet placeholder while it loads.
struct RemoteImage: View {
	let url: String?
	@State private var image: UIImage?
	@State private var failed = false

	var body: some View {
		Rectangle().fill(.quaternary)
			.overlay {
				if let image {
					Image(uiImage: image).resizable().scaledToFill()
				} else if failed {
					Icon("image", size: 26).foregroundStyle(.tertiary)
				}
			}
			.clipped()
			.task(id: url) {
				guard let url = url.flatMap(URL.init(string:)) else { failed = true; return }
				image = await Images.load(url)
				failed = image == nil
			}
	}
}
