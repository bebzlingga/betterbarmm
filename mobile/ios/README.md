# BetterBARMM for iOS

A native SwiftUI app (iOS 17+) with five tabs:

- **Home**: latest stories and the incidents log.
- **Parliament**: bills and acts.
- **Places**: places, stays and eats.
- **Explore**: every other workspace, opened in the app.
- **You**: topic subscriptions, saved stories, workspaces and display settings.

It reads the read-only feed that www publishes at `https://betterbarmm.com/app/v1/*.json`. `apps/www/scripts/build-app-feed.mjs` writes that feed on every www build, so new data reaches the app without an App Store release.

## Build

```sh
cd mobile/ios
xcodegen            # writes BetterBARMM.xcodeproj from project.yml (the .xcodeproj is not committed)
open BetterBARMM.xcodeproj
```

Before the feed is live in production, a debug run can read it from this Mac:

```sh
node apps/www/scripts/build-app-feed.mjs
cd apps/www/public && python3 -m http.server 8765
# Xcode → Scheme → Run → Arguments: -feedBase http://localhost:8765
```

More launch arguments for screenshots: `-onboarded YES` (skip the first-launch screens), `-startTab places`
(news, parliament, places, explore, you), `-openPlace bud-bongao` and `-openStory YES`.

Icons are [Phosphor](https://phosphoricons.com), the set the websites use. `node mobile/ios/scripts/icons.mjs` writes
the ones listed in it into the asset catalog as vector templates (`ph-<name>`, `ph-<name>-fill`).

## Reader settings

The **You** tab holds the reader's settings. Every setting is stored on the phone, and no account is needed.

- **Workspaces.** Readers choose which workspaces the app carries; `Workspaces.swift` mirrors `apps/www/app/_lib/workspaces.ts`.
  - Parliament and Places have native tabs, and switching one off removes its tab.
  - The other workspaces open from **Explore**.
- **What each screen shows:**
  - the top-stories hero on Home;
  - the newest-laws row on Parliament;
  - Stay and Eat on Places.
- **Followed topics and saved stories.**
- **Display:** the theme and the story text size.

On first launch, readers pick their workspaces and then their topics.

## Alerts

Readers choose topics: news, bills, new acts, and incidents.

- **Version 1 (no server).** iOS background refresh wakes the app a few times a day. The app compares the feed manifest's newest `id`s with the ones it has already seen, then posts a local notification for anything new. Subscribing marks everything already published as seen, so turning a topic on doesn't set off a flood of notifications.
- **Upgrade to instant push.** This needs:
  - an Apple Developer account and an APNs key;
  - a small store of device tokens per topic;
  - a job after each www deploy that diffs the manifest and sends the pushes.

  Topics, ids and the tap handling (`userInfo["tab"]`) stay the same.

## Before the App Store

1. Set `DEVELOPMENT_TEAM` in project.yml.
2. Deploy www so `/app/v1/` is live.
3. Add a privacy policy URL. The app collects nothing, so the privacy label is "Data Not Collected".
4. Take App Store screenshots.
