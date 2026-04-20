#!/usr/bin/env node
// Deterministically generates the WorldMapPreview dots: ~60 globally spread
// points, each guaranteed to lie on land. If a Fibonacci-spiral candidate
// falls in water, it is snapped to the nearest land centroid.
//
// Output: components/WorldMapPreview.dots.json (viewBox-projected x/y + delay)
// SVG viewBox: 950 x 620, cropped Plate-Carree (83°N to -57°S).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point as turfPoint } from '@turf/helpers';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const GEO_PATH = path.join(ROOT, 'public', 'world-110m.geojson');
const OUT_PATH = path.join(ROOT, 'components', 'WorldMapPreview.dots.json');

const VIEWBOX_W = 950;
const VIEWBOX_H = 620;
const LAT_NORTH = 83;
const LAT_SOUTH = -57;
const LAT_SPAN = LAT_NORTH - LAT_SOUTH;
const N_DOTS = 60;

// Skip Antarctica and tiny islands (visual noise, too far south past crop)
const SKIP_COUNTRY_CODES = new Set(['ATA']);

function project(lat, lng) {
  const x = ((lng + 180) / 360) * VIEWBOX_W;
  const y = ((LAT_NORTH - lat) / LAT_SPAN) * VIEWBOX_H;
  return { x, y };
}

function fibonacciLatLng(n, total) {
  // classic Fibonacci sphere: even distribution over unit sphere
  const phi = Math.PI * (Math.sqrt(5) - 1);
  const y = 1 - (n / (total - 1)) * 2; // y in [1, -1]
  const radius = Math.sqrt(1 - y * y);
  const theta = phi * n;
  const x = Math.cos(theta) * radius;
  const z = Math.sin(theta) * radius;
  const lat = Math.asin(y) * (180 / Math.PI);
  const lng = Math.atan2(z, x) * (180 / Math.PI);
  return { lat, lng };
}

function polygonRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function polygonCentroid(ring) {
  let x = 0, y = 0, n = 0;
  for (const p of ring) { x += p[0]; y += p[1]; n++; }
  return n > 0 ? [x / n, y / n] : null;
}

function collectLandCentroids(features) {
  const centroids = [];
  for (const f of features) {
    const code = f.properties?.ADM0_A3 || f.properties?.SOV_A3;
    if (code && SKIP_COUNTRY_CODES.has(code)) continue;
    for (const rings of polygonRings(f.geometry)) {
      const outer = rings[0];
      const c = polygonCentroid(outer);
      if (c) centroids.push({ lng: c[0], lat: c[1], feature: f });
    }
  }
  return centroids;
}

function isOnLand(features, lat, lng) {
  const pt = turfPoint([lng, lat]);
  for (const f of features) {
    const code = f.properties?.ADM0_A3 || f.properties?.SOV_A3;
    if (code && SKIP_COUNTRY_CODES.has(code)) continue;
    if (!f.geometry) continue;
    try {
      if (booleanPointInPolygon(pt, f)) return true;
    } catch { /* skip malformed */ }
  }
  return false;
}

function nearestLand(centroids, features, lat, lng) {
  const sorted = centroids
    .map((c) => ({ c, d: (c.lat - lat) ** 2 + (c.lng - lng) ** 2 }))
    .sort((a, b) => a.d - b.d);
  for (const { c } of sorted) {
    if (isOnLand(features, c.lat, c.lng)) return c;
  }
  return null;
}

function main() {
  if (!fs.existsSync(GEO_PATH)) {
    console.error('missing', GEO_PATH);
    process.exit(2);
  }
  const geo = JSON.parse(fs.readFileSync(GEO_PATH, 'utf8'));
  const centroids = collectLandCentroids(geo.features);
  console.log(`loaded ${geo.features.length} countries, ${centroids.length} land-polygon centroids`);

  const candidates = [];
  // Oversample the spiral so we can skip Antarctica / polar extremes
  const OVERSAMPLE = 200;
  for (let i = 0; i < OVERSAMPLE; i++) {
    const { lat, lng } = fibonacciLatLng(i, OVERSAMPLE);
    if (lat > 75 || lat < -55) continue; // outside cropped viewBox
    candidates.push({ lat, lng });
  }
  // Uniformly pick N_DOTS from candidates
  const step = Math.max(1, Math.floor(candidates.length / N_DOTS));
  const picked = [];
  for (let i = 0; i < candidates.length && picked.length < N_DOTS; i += step) {
    picked.push(candidates[i]);
  }
  while (picked.length < N_DOTS) picked.push(candidates[picked.length]);

  let snapped = 0;
  const finalDots = picked.map((c, i) => {
    let { lat, lng } = c;
    if (!isOnLand(geo.features, lat, lng)) {
      const near = nearestLand(centroids, geo.features, lat, lng);
      if (near) { lat = near.lat; lng = near.lng; snapped++; }
    }
    const { x, y } = project(lat, lng);
    return { x: +x.toFixed(2), y: +y.toFixed(2), delay: +(((i * 0.17) % 3)).toFixed(3), lat: +lat.toFixed(2), lng: +lng.toFixed(2) };
  });

  // Verify all on land
  const stillWater = finalDots.filter((d) => !isOnLand(geo.features, d.lat, d.lng));
  console.log(`generated ${finalDots.length} dots, ${snapped} snapped to nearest land, ${stillWater.length} still in water`);
  if (stillWater.length > 0) {
    console.error('FAIL: dots still in water:', stillWater);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    viewBox: { w: VIEWBOX_W, h: VIEWBOX_H },
    projection: { latNorth: LAT_NORTH, latSouth: LAT_SOUTH },
    dots: finalDots,
  }, null, 2));
  console.log('wrote', path.relative(ROOT, OUT_PATH));

  writeLandSvg(geo);
}

// Projects world-110m.geojson polygons into the same viewBox as the dots so
// dots sit exactly on the land silhouette (vs. the artistic world-map.svg
// which has slightly different coastlines → dots visually "in the ocean").
function writeLandSvg(geo) {
  const OUT_SVG = path.join(ROOT, 'public', 'WorldMapPreview.land.svg');
  const paths = [];
  for (const f of geo.features) {
    const code = f.properties?.ADM0_A3 || f.properties?.SOV_A3;
    if (code && SKIP_COUNTRY_CODES.has(code)) continue;
    const rings = polygonRings(f.geometry);
    if (!rings.length) continue;
    const segments = [];
    for (const polygon of rings) {
      for (const ring of polygon) {
        if (!ring || ring.length < 3) continue;
        const pts = [];
        for (const [lng, lat] of ring) {
          if (lat > LAT_NORTH || lat < LAT_SOUTH) { pts.length = 0; break; }
          const { x, y } = project(lat, lng);
          pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        }
        if (pts.length >= 3) segments.push('M' + pts.join(' L') + ' Z');
      }
    }
    if (segments.length) paths.push(segments.join(' '));
  }
  const svg = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX_W} ${VIEWBOX_H}" preserveAspectRatio="xMidYMid meet">`,
    `  <path d="${paths.join(' ')}" fill="var(--map-land-color, #d1d5db)" stroke="none" />`,
    '</svg>',
    '',
  ].join('\n');
  fs.writeFileSync(OUT_SVG, svg);
  console.log('wrote', path.relative(ROOT, OUT_SVG), `${(svg.length / 1024).toFixed(1)} KB`);
}

main();
