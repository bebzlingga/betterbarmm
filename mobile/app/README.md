# BetterBARMM — iOS and Android

An Expo (React Native) app: one codebase for iOS and Android. It replaces the SwiftUI prototype in `mobile/ios`.

**Tabs**

- **Home:** news and incidents.
- **Parliament:** bills and laws.
- **Places:** islands, lakes, heritage, where to stay and where to eat.
- **Explore:** every other BetterBARMM workspace, opened in the app.
- **You:** saved stories, followed topics, your workspaces, and display settings.

On first launch, a three-step onboarding asks for your workspaces and the topics to follow.

**Design**

- Styled after Merdeka: dark-first and quiet, with hairlines instead of boxes and a paper palette for light mode.
- Outfit for headings, with a thin, dimmed second line; DM Sans for body text.
- Phosphor icons. The 3D icons come from `mobile/design/icons3d`, in crimson on paper and pearl on night.

**Data** comes from the read-only feed www publishes at `https://betterbarmm.com/app/v1/*.json` (`apps/www/scripts/build-app-feed.mjs`).

**Alerts** need no server. A background task checks the feed's manifest and posts a local notification for anything new in a topic you follow.

## Run

```sh
npm install
npx expo run:ios          # or run:android — a development build (notifications and background tasks need one)
```

Before the feed is live, point the app at a copy served from this Mac:

```sh
node ../../apps/www/scripts/build-app-feed.mjs
(cd ../../apps/www/public && python3 -m http.server 8765)
EXPO_PUBLIC_FEED_BASE=http://<this-mac's-LAN-IP>:8765 npx expo run:ios
```

Run `npx tsc --noEmit` and `npx expo lint` before committing. Builds and store submissions go through EAS (`npx eas-cli@latest build`).
