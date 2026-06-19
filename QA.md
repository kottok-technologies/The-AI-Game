# The AI Game QA Checklist

## Install and PWA

- Serve over `http://localhost` or HTTPS and confirm the service worker registers.
- Install from Chrome or Edge on Android and confirm standalone display.
- Reload once while offline and confirm the app shell opens.
- Confirm the install card shows useful guidance on `file://`, localhost, and HTTPS.

## Save Safety

- Export a save and confirm the JSON contains `game`, `version`, `exportedAt`, and `profile`.
- Import the exported save and confirm progress, settings, difficulty, and history return.
- Try an invalid JSON file and confirm progress is not replaced.
- Press Reset, cancel, then type `RESET` and confirm progress resets while settings remain.

## Gameplay

- Complete one run on Standard, Hard, and Chaos.
- Verify objectives for streak, retrieval, survive, lanes, powerups, block, and route missions.
- Verify daily benchmark and daily contract persistence.
- Trigger each system event and confirm live progress, completion reward, and history tag.
- Confirm calm mode removes hit shake and token pulse.

## Devices and Layout

- Test 360x740, 390x844, 412x915, 768x1024, and desktop.
- Confirm no horizontal overflow in menu, run summary, pause, and controls.
- Confirm touch, swipe, keyboard, and on-screen lane buttons all work.

## Android Packaging

- Run `npm install` when network is available.
- Run `npm run android:init`, `npm run android:add`, and `npm run android:sync`.
- Open the generated Android project in Android Studio.
- Build and run on an emulator and one physical Android device.
