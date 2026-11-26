import SwiftUI

/* The app's look, in one place. Minimal: white ground, soft grey cards, generous rounding, one accent (the
   BetterBARMM crimson), and type doing the hierarchy — a small tracked kicker over a bold title. Every screen is
   built from these pieces, so the four tabs read as one app. */

extension Color {
	/// BetterBARMM crimson, from the asset catalog (lighter in dark mode).
	static let brand = Color("AccentColor")
}

enum Look {
	static let card = Color(uiColor: .secondarySystemBackground)
	static let line = Color.primary.opacity(0.08)
	static let radius: CGFloat = 22
	static let pad: CGFloat = 20
}

/// The big header that opens each tab: a quiet line over a bold one, and a round button at the right.
struct ScreenHeader<Trailing: View>: View {
	let eyebrow: String
	let title: String
	@ViewBuilder var trailing: Trailing

	var body: some View {
		HStack(alignment: .center, spacing: 12) {
			VStack(alignment: .leading, spacing: 4) {
				Text(eyebrow).font(.subheadline).foregroundStyle(.secondary)
				Text(title).font(.system(size: 30, weight: .bold)).tracking(-0.5)
			}
			Spacer()
			trailing
		}
		.padding(.horizontal, Look.pad)
	}
}

extension ScreenHeader where Trailing == EmptyView {
	init(eyebrow: String, title: String) { self.init(eyebrow: eyebrow, title: title) { EmptyView() } }
}

/// A Phosphor icon from the asset catalog (scripts/icons.mjs), tinted like text.
struct Icon: View {
	let name: String
	var fill = false
	var size: CGFloat = 20
	init(_ name: String, fill: Bool = false, size: CGFloat = 20) { self.name = name; self.fill = fill; self.size = size }
	var body: some View {
		Image("ph-\(name)\(fill ? "-fill" : "")").resizable().renderingMode(.template).scaledToFit().frame(width: size, height: size)
	}
}

/// A round, quiet button: the bell on Home, back and share on a detail page.
struct CircleIcon: View {
	let icon: String
	var badge = false
	var body: some View {
		Icon(icon, size: 21)
			.frame(width: 46, height: 46)
			.background(.background, in: Circle())
			.overlay(Circle().stroke(Look.line))
			.overlay(alignment: .topTrailing) {
				if badge { Circle().fill(Color.brand).frame(width: 9, height: 9).offset(x: -11, y: 11) }
			}
			.foregroundStyle(.primary)
	}
}

/// Search as a pill, the way the header sits over it.
struct SearchPill: View {
	let prompt: String
	@Binding var text: String
	var body: some View {
		HStack(spacing: 10) {
			Icon("search").foregroundStyle(.secondary)
			TextField(prompt, text: $text).submitLabel(.search).autocorrectionDisabled()
			if !text.isEmpty {
				Button { text = "" } label: { Icon("x-circle", fill: true).foregroundStyle(.tertiary) }
			}
		}
		.padding(.horizontal, 18).frame(height: 52)
		.overlay(Capsule().stroke(Look.line, lineWidth: 1.2))
		.padding(.horizontal, Look.pad)
	}
}

/// A row of filter chips; the chosen one fills with the accent.
struct ChipBar<ID: Hashable>: View {
	let items: [(id: ID, label: String, symbol: String?)]
	@Binding var selection: ID
	var body: some View {
		ScrollView(.horizontal, showsIndicators: false) {
			HStack(spacing: 8) {
				ForEach(items, id: \.id) { item in
					let on = item.id == selection
					Button { withAnimation(.snappy) { selection = item.id } } label: {
						HStack(spacing: 6) {
							if let s = item.symbol { Icon(s, fill: on, size: 16) }
							Text(item.label)
						}
						.font(.subheadline.weight(on ? .semibold : .regular))
						.padding(.horizontal, 18).frame(height: 40)
						.background(on ? AnyShapeStyle(Color.brand) : AnyShapeStyle(.clear), in: Capsule())
						.overlay(Capsule().stroke(on ? .clear : Look.line, lineWidth: 1.2))
						.foregroundStyle(on ? .white : .primary)
					}
					.buttonStyle(.plain)
				}
			}
			.padding(.horizontal, Look.pad)
		}
	}
}

/// A small, tracked, uppercase label over a title: the section, source or kind.
struct Kicker: View {
	let text: String
	var tint: Color = .secondary
	var body: some View {
		Text(text.uppercased()).font(.caption.weight(.semibold)).tracking(1.6).foregroundStyle(tint).lineLimit(1)
	}
}

/// A section heading with an optional "See all" on the right.
struct SectionHead: View {
	let title: String
	var action: (() -> Void)?
	var body: some View {
		HStack {
			Text(title).font(.title3.weight(.bold))
			Spacer()
			if let action { Button("See all", action: action).font(.subheadline.weight(.medium)) }
		}
		.padding(.horizontal, Look.pad)
	}
}

/// The large card that scrolls sideways: a photo, then kicker, title and a line of meta.
struct FeatureCard: View {
	let image: String?
	let kicker: String
	let title: String
	let meta: String
	var badge: String?
	var width: CGFloat = 290

	var body: some View {
		VStack(alignment: .leading, spacing: 0) {
			RemoteImage(url: image)
				.frame(width: width - 16, height: 190)
				.clipShape(.rect(cornerRadius: Look.radius - 6))
				.overlay(alignment: .topTrailing) {
					if let badge {
						Text(badge).font(.caption.weight(.semibold))
							.padding(.horizontal, 10).frame(height: 28)
							.background(.regularMaterial, in: Capsule()).padding(10)
					}
				}
				.padding(8)
			VStack(alignment: .leading, spacing: 8) {
				Kicker(text: kicker)
				Text(title).font(.headline).lineLimit(2).multilineTextAlignment(.leading)
					.frame(maxWidth: .infinity, minHeight: 44, alignment: .topLeading)
				Text(meta).font(.footnote).foregroundStyle(.secondary).lineLimit(1)
			}
			.padding(.horizontal, 14).padding(.top, 6).padding(.bottom, 16)
		}
		.frame(width: width)
		.background(.background, in: .rect(cornerRadius: Look.radius))
		.overlay(RoundedRectangle(cornerRadius: Look.radius).stroke(Look.line))
	}
}

/// The compact row under the cards: a square thumbnail, kicker with a time, and the title.
struct RowCard: View {
	let image: String?
	let kicker: String
	var kickerTint: Color = .secondary
	let trailing: String
	let title: String
	var subtitle: String?

	var body: some View {
		HStack(alignment: .top, spacing: 14) {
			if image != nil {
				RemoteImage(url: image).frame(width: 92, height: 92).clipShape(.rect(cornerRadius: 14))
			}
			VStack(alignment: .leading, spacing: 7) {
				HStack {
					Kicker(text: kicker, tint: kickerTint)
					Spacer(minLength: 8)
					Text(trailing).font(.caption).foregroundStyle(.secondary).lineLimit(1).layoutPriority(1)
				}
				Text(title).font(.body.weight(.medium)).lineLimit(3).multilineTextAlignment(.leading)
				if let subtitle { Text(subtitle).font(.footnote).foregroundStyle(.secondary).lineLimit(2) }
			}
		}
		.padding(10)
		.frame(maxWidth: .infinity, alignment: .leading)
		.background(.background, in: .rect(cornerRadius: Look.radius - 4))
		.overlay(RoundedRectangle(cornerRadius: Look.radius - 4).stroke(Look.line))
		.contentShape(.rect)
	}
}

/// A detail page's top bar: round back on the left, round actions on the right, floating over the content.
struct DetailBar<Actions: View>: View {
	@Environment(\.dismiss) private var dismiss
	@ViewBuilder var actions: Actions
	var body: some View {
		HStack(spacing: 10) {
			Button { dismiss() } label: { CircleIcon(icon: "arrow-left") }
			Spacer()
			actions
		}
		.buttonStyle(.plain)
		.padding(.horizontal, Look.pad)
	}
}

/// The filled call to action at the foot of a detail page.
struct PrimaryButton: View {
	let title: String
	let action: () -> Void
	var body: some View {
		Button(action: action) {
			Text(title).font(.headline).frame(maxWidth: .infinity).frame(height: 56)
				.background(Color.brand, in: Capsule()).foregroundStyle(.white)
		}
		.buttonStyle(.plain)
	}
}

/// WordPress serves "photo-150x150.jpg" for a thumbnail; the photo itself is "photo.jpg". Big cards want that.
func fullSize(_ url: String?) -> String? {
	guard let url, let r = url.range(of: #"-\d+x\d+(?=\.\w+$)"#, options: .regularExpression) else { return url }
	return url.replacingCharacters(in: r, with: "")
}

/// "3 hours ago", or the date for anything older than a week.
func ago(_ date: Date?) -> String {
	guard let date else { return "" }
	return date > .now.addingTimeInterval(-7 * 86400) ? date.formatted(.relative(presentation: .named)) : date.formatted(.dateTime.day().month(.abbreviated))
}

/// Lays out its children left to right, wrapping onto a new line when the row is full — pills, tags.
struct Flow: Layout {
	var spacing: CGFloat = 8
	func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
		rows(proposal.width ?? .infinity, subviews).last.map { CGSize(width: proposal.width ?? $0.width, height: $0.maxY) } ?? .zero
	}
	func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
		for row in rows(bounds.width, subviews) {
			for (i, x) in zip(row.items, row.xs) {
				subviews[i].place(at: CGPoint(x: bounds.minX + x, y: bounds.minY + row.y), proposal: .unspecified)
			}
		}
	}
	private struct Row { var items: [Int] = [], xs: [CGFloat] = [], y: CGFloat = 0, width: CGFloat = 0, height: CGFloat = 0; var maxY: CGFloat { y + height } }
	private func rows(_ width: CGFloat, _ subviews: Subviews) -> [Row] {
		var rows = [Row()]
		for (i, view) in subviews.enumerated() {
			let size = view.sizeThatFits(.unspecified)
			if rows[rows.count - 1].width > 0, rows[rows.count - 1].width + spacing + size.width > width {
				rows.append(Row(y: rows[rows.count - 1].maxY + spacing))
			}
			var row = rows[rows.count - 1]
			let x = row.width == 0 ? 0 : row.width + spacing
			row.items.append(i); row.xs.append(x)
			row.width = x + size.width; row.height = max(row.height, size.height)
			rows[rows.count - 1] = row
		}
		return rows
	}
}

