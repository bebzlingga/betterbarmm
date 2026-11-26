import Foundation
import Observation

/* The app's data: the read-only feed www publishes at /app/v1 (apps/www/scripts/build-app-feed.mjs).
   Fetched on launch and on pull-to-refresh, cached to disk, and read from the cache when offline, so the app
   always opens onto the last thing it saw. Every record has a stable `id`; Alerts.swift compares them to know
   what is new. */

enum Feed {
	/// Production by default. A debug run can point at a feed served from this Mac:
	/// launch with `-feedBase http://localhost:8765`.
	static var base: URL {
		URL(string: UserDefaults.standard.string(forKey: "feedBase") ?? "https://betterbarmm.com")!
	}
	static func url(_ name: String) -> URL { base.appending(path: "app/v1/\(name).json") }
}

// MARK: - Records

struct Story: Codable, Identifiable, Hashable {
	let id: String, title: String, source: String?, summary: String?, url: String, published: String?, image: String?
	var date: Date? { published.flatMap(Dates.iso) }
}

struct Incident: Codable, Identifiable, Hashable {
	let id: String, date: String, kind: String?, title: String, summary: String?
	let province: String?, municipality: String?, deaths: Int?, injured: Int?, lat: Double?, lon: Double?
	var place: String { [municipality, province].compactMap { $0 }.joined(separator: ", ") }
}

struct Bill: Codable, Identifiable, Hashable {
	let id: String, number: Int, title: String, summary: String?, status: String?, asOf: String?, tags: [String]?, url: String
}

struct Act: Codable, Identifiable, Hashable {
	let id: String, number: Int, title: String, officialTitle: String?, date: String?, category: String?, pdf: String?, url: String
}

struct Photo: Codable, Hashable {
	let url: String, caption: String?, author: String?, license: String?, page: String?
	var credit: String? {
		let parts = [author, license].compactMap { $0 }
		return parts.isEmpty ? nil : "Photo: " + parts.joined(separator: " · ")
	}
}

struct Place: Codable, Identifiable, Hashable {
	struct Thing: Codable, Hashable { let title: String, detail: String? }
	let id: String, name: String, kind: String, area: String, municipality: String?, summary: String?
	let detail: [String]?, beforeYouGo: [String]?, gettingThere: String?, bestTime: String?, `do`: [Thing]?
	let images: [Photo]?, url: String
}

struct Venue: Codable, Identifiable, Hashable {
	let id: String, name: String, kind: String?, area: String, municipality: String?, address: String?, note: String?
	let halal: String?, phone: String?, facebook: String?, image: Photo?, lat: Double?, lon: Double?
}

struct PlacesFile: Codable { let places: [Place], stays: [Venue], eats: [Venue] }

struct Manifest: Codable {
	struct File: Codable { let url: String, hash: String, count: Int, latest: [String] }
	let generatedAt: String, files: [String: File]
}

// MARK: - Store

@MainActor @Observable
final class Store {
	var news: [Story] = []
	var incidents: [Incident] = []
	var bills: [Bill] = []
	var acts: [Act] = []
	var places: PlacesFile = .init(places: [], stays: [], eats: [])
	var updated: Date?
	var loading = false
	var error: String?

	init() { Task { await loadCache(); await refresh() } }

	func refresh() async {
		loading = true
		defer { loading = false }
		do {
			async let n: [Story] = Self.fetch("news")
			async let i: [Incident] = Self.fetch("incidents")
			async let b: [Bill] = Self.fetch("bills")
			async let a: [Act] = Self.fetch("acts")
			async let p: PlacesFile = Self.fetch("places")
			(news, incidents, bills, acts, places) = try await (n, i, b, a, p)
			updated = .now
			error = nil
		} catch {
			// Offline or the feed is down: keep showing the cache and say so once.
			self.error = "Showing saved data — couldn’t reach BetterBARMM."
		}
	}

	private func loadCache() async {
		news = Self.cached("news") ?? []
		incidents = Self.cached("incidents") ?? []
		bills = Self.cached("bills") ?? []
		acts = Self.cached("acts") ?? []
		places = Self.cached("places") ?? places
	}

	/// Fetches one feed file and keeps a copy on disk for next launch.
	nonisolated static func fetch<T: Decodable>(_ name: String) async throws -> T {
		let (data, response) = try await URLSession.shared.data(from: Feed.url(name))
		guard (response as? HTTPURLResponse)?.statusCode == 200 else { throw URLError(.badServerResponse) }
		let value = try JSONDecoder().decode(T.self, from: data)
		try? data.write(to: cacheURL(name), options: .atomic)
		return value
	}

	nonisolated static func cached<T: Decodable>(_ name: String) -> T? {
		guard let data = try? Data(contentsOf: cacheURL(name)) else { return nil }
		return try? JSONDecoder().decode(T.self, from: data)
	}

	nonisolated static func cacheURL(_ name: String) -> URL {
		let dir = URL.cachesDirectory.appending(path: "feed")
		try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
		return dir.appending(path: "\(name).json")
	}
}

// MARK: - Formatting

enum Dates {
	private static let withFraction: ISO8601DateFormatter = {
		let f = ISO8601DateFormatter()
		f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
		return f
	}()
	private static let day: DateFormatter = {
		let f = DateFormatter()
		f.dateFormat = "yyyy-MM-dd"
		f.timeZone = TimeZone(identifier: "Asia/Manila")
		return f
	}()

	static func iso(_ s: String) -> Date? { withFraction.date(from: s) ?? ISO8601DateFormatter().date(from: s) ?? day.date(from: s) }
	static func pretty(_ s: String?) -> String {
		guard let s, let d = iso(s) else { return s ?? "" }
		return d.formatted(.dateTime.day().month(.abbreviated).year())
	}
}

/// "lanao-del-sur" → "Lanao del Sur".
func areaName(_ slug: String) -> String {
	if slug == "tawi-tawi" { return "Tawi-Tawi" }
	return slug.split(separator: "-").enumerated().map { i, w in
		i > 0 && ["del", "de", "and"].contains(w) ? String(w) : w.prefix(1).uppercased() + w.dropFirst()
	}.joined(separator: " ")
}
