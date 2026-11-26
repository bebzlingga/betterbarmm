import BackgroundTasks
import Foundation
import Observation
import UIKit
import UserNotifications

/* Subscriptions: a reader picks topics, and the app tells them when something new lands in one.

   Version 1 needs no server. iOS wakes the app for a background refresh (when it decides to — typically every
   few hours, more often for apps that are used), the app reads the feed's manifest, compares each subscribed
   topic's newest ids with the ones it has already seen, and posts a local notification for the difference.

   Real push (instant, and arriving even if the app has not been opened in weeks) is the upgrade: it needs an Apple
   Developer account, an APNs key and a job that runs after each deploy. The manifest's ids are the same ones that
   job would send, so the topics and the tap handling below stay as they are. */

enum Topic: String, CaseIterable, Identifiable {
	case news, bills, acts, incidents
	var id: String { rawValue }
	var label: String {
		switch self {
		case .news: "Latest news"
		case .bills: "Bills filed or moving"
		case .acts: "New laws (Bangsamoro Autonomy Acts)"
		case .incidents: "Incidents and accidents"
		}
	}
	/// The Phosphor icon (Assets.xcassets/Icons).
	var symbol: String {
		switch self {
		case .news: "newspaper"
		case .bills: "file-text"
		case .acts: "seal-check"
		case .incidents: "warning"
		}
	}
	/// The topic circle's label.
	var short: String {
		switch self {
		case .news: "News"
		case .bills: "Bills"
		case .acts: "New laws"
		case .incidents: "Incidents"
		}
	}
	var tab: AppTab {
		switch self {
		case .news, .incidents: .news
		case .bills, .acts: .parliament
		}
	}
	var on: Bool {
		get { UserDefaults.standard.bool(forKey: "topic.\(rawValue)") }
		nonmutating set { UserDefaults.standard.set(newValue, forKey: "topic.\(rawValue)") }
	}
	/// The ids already seen, so only what is new since then is announced.
	var seen: Set<String> {
		get { Set(UserDefaults.standard.stringArray(forKey: "seen.\(rawValue)") ?? []) }
		nonmutating set { UserDefaults.standard.set(Array(newValue.prefix(400)), forKey: "seen.\(rawValue)") }
	}
}

enum Alerts {
	static let taskID = "com.betterbarmm.app.refresh"

	static func requestPermission() async -> Bool {
		(try? await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])) ?? false
	}

	/// Turns a topic on, marking everything already published as seen — subscribing should not set off twenty
	/// notifications about last week.
	static func subscribe(_ topic: Topic, _ on: Bool) async {
		topic.on = on
		if on, let manifest = try? await manifest() { topic.seen.formUnion(manifest.files[topic.rawValue]?.latest ?? []) }
		schedule()
	}

	/// The whole check: what is new in each subscribed topic, announced. Returns how many notifications it posted.
	@discardableResult
	static func check() async -> Int {
		let topics = Topic.allCases.filter(\.on)
		guard !topics.isEmpty, let manifest = try? await manifest() else { return 0 }
		var posted = 0
		for topic in topics {
			let latest = manifest.files[topic.rawValue]?.latest ?? []
			let fresh = latest.filter { !topic.seen.contains($0) }
			topic.seen.formUnion(latest)
			guard !fresh.isEmpty else { continue }
			let titles = await titles(for: topic, ids: fresh)
			await post(topic, titles: titles, firstID: fresh[0])
			posted += 1
		}
		return posted
	}

	/// Asks iOS for the next background refresh. It treats the date as "no earlier than".
	static func schedule() {
		guard Topic.allCases.contains(where: \.on) else { return }
		let request = BGAppRefreshTaskRequest(identifier: taskID)
		request.earliestBeginDate = .now.addingTimeInterval(30 * 60)
		try? BGTaskScheduler.shared.submit(request)
	}

	private static func manifest() async throws -> Manifest {
		let (data, _) = try await URLSession.shared.data(from: Feed.url("manifest"))
		return try JSONDecoder().decode(Manifest.self, from: data)
	}

	private static func titles(for topic: Topic, ids: [String]) async -> [String] {
		let wanted = Set(ids)
		switch topic {
		case .news: return ((try? await Store.fetch("news") as [Story]) ?? []).filter { wanted.contains($0.id) }.map(\.title)
		case .incidents: return ((try? await Store.fetch("incidents") as [Incident]) ?? []).filter { wanted.contains($0.id) }.map(\.title)
		case .bills:
			return ((try? await Store.fetch("bills") as [Bill]) ?? []).filter { wanted.contains($0.id) }
				.map { "Bill \($0.number): \($0.title)" + ($0.status.map { " — \($0)" } ?? "") }
		case .acts: return ((try? await Store.fetch("acts") as [Act]) ?? []).filter { wanted.contains($0.id) }.map { "BAA \($0.number): \($0.title)" }
		}
	}

	/// One notification per topic per check: the headline itself when there is one, a count when there are more.
	private static func post(_ topic: Topic, titles: [String], firstID: String) async {
		let content = UNMutableNotificationContent()
		let count = max(titles.count, 1)
		content.title = count == 1 ? topic.label : "\(count) new · \(topic.label)"
		content.body = titles.first ?? "Open BetterBARMM to see what’s new."
		if count > 1, titles.count > 1 { content.body += "\n+ \(titles.count - 1) more" }
		content.sound = .default
		content.threadIdentifier = topic.rawValue
		content.userInfo = ["tab": topic.tab.rawValue]
		let request = UNNotificationRequest(identifier: "\(topic.rawValue)-\(firstID)", content: content, trigger: nil)
		try? await UNUserNotificationCenter.current().add(request)
	}
}

/// Shows notifications while the app is open, and opens the right tab when one is tapped.
final class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
	func application(_ application: UIApplication, didFinishLaunchingWithOptions _: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
		UNUserNotificationCenter.current().delegate = self
		return true
	}

	func userNotificationCenter(_: UNUserNotificationCenter, willPresent _: UNNotification) async -> UNNotificationPresentationOptions {
		[.banner, .sound, .list]
	}

	func userNotificationCenter(_: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
		if let raw = response.notification.request.content.userInfo["tab"] as? String, let tab = AppTab(rawValue: raw) {
			await MainActor.run { Router.shared.tab = tab }
		}
	}
}
