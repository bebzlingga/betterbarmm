import SwiftUI

/* Parliament: the bills on record with where each stands, and the laws passed. The newest laws lead as large
   number cards; the full record of each stays on legislation.betterbarmm.com, one tap away. */

enum ParliamentSection: Hashable { case bills, laws }

struct ParliamentView: View {
	@Environment(Store.self) private var store
	@State private var section: ParliamentSection = .bills
	@AppStorage(Pref.newestLaws) private var newestLaws = true
	@State private var query = ""
	@State private var reading: URL?

	var body: some View {
		NavigationStack {
			ScrollView {
				LazyVStack(alignment: .leading, spacing: 22) {
					ScreenHeader(eyebrow: "Bangsamoro Parliament", title: "Bills and laws") {
						Button { reading = URL(string: "https://legislation.betterbarmm.com/how-parliament-works") } label: { CircleIcon(icon: "question") }
							.buttonStyle(.plain)
					}
					SearchPill(prompt: "Search by title or number", text: $query)
					ChipBar(items: [(.bills, "Bills", "file-text"), (.laws, "Laws", "seal-check")], selection: $section)

					if section == .bills {
						if newestLaws, query.isEmpty, !store.acts.isEmpty {
							SectionHead(title: "Newest laws") { section = .laws }
							ScrollView(.horizontal, showsIndicators: false) {
								LazyHStack(spacing: 14) {
									ForEach(store.acts.prefix(6)) { act in NavigationLink(value: act) { LawCard(act: act) }.buttonStyle(.plain) }
								}
								.padding(.horizontal, Look.pad)
							}
						}
						SectionHead(title: query.isEmpty ? "Bills, newest first" : "Bills")
						ForEach(bills) { bill in
							NavigationLink(value: bill) {
								RowCard(image: nil, kicker: "Bill \(bill.number) · \(bill.status ?? "Filed")", kickerTint: statusTint(bill.status),
								        trailing: Dates.pretty(bill.asOf), title: bill.title, subtitle: bill.summary)
							}
							.buttonStyle(.plain).padding(.horizontal, Look.pad)
						}
					} else {
						SectionHead(title: "Bangsamoro Autonomy Acts")
						ForEach(acts) { act in
							NavigationLink(value: act) {
								RowCard(image: nil, kicker: "BAA \(act.number)", kickerTint: .brand, trailing: Dates.pretty(act.date),
								        title: act.title, subtitle: act.category)
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
			.toolbar(.hidden, for: .navigationBar)
			.navigationDestination(for: Bill.self) { BillDetail(bill: $0) }
			.navigationDestination(for: Act.self) { ActDetail(act: $0) }
			.sheet(item: $reading) { SafariSheet(url: $0).ignoresSafeArea() }
		}
	}

	private var bills: [Bill] {
		query.isEmpty ? store.bills : store.bills.filter { $0.title.localizedCaseInsensitiveContains(query) || "\($0.number)" == query || ($0.summary ?? "").localizedCaseInsensitiveContains(query) }
	}
	private var acts: [Act] {
		query.isEmpty ? store.acts : store.acts.filter { $0.title.localizedCaseInsensitiveContains(query) || "\($0.number)" == query || ($0.category ?? "").localizedCaseInsensitiveContains(query) }
	}
}

/// A status reads as how far a bill has got: early, in committee, passed.
func statusTint(_ status: String?) -> Color {
	let s = (status ?? "").lowercased()
	if s.contains("approved") || s.contains("enacted") || s.contains("third") { return .green }
	if s.contains("committee") { return .purple }
	if s.contains("second") { return .orange }
	return .blue
}

/// A law as a card: its number large on a soft tint, the title under it.
private struct LawCard: View {
	let act: Act
	var body: some View {
		VStack(alignment: .leading, spacing: 10) {
			HStack(alignment: .top) {
				VStack(alignment: .leading, spacing: 2) {
					Text("BAA").font(.caption.weight(.semibold)).tracking(1.6)
					Text("\(act.number)").font(.system(size: 44, weight: .bold)).monospacedDigit()
				}
				.foregroundStyle(Color.brand)
				Spacer()
				Icon("seal-check", fill: true, size: 26).foregroundStyle(Color.brand.opacity(0.85))
			}
			Spacer(minLength: 0)
			Text(act.title).font(.headline).lineLimit(3).multilineTextAlignment(.leading)
			Text(Dates.pretty(act.date)).font(.footnote).foregroundStyle(.secondary)
		}
		.padding(18)
		.frame(width: 230, height: 210, alignment: .topLeading)
		.background(Color.brand.opacity(0.07), in: .rect(cornerRadius: Look.radius))
	}
}

/// A labelled fact on a detail page.
private struct Fact: View {
	let label: String, value: String
	var body: some View {
		HStack(alignment: .firstTextBaseline) {
			Text(label).foregroundStyle(.secondary)
			Spacer(minLength: 16)
			Text(value).multilineTextAlignment(.trailing)
		}
		.font(.subheadline)
		.padding(.vertical, 12)
		.overlay(alignment: .bottom) { Rectangle().fill(Look.line).frame(height: 1) }
	}
}

private struct BillDetail: View {
	let bill: Bill
	@State private var reading: URL?
	var body: some View {
		ScrollView {
			VStack(alignment: .leading, spacing: 18) {
				Kicker(text: "Bill No. \(bill.number)", tint: statusTint(bill.status))
				Text(bill.title).font(.system(size: 28, weight: .bold)).tracking(-0.4)
				if let summary = bill.summary { Text(summary).font(.title3).foregroundStyle(.secondary).lineSpacing(4) }
				VStack(spacing: 0) {
					Fact(label: "Where it stands", value: bill.status ?? "Filed")
					if let asOf = bill.asOf { Fact(label: "As of", value: Dates.pretty(asOf)) }
					if let tags = bill.tags, !tags.isEmpty {
						Fact(label: "Subjects", value: tags.map { $0.replacingOccurrences(of: "_", with: " ").capitalized }.joined(separator: ", "))
					}
				}
				PrimaryButton(title: "Full record on BetterBARMM") { reading = URL(string: bill.url) }.padding(.top, 8)
				Text("Readings, committee referral, authors and the text, as Parliament published them.")
					.font(.footnote).foregroundStyle(.secondary)
			}
			.padding(.horizontal, Look.pad).padding(.top, 76).padding(.bottom, 30)
		}
		.overlay(alignment: .top) {
			DetailBar { if let url = URL(string: bill.url) { ShareLink(item: url) { CircleIcon(icon: "send") } } }
				.padding(.top, 8).background(.background.opacity(0.92))
		}
		.toolbar(.hidden, for: .navigationBar)
		.sheet(item: $reading) { SafariSheet(url: $0).ignoresSafeArea() }
	}
}

private struct ActDetail: View {
	let act: Act
	@State private var reading: URL?
	var body: some View {
		ScrollView {
			VStack(alignment: .leading, spacing: 18) {
				Kicker(text: "Bangsamoro Autonomy Act No. \(act.number)", tint: .brand)
				Text(act.title).font(.system(size: 28, weight: .bold)).tracking(-0.4)
				if let official = act.officialTitle {
					Text(official.capitalized(with: nil)).font(.body).foregroundStyle(.secondary).lineSpacing(4)
				}
				VStack(spacing: 0) {
					if let date = act.date { Fact(label: "Enacted", value: Dates.pretty(date)) }
					if let category = act.category { Fact(label: "Subject", value: category) }
				}
				PrimaryButton(title: "Full record on BetterBARMM") { reading = URL(string: act.url) }.padding(.top, 8)
				if let pdf = act.pdf {
					Button { reading = URL(string: pdf) } label: {
						Label { Text("Read the act itself (PDF)") } icon: { Icon("file-text", size: 18) }
							.font(.headline).frame(maxWidth: .infinity).frame(height: 52)
							.overlay(Capsule().stroke(Look.line, lineWidth: 1.2))
					}
					.buttonStyle(.plain)
				}
			}
			.padding(.horizontal, Look.pad).padding(.top, 76).padding(.bottom, 30)
		}
		.overlay(alignment: .top) {
			DetailBar { if let url = URL(string: act.url) { ShareLink(item: url) { CircleIcon(icon: "send") } } }
				.padding(.top, 8).background(.background.opacity(0.92))
		}
		.toolbar(.hidden, for: .navigationBar)
		.sheet(item: $reading) { SafariSheet(url: $0).ignoresSafeArea() }
	}
}
