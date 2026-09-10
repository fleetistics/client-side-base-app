import fs from 'fs';
import path from 'path';
import { by, device, element, waitFor } from 'detox';
import { diffScreenshots, writeDiffArtifact } from './screenshotDiff';

const ARTIFACTS_DIR = path.join(__dirname, 'artifacts');
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

function saveArtifact(srcPath: string, name: string): string {
    const dest = path.join(ARTIFACTS_DIR, name);
    fs.copyFileSync(srcPath, dest);
    return dest;
}

// This suite drives the map screen with the base tiles hidden (mapType="none", forced when the
// app is launched with e2eMockMap:'true' — see MapPage.tsx / src/app.Impl/testSupport/e2e-mode.ts)
// and a fixed mock GPS coordinate (E2EMockLocation), so the only thing that should ever change
// between two screenshots of the same toggle state is the marker itself. It reproduces "icon
// drawn incorrectly when label/triangle/alert toggled" by round-tripping each toggle (off -> on ->
// off) and diffing the two "off" screenshots pixel-for-pixel: a real UI should render identically,
// so any diff is a stuck/partial marker redraw.
//
// e2eMockMap:'true' also short-circuits auth (App.tsx passes a synthetic session into
// UserSessionProvider/UserSettingsProvider — see src/app.Impl/testSupport/e2e-mode.ts) since the
// real login screen (src/app.Impl/userSession/login.tsx) has no test bypass of its own and this
// suite has no way to obtain real backend credentials.

// Marker toggles animate/settle over a couple of frames (see the two-rAF-deferred redraw() in
// user-map-marker.tsx); this is comfortably longer than that so the screenshot is never taken
// mid-transition on a slow device.
const SETTLE_MS = 1500;
// mapType="none" (MapPage.tsx) is meant to freeze the background but doesn't reliably suppress
// real tiles on this Google Maps SDK version (see the comment there), so a genuinely-unchanged
// frame can still differ by a few hundred pixels from late-arriving tile/label loads at the
// map's edges. A real stuck/partial marker redraw shows up as tens of thousands of pixels (5-10%+
// of the screen) — orders of magnitude past this — so the gap between "noise" and "bug" stays wide.
const MAX_ACCEPTABLE_DIFF_PIXELS = 300;

async function sleep(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function reachMap() {
    await waitFor(element(by.id('nav-map-button'))).toBeVisible().withTimeout(20000);
    await element(by.id('nav-map-button')).tap();

    // The marker itself isn't a reachable Detox target (react-native-maps renders Marker
    // children into an off-screen native snapshot view, invisible to Espresso's hierarchy) — this
    // sibling testID (MapPage.tsx) stands in for "map ready + marker's data is present".
    await waitFor(element(by.id('map-marker-ready'))).toExist().withTimeout(20000);
    // The Google Maps SDK takes several real seconds after "ready" to finish its own one-time
    // bootstrap (during which mapType="none" doesn't fully suppress the base layer yet — real
    // tiles briefly show through). Without this, the very first toggle test's "before" screenshot
    // lands mid-bootstrap and its "after" (taken once the SDK has settled) reads as a huge, bogus
    // diff that has nothing to do with the marker. Settling here, once, keeps that cost out of
    // every individual toggle test's timing.
    await sleep(5000);
}

// Round-trips one toggle button (off -> on -> off) and asserts the marker's "off" appearance is
// pixel-identical before and after — i.e. it fully redrew back to its original state.
async function assertRoundTripRedrawsCleanly(toggleTestId: string, label: string) {
    const before = await device.takeScreenshot(`${label}-before`);
    await element(by.id(toggleTestId)).tap();
    await sleep(SETTLE_MS);
    await element(by.id(toggleTestId)).tap();
    await sleep(SETTLE_MS);
    const after = await device.takeScreenshot(`${label}-after-roundtrip`);

    const result = diffScreenshots(before, after);
    if (result.diffPixels > MAX_ACCEPTABLE_DIFF_PIXELS) {
        const beforeArtifact = saveArtifact(before, `${label}-before.png`);
        const afterArtifact = saveArtifact(after, `${label}-after.png`);
        const diffArtifact = path.join(ARTIFACTS_DIR, `${label}-diff.png`);
        writeDiffArtifact(before, after, diffArtifact);
        throw new Error(
            `${label}: marker did not redraw cleanly after an off->on->off round trip — ` +
            `${result.diffPixels} pixels differ (${(result.diffRatio * 100).toFixed(3)}%), ` +
            `expected <= ${MAX_ACCEPTABLE_DIFF_PIXELS}. Screenshots saved to: ${beforeArtifact}, ` +
            `${afterArtifact}, diff: ${diffArtifact}`
        );
    }
}

describe('UserMapMarker redraw', () => {
    beforeAll(async () => {
        await device.launchApp({
            newInstance: true,
            launchArgs: { e2eMockMap: 'true' },
            permissions: { location: 'always', notifications: 'YES' },
        });
        // Several MapPage hooks (privacy mode, my-user, app settings) keep hitting the real
        // backend (unreachable from this device/network under the E2E auth bypass) and retry
        // indefinitely — Detox's default synchronization waits for network idle before every
        // action, turning each tap into a 30-70s stall. Nothing in this suite depends on that
        // network activity ever settling, so disable it.
        await device.disableSynchronization();
        await reachMap();
    });

    it('redraws cleanly after toggling the triangle indicator', async () => {
        await assertRoundTripRedrawsCleanly('toggle-triangle', 'triangle');
    });

    it('redraws cleanly after toggling the alert badge', async () => {
        await assertRoundTripRedrawsCleanly('toggle-alert', 'alert');
    });

    it('redraws cleanly after toggling the label', async () => {
        await assertRoundTripRedrawsCleanly('toggle-label', 'label');
    });

    it('redraws cleanly when label, triangle and alert are toggled in combination', async () => {
        const before = await device.takeScreenshot('combo-before');

        await element(by.id('toggle-triangle')).tap();
        await sleep(SETTLE_MS);
        await element(by.id('toggle-alert')).tap();
        await sleep(SETTLE_MS);
        await element(by.id('toggle-label')).tap();
        await sleep(SETTLE_MS);

        // unwind in reverse order back to the starting state
        await element(by.id('toggle-label')).tap();
        await sleep(SETTLE_MS);
        await element(by.id('toggle-alert')).tap();
        await sleep(SETTLE_MS);
        await element(by.id('toggle-triangle')).tap();
        await sleep(SETTLE_MS);

        const after = await device.takeScreenshot('combo-after-roundtrip');
        const result = diffScreenshots(before, after);
        if (result.diffPixels > MAX_ACCEPTABLE_DIFF_PIXELS) {
            throw new Error(
                `combo toggle: marker did not redraw cleanly — ${result.diffPixels} pixels differ ` +
                `(${(result.diffRatio * 100).toFixed(3)}%), expected <= ${MAX_ACCEPTABLE_DIFF_PIXELS}. ` +
                `Screenshots: ${before} vs ${after}`
            );
        }
    });
});
