# The AI Game

A mobile-first arcade game about keeping an AI model on track.

Move between lanes to collect signal, context, guardrail, fine-tune, and RAG tokens. Avoid hallucination bugs, drift, and prompt injections. Runs earn data, and data buys persistent upgrades.

Each benchmark has its own hazard mix and pacing. Finished runs show a summary with score, data earned, best streak, blocks, hits, and survival time.

Unlockable model cores add small perks: Sentinel starts with more guard, Retriever extends RAG pull, and Sprinter earns more passive score.

Benchmarks also include objectives. Alignment asks for a streak, RAG Sprint asks for retrieval tokens, Agent Mode asks you to survive, and Vision Stack asks you to collect from every lane.

Fresh profiles get a guided first run with intentional token spawns. During a run, the pause menu shows objective progress, selected core, score, and resume/restart/quit options.

Daily Benchmark mode generates a date-based fixed-seed challenge and saves the day's best result separately.

Near misses against adjacent-lane hazards award bonus score. Three near misses grant a focus guard, and clean high-scoring runs can earn a perfect-route data bonus.

Badges persist across runs for milestones like first run, objective clear, daily clear, focus guard, and perfect route.

Settings include sound, haptics, and calm mode. Calm mode disables hit shake and flash while keeping the game readable.

The menu shows recent completed runs with score, data earned, and objective/perfect/daily tags.

The token codex explains each symbol. Collecting good tokens across different lanes builds an adaptive route chain for bonus score and a badge.

Each model core earns mastery XP from completed runs. Core cards and the HUD show levels, and level 3 unlocks the Core Mastery badge.

Daily contracts rotate alongside the daily benchmark, adding an optional side objective for bonus score, data, and a Contract Clear badge.

Difficulty modes let you choose Standard, Hard, or Chaos pressure. Harder modes spawn faster, weigh hazards more heavily, and pay extra data and mastery XP.

System events appear mid-run as short incidents such as data surges, safety audits, mitigation drills, latency spikes, routing shifts, and red-team tests. Clearing them grants score, data value, and an Incident Clear badge.

Save tools let players export progress as JSON, import a backup, and reset only after typing a confirmation phrase.

## Play

Open `index.html` in a browser.

Controls:

- Swipe left or right on the board.
- Tap a lane to jump there.
- Use the on-screen arrows.
- On desktop, use `A`/`D` or the arrow keys.

## Android path

The game is a dependency-free PWA at runtime. It includes install metadata, an install card, an SVG maskable icon, and a service worker for offline caching when served over `http://localhost` or HTTPS.

Local PWA test server:

```powershell
npm run serve:https
```

The server uses `certs/localhost-key.pem` and `certs/localhost-cert.pem` when present. Without certs it falls back to `http://localhost:8443`, which browsers still treat as secure enough for service-worker testing.

Android packaging scaffolding is included for both Capacitor and a Trusted Web Activity path:

- `capacitor.config.json` points the Android wrapper at this static web directory.
- `twa-manifest.json` captures the TWA package/app metadata to adapt once a production HTTPS host exists.
- `package.json` includes Capacitor scripts for install/sync once dependencies are available.

Automated smoke QA:

```powershell
npm run qa:smoke
```

Manual QA coverage is tracked in `QA.md`.

## Prototype log

- v1.1: Release-candidate hardening with install UX, export/import/reset safeguards, expanded missions/events, token silhouettes, PWA service-worker updates, QA scripts, HTTPS server scaffold, and Android packaging configuration.
- v1.0: Adds mid-run system events with live incident objectives, spawn bias, score rewards, data value, summaries, history tags, and the Incident Clear badge.
- v0.9: Adds Standard, Hard, and Chaos difficulty modes with scaled hazards, pacing, data rewards, mastery XP, summaries, and recent-run history.
- v0.8: Daily contracts, core mastery, recent-run history, adaptive routes, token codex, settings, badges, near misses, perfect routes, daily benchmark, pause menu, tutorial, model cores, objectives, run summaries, and PWA basics.
