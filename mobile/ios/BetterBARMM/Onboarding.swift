import SwiftUI

/* The first launch, in three steps, each one page that scrolls with its buttons at the end of it:

   1. Welcome — a photograph of the region, what the app is, and the three things it carries natively.
   2. Workspaces — which of the site's workspaces the app should carry, as pills under the site's own headings.
      Only the three with native screens start chosen; the reader adds the rest.
   3. Follow — what to be told about, as rows that say what each topic sends.

   The welcome photograph ships in the app, so the first screen never waits on the network. */

struct Onboarding: View {
	let done: () -> Void
	@AppStorage(Pref.workspacesOff) private var off = ""
	@State private var step = UserDefaults.standard.integer(forKey: "onboardStep") // `-onboardStep 2` on launch (screenshots)
	/// A first launch starts from a light default; "Set up again" starts from the reader's current choices.
	@State private var workspaces: Set<String> = UserDefaults.standard.bool(forKey: "onboarded")
		? Set(Workspaces.all.map(\.id).filter { Workspaces.on($0, UserDefaults.standard.string(forKey: Pref.workspacesOff) ?? "") })
		: ["legislation", "travel", "incidents"]
	@State private var topics: Set<String> = UserDefaults.standard.bool(forKey: "onboarded")
		? Set(Topic.allCases.filter(\.on).map(\.rawValue))
		: [Topic.news.rawValue, Topic.bills.rawValue]

	var body: some View {
		ScrollView(showsIndicators: false) {
			Group {
				switch step {
				case 0: welcome
				case 1: chooseWorkspaces
				default: chooseTopics
				}
			}
			.id(step)
			.transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity), removal: .opacity))
		}
		.scrollBounceBehavior(.basedOnSize)
		// Swipe right to go back a step, as everywhere else in iOS.
		.gesture(DragGesture(minimumDistance: 30).onEnded { drag in
			if step > 0, drag.translation.width > 80, abs(drag.translation.height) < 60 { back() }
		})
		.ignoresSafeArea(edges: step == 0 ? .top : [])
	}

	// MARK: 1. Welcome

	private var welcome: some View {
		VStack(alignment: .leading, spacing: 0) {
			Image("welcome").resizable().scaledToFill()
				.frame(height: 470).frame(maxWidth: .infinity).clipped()
				.overlay { LinearGradient(colors: [.black.opacity(0.35), .clear, .clear, .black.opacity(0.45)], startPoint: .top, endPoint: .bottom) }
				.overlay(alignment: .bottomLeading) {
					HStack(alignment: .bottom) {
						Kicker(text: "Sitangkai, Tawi-Tawi", tint: .white)
						Spacer()
						Text("Photo: MimiAhid · CC0").font(.caption2).foregroundStyle(.white.opacity(0.8))
					}
					.padding(.horizontal, 24).padding(.bottom, 52)
				}
				.overlay(alignment: .topLeading) {
					Text("BetterBARMM").font(.headline).foregroundStyle(.white).padding(.horizontal, 24).padding(.top, 64)
				}

			VStack(alignment: .leading, spacing: 26) {
				VStack(alignment: .leading, spacing: 10) {
					Text("The Bangsamoro,\nin plain view.").font(.system(size: 34, weight: .bold)).tracking(-0.8)
					Text("News, laws, public money and places across the region — every item traced to where it came from.")
						.font(.body).foregroundStyle(.secondary)
				}
				VStack(alignment: .leading, spacing: 18) {
					Feature(icon: "newspaper", title: "News and incidents", detail: "As they are reported, from every source")
					Feature(icon: "bank", title: "Bills and laws", detail: "Every measure, and the stage it has reached")
					Feature(icon: "map", title: "Places to go", detail: "Islands, lakes and heritage, with where to stay")
				}
				VStack(spacing: 14) {
					PrimaryButton(title: "Get started") { next() }
					Text("An independent public-information project. Not an official government app.")
						.font(.caption).foregroundStyle(.secondary).multilineTextAlignment(.center)
				}
				.padding(.top, 6)
			}
			.padding(.horizontal, 24).padding(.top, 30).padding(.bottom, 30)
			.background(.background, in: UnevenRoundedRectangle(topLeadingRadius: 32, topTrailingRadius: 32))
			.offset(y: -32)
		}
	}

	// MARK: 2. Workspaces

	private var chooseWorkspaces: some View {
		VStack(alignment: .leading, spacing: 24) {
			StepBar(step: 1, back: back)
			StepTitle(title: "What should the app carry?", lead: "Choose the workspaces you want. You can change this any time in You.")
			HStack {
				Text("\(workspaces.count) of \(Workspaces.all.count) chosen").font(.subheadline).foregroundStyle(.secondary).monospacedDigit()
				Spacer()
				Button(workspaces.count == Workspaces.all.count ? "Clear" : "Choose all") {
					withAnimation(.snappy) { workspaces = workspaces.count == Workspaces.all.count ? [] : Set(Workspaces.all.map(\.id)) }
				}
				.font(.subheadline.weight(.semibold))
			}
			WorkspacePicker(chosen: $workspaces)
			StepButtons(primary: "Next", secondary: "Skip") {
				off = Workspaces.all.map(\.id).filter { !workspaces.contains($0) }.sorted().joined(separator: ",")
				next()
			} secondaryAction: { next() }
		}
		.padding(.horizontal, 24)
	}

	// MARK: 3. Follow

	private var chooseTopics: some View {
		VStack(alignment: .leading, spacing: 24) {
			StepBar(step: 2, back: back)
			StepTitle(title: "What should we tell you about?", lead: "We check a few times a day and let you know when something new lands.")
			TopicList(chosen: $topics)
			StepButtons(primary: topics.isEmpty ? "Finish without alerts" : "Finish", secondary: "Not now") {
				Task { await follow(topics); done() }
			} secondaryAction: { done() }
		}
		.padding(.horizontal, 24)
	}

	private func next() { withAnimation(.snappy) { step += 1 } }
	private func back() { withAnimation(.snappy) { step -= 1 } }
}

/// Back on the left, the three-step progress on the right.
private struct StepBar: View {
	let step: Int
	let back: () -> Void
	var body: some View {
		HStack {
			Button(action: back) { CircleIcon(icon: "arrow-left") }.buttonStyle(.plain)
			Spacer()
			HStack(spacing: 6) {
				ForEach(0 ..< 3) { i in Capsule().fill(i <= step ? Color.brand : Look.line).frame(width: i == step ? 26 : 12, height: 6) }
			}
			.animation(.snappy, value: step)
		}
		.padding(.top, 12)
	}
}

private struct StepTitle: View {
	let title: String, lead: String
	var body: some View {
		VStack(alignment: .leading, spacing: 10) {
			Text(title).font(.system(size: 30, weight: .bold)).tracking(-0.6)
			Text(lead).foregroundStyle(.secondary)
		}
	}
}

/// The step's buttons, after its content.
private struct StepButtons: View {
	let primary: String, secondary: String
	let primaryAction: () -> Void
	let secondaryAction: () -> Void
	var body: some View {
		VStack(spacing: 14) {
			PrimaryButton(title: primary, action: primaryAction)
			Button(secondary, action: secondaryAction).font(.subheadline).foregroundStyle(.secondary)
		}
		.padding(.top, 8).padding(.bottom, 28)
	}
}

/// One line of what the app carries, on the welcome page.
private struct Feature: View {
	let icon: String, title: String, detail: String
	var body: some View {
		HStack(spacing: 14) {
			Icon(icon, size: 22).foregroundStyle(Color.brand)
				.frame(width: 48, height: 48).background(Color.brand.opacity(0.08), in: .rect(cornerRadius: 14))
			VStack(alignment: .leading, spacing: 2) {
				Text(title).font(.headline)
				Text(detail).font(.subheadline).foregroundStyle(.secondary)
			}
		}
	}
}

/// The workspaces as pills under the website's own headings. A chosen pill takes a soft tint and a check;
/// an unchosen one is only outlined.
struct WorkspacePicker: View {
	@Binding var chosen: Set<String>
	var body: some View {
		VStack(alignment: .leading, spacing: 22) {
			ForEach(Workspaces.groups, id: \.id) { group in
				VStack(alignment: .leading, spacing: 10) {
					Kicker(text: group.title)
					Flow(spacing: 8) {
						ForEach(Workspaces.all.filter { $0.group == group.id }) { ws in
							let on = chosen.contains(ws.id)
							Button {
								withAnimation(.snappy) { if on { chosen.remove(ws.id) } else { chosen.insert(ws.id) } }
							} label: {
								HStack(spacing: 8) {
									Icon(ws.icon, fill: on, size: 17)
									Text(ws.title).font(.subheadline.weight(on ? .semibold : .regular))
									if on { Icon("check-circle", fill: true, size: 16) }
								}
								.padding(.leading, 14).padding(.trailing, on ? 10 : 16).frame(height: 42)
								.foregroundStyle(on ? Color.brand : .primary)
								.background(on ? Color.brand.opacity(0.08) : .clear, in: Capsule())
								.overlay(Capsule().stroke(on ? Color.brand.opacity(0.5) : Look.line, lineWidth: 1.2))
							}
							.buttonStyle(.plain)
						}
					}
				}
			}
		}
		.frame(maxWidth: .infinity, alignment: .leading)
	}
}

/// The topics as rows that say what each one sends; a chosen row takes a ring and a filled check.
struct TopicList: View {
	@Binding var chosen: Set<String>
	var body: some View {
		VStack(spacing: 12) {
			ForEach(Topic.allCases) { topic in
				let on = chosen.contains(topic.rawValue)
				Button {
					withAnimation(.snappy) { if on { chosen.remove(topic.rawValue) } else { chosen.insert(topic.rawValue) } }
				} label: {
					HStack(spacing: 14) {
						Icon(topic.symbol, fill: on, size: 22).foregroundStyle(on ? Color.brand : .primary)
							.frame(width: 48, height: 48)
							.background(on ? Color.brand.opacity(0.1) : Look.card, in: .rect(cornerRadius: 14))
						VStack(alignment: .leading, spacing: 3) {
							Text(topic.short).font(.headline)
							Text(topic.detail).font(.subheadline).foregroundStyle(.secondary).multilineTextAlignment(.leading)
						}
						Spacer(minLength: 8)
						Icon(on ? "check-circle" : "circle", fill: on, size: 24).foregroundStyle(on ? Color.brand : Color.secondary.opacity(0.5))
					}
					.padding(14)
					.background(.background, in: .rect(cornerRadius: Look.radius))
					.overlay(RoundedRectangle(cornerRadius: Look.radius).stroke(on ? Color.brand.opacity(0.5) : Look.line, lineWidth: on ? 1.5 : 1.2))
					.contentShape(.rect)
				}
				.buttonStyle(.plain)
			}
		}
	}
}

extension Topic {
	/// What following the topic sends, in a line.
	var detail: String {
		switch self {
		case .news: "Stories about the region, from every source"
		case .bills: "When a bill is filed or moves a stage"
		case .acts: "When a Bangsamoro Autonomy Act is signed"
		case .incidents: "Crashes, fires, floods and shootings"
		}
	}
}
