import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export type DiffResult = { diffPixels: number; totalPixels: number; diffRatio: number };

// Compares two Detox screenshot PNGs pixel-for-pixel. Used to catch "the marker didn't fully
// redraw" bugs by round-tripping a toggle (A -> B -> A) and diffing the two A screenshots: with
// the map background frozen (see mapType="none" under isE2EMode()), the whole screen should be
// byte-identical between them, so any diff must come from a stale/partial marker snapshot.
export function diffScreenshots(pathA: string, pathB: string): DiffResult {
    const imgA = PNG.sync.read(fs.readFileSync(pathA));
    const imgB = PNG.sync.read(fs.readFileSync(pathB));
    const { width, height } = imgA;
    if (width !== imgB.width || height !== imgB.height) {
        throw new Error(`Screenshot size mismatch: ${pathA} is ${width}x${height}, ${pathB} is ${imgB.width}x${imgB.height}`);
    }

    const diff = new PNG({ width, height });
    const diffPixels = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.15 });
    const totalPixels = width * height;
    return { diffPixels, totalPixels, diffRatio: diffPixels / totalPixels };
}

export function writeDiffArtifact(pathA: string, pathB: string, outPath: string): void {
    const imgA = PNG.sync.read(fs.readFileSync(pathA));
    const imgB = PNG.sync.read(fs.readFileSync(pathB));
    const { width, height } = imgA;
    const diff = new PNG({ width, height });
    pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.15 });
    fs.writeFileSync(outPath, PNG.sync.write(diff));
}
