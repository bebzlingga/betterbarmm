import SwiftUI
import UserNotifications

/* You: the reader's app — saved stories, what to be told about, which workspaces the app carries, what each
   screen shows, and how it looks. The first launch (Onboarding.swift) asks the middle two as steps. */

/// Turns the chosen topics into subscriptions, asking iOS for permission the first time.
func follow(_ chosen: Set<String>) async {
	if !chosen.isEmpty, await UNUserNotificationCenter.current().notificationSettings().authorizationStatus == .notDetermined {
		_ = await Alerts.requestPermission()
	}
	for topic in Topic.allCases where topic.on != chosen.contains(topic.rawValue) { await Alerts.subscribe(topic, chosen.contains(topic.rawValue)) }
}

struct YouView: View {
	@Environment(\.openURL) private var openURL
	@AppStorage(Pref.workspacesOff) private var off = ""
	@AppStorage(Pref.topStories) private var topStories = true
	@AppStorage(Pref.newestLaws) private var newestLaws = true
	@AppStorage(Pref.stayEat) private var stayEat = true
	@State private var allowed: UNAuthorizationStatus = .notDetermined
	@State private var chosen = Set(Topic.allCases.filter(\.on).map(\.rawValue))
	@State private var checking = false
	@State private var result: String?
	@AppStorage(Saved.key) private var saved = Data()
	@AppStorage(Pref.appearance) private var appearance = "system"
	@AppStorage(Pref.textScale) private var scale = 1.0

	var body: some View {
		NavigationStack {
		ScrollView {
			VStack(alignment: .leading, spacing: 22) {
				ScreenHeader(eyebrow: "Make BetterBARMM yours", title: "You")

				// Saved
				let savedStories = Saved.list(saved)
				SectionHead(title: "Saved")
				if savedStories.isEmpty {
					Row(icon: "bookmark", title: "Nothing saved yet", detail: "Tap the bookmark on any story to keep it here.").padding(.horizontal, Look.pad)
				} else {
					ForEach(savedStories) { story in
						NavigationLink(value: story) {
							RowCard(image: story.image, kicker: story.source ?? "News", trailing: ago(story.date), title: story.title)
						}
						.buttonStyle(.plain).padding(.horizontal, Look.pad)
					}
				}

				// Follow
				SectionHead(title: "Follow")
				Text("We check a few times a day, as iOS allows, and tell you when something new lands in a topic you follow.")
					.font(.subheadline).foregroundStyle(.secondary).padding(.horizontal, Look.pad)
				if allowed == .denied {
					Button {
						if let url = URL(string: UIApplication.openSettingsURLString) { openURL(url) }
					} label: {
						HStack(spacing: 12) {
							Icon("bell", size: 20)
							Text("Notifications are off for BetterBARMM. Turn them on in Settings.").multilineTextAlignment(.leading)
						}
						.font(.subheadline).padding(16).frame(maxWidth: .infinity, alignment: .leading)
						.background(Color.orange.opacity(0.1), in: .rect(cornerRadius: 16)).foregroundStyle(.orange)
					}
					.buttonStyle(.plain).padding(.horizontal, Look.pad)
				}
				TopicList(chosen: $chosen).padding(.horizontal, Look.pad)
				Button {
					Task {
						checking = true
						let n = await Alerts.check()
						result = n == 0 ? "Nothing new since the last check." : "Sent \(n) notification\(n == 1 ? "" : "s")."
						checking = false
					}
				} label: {
					HStack { if checking { ProgressView() }; Text("Check now") }
						.font(.headline).frame(maxWidth: .infinity).frame(height: 52)
						.overlay(Capsule().stroke(Look.line, lineWidth: 1.2))
				}
				.buttonStyle(.plain).disabled(chosen.isEmpty).padding(.horizontal, Look.pad)
				if let result { Text(result).font(.footnote).foregroundStyle(.secondary).padding(.horizontal, Look.pad) }

				// Workspaces
				SectionHead(title: "Workspaces")
				Text("Choose what the app carries. Parliament and Places have their own tabs; the rest open from Explore.")
					.font(.subheadline).foregroundStyle(.secondary).padding(.horizontal, Look.pad)
				Panel {
					ForEach(Workspaces.all) { ws in
						Switch(title: ws.title, detail: ws.tab == nil ? "Opens from Explore" : "In the app", icon: ws.icon, isOn: Binding(
							get: { Workspaces.on(ws.id, off) },
							set: { off = Workspaces.toggled(ws.id, off, to: $0) }
						))
					}
				}

				// What to show
				SectionHead(title: "What to show")
				Panel {
					Switch(title: "Top stories as cards", detail: "Home", icon: "newspaper", isOn: $topStories)
					Switch(title: "Newest laws row", detail: "Parliament", icon: "seal-check", isOn: $newestLaws)
					Switch(title: "Stay and eat", detail: "Places", icon: "bed", isOn: $stayEat)
				}

				// Display
				SectionHead(title: "Display")
				Panel {
					VStack(alignment: .leading, spacing: 12) {
						Row(icon: "moon", title: "Theme", detail: "Follow the phone, or always light or dark")
						Picker("Theme", selection: $appearance) {
							Text("Automatic").tag("system")
							Text("Light").tag("light")
							Text("Dark").tag("dark")
						}
						.pickerStyle(.segmented)
					}
					.padding(.vertical, 12)
					VStack(alignment: .leading, spacing: 12) {
						Row(icon: "text-aa", title: "Story text size", detail: "For reading stories in the app")
						HStack(spacing: 14) {
							Text("A").font(.system(size: 14))
							Slider(value: $scale, in: 0.9 ... 1.4, step: 0.1).tint(.brand)
							Text("A").font(.system(size: 24, weight: .semibold))
						}
					}
					.padding(.vertical, 12)
				}

				Button { Router.shared.setup = true } label: {
					HStack(spacing: 8) { Icon("arrow-left", size: 18); Text("Set up again") }
						.font(.headline).frame(maxWidth: .infinity).frame(height: 52)
						.overlay(Capsule().stroke(Look.line, lineWidth: 1.2))
				}
				.buttonStyle(.plain).padding(.horizontal, Look.pad).padding(.top, 8)

				// About
				VStack(alignment: .leading, spacing: 8) {
					Kicker(text: "About")
					Text("BetterBARMM is an independent public-information project, not an official government app. Everything here comes from betterbarmm.com, which links each item to its source.")
						.font(.footnote).foregroundStyle(.secondary)
					Text("Version \(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0")")
						.font(.footnote).foregroundStyle(.tertiary)
				}
				.padding(.horizontal, Look.pad).padding(.top, 8).padding(.bottom, 30)
			}
			.padding(.vertical, 8)
		}
		.toolbar(.hidden, for: .navigationBar)
		.navigationDestination(for: Story.self) { StoryDetail(story: $0) }
		}
		.task { allowed = await UNUserNotificationCenter.current().notificationSettings().authorizationStatus }
		.onChange(of: chosen) { _, now in
			Task {
				await follow(now)
				allowed = await UNUserNotificationCenter.current().notificationSettings().authorizationStatus
			}
		}
	}
}

/// A bordered group of switches.
private struct Panel<Content: View>: View {
	@ViewBuilder var content: Content
	var body: some View {
		VStack(spacing: 0) { content }
			.padding(.horizontal, 14)
			.background(.background, in: .rect(cornerRadius: Look.radius))
			.overlay(RoundedRectangle(cornerRadius: Look.radius).stroke(Look.line))
			.padding(.horizontal, Look.pad)
	}
}

private struct Switch: View {
	let title: String, detail: String, icon: String
	@Binding var isOn: Bool
	var body: some View {
		Toggle(isOn: $isOn) {
			Row(icon: icon, title: title, detail: detail, tint: isOn ? .brand : .secondary)
		}
		.tint(.brand)
		.padding(.vertical, 10)
		.overlay(alignment: .bottom) { Rectangle().fill(Look.line).frame(height: 1).padding(.leading, 54) }
	}
}

/// A settings line: a soft tinted circle with its icon, the title, and a quieter line under it.
private struct Row: View {
	let icon: String, title: String, detail: String
	var tint: Color = .brand
	var body: some View {
		HStack(spacing: 12) {
			Icon(icon, size: 19).foregroundStyle(tint)
				.frame(width: 40, height: 40).background(tint.opacity(0.1), in: Circle())
			VStack(alignment: .leading, spacing: 2) {
				Text(title).font(.body.weight(.medium))
				Text(detail).font(.caption).foregroundStyle(.secondary)
			}
		}
	}
}
