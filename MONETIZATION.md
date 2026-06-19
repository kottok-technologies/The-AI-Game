# Monetization Plan

## MVP Model

- Free core game.
- Optional Supporter Pack for cosmetics only.
- Optional rewarded ads after a run for bonus data.
- No paid stat upgrades, paid difficulty advantages, or forced ads.

## Current Debug Implementation

The game exposes two browser/native bridge points:

- `window.TheAIGameBilling.buySupporter()`
- `window.TheAIGameAds.showRewarded()`

If those functions are absent, debug builds use local test flows:

- Supporter Pack asks for confirmation and unlocks themes plus the Supporter badge.
- Rewarded ads simulate completion and grant the post-run data bonus.

## Production Android Work

To make monetization real on Google Play:

- Add Google Play Billing through a Capacitor plugin or small native bridge.
- Implement `window.TheAIGameBilling.buySupporter()` so it resolves `true` only after a verified purchase.
- Add AdMob rewarded ads through a Capacitor plugin or native bridge.
- Implement `window.TheAIGameAds.showRewarded()` so it resolves `true` only after the rewarded ad completion callback.
- Store/restore purchase entitlement from Google Play Billing on app start.
- Keep rewarded ads optional and post-run only.

## Product Boundaries

- Supporter Pack should remain cosmetic/supportive.
- Rewarded ads should not be required for progression.
- If interstitial ads are ever added, Supporter Pack should remove them.
