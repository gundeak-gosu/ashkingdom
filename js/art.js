// 그림 자원(OpenAI gpt-image-2 로 만든 시트를 잘라 둔 것) — 아이템·건물·오브젝트·동물·적·지형
// 그림이 없으면 null → 예전 방식(SVG 아이콘·도형)으로 그린다.
import { ART } from "./art-manifest.js";
const has = {}; for (const [d, list] of Object.entries(ART)) has[d] = new Set(list);
export function artPath(dir, id) { return has[dir]?.has(id) ? `assets/${dir}/${id}.webp` : null; }
// 아이콘 키(아이템 id, "b.건물", "a.동물") → 그림 경로
export function iconSrc(key) {
  if (key.startsWith("b.")) return artPath("objects", key.slice(2));
  if (key.startsWith("a.")) return artPath("mobs", key.slice(2));
  return artPath("items", key);
}
const cache = new Map();
let onLoad = () => {};
export function setArtLoaded(fn) { onLoad = fn; }
// 캔버스용 이미지(불러오는 중이면 null)
export function img(dir, id) {
  const k = dir + "/" + id;
  let i = cache.get(k);
  if (i === undefined) {
    const src = artPath(dir, id);
    if (!src) { cache.set(k, null); return null; }
    i = new Image(); i.onload = () => onLoad(dir, id); i.src = src; cache.set(k, i);
  }
  return i && i.complete && i.naturalWidth ? i : null;
}
// 그림을 바닥(발) 기준으로 그린다. h: 화면 높이(px), facing<0 이면 좌우 반전(그림은 오른쪽을 본다)
// o: { walk: 걸음 위상(라디안, 걷는 중일 때), breath: 시간(가만히 있을 때 숨쉬기), legs: 다리가 시작하는 높이 비율 }
export function drawSprite(ctx, dir, id, x, y, h, facing = 1, bob = 0, o = {}) {
  const i = img(dir, id);
  if (!i) return false;
  drawPuppet(ctx, i, x, y - bob, h, facing, o);
  return true;
}

// ---------- 걷기 모션(종이 인형 방식) ----------
// 그림 한 장을 '윗몸'과 '다리 두 쪽(왼쪽 절반·오른쪽 절반)'으로 나눠 번갈아 들어 올리고 앞뒤로 내딛게 한다.
// 사람(2등신 SD)은 왼발·오른발, 네발 동물은 뒷다리·앞다리가 번갈아 움직인다. 윗몸은 걸음마다 살짝 튀고 흔들린다.
const splitCache = new WeakMap();
// 다리 사이 틈(불투명 픽셀이 가장 적은 세로줄)을 찾아 그 위치에서 나눈다(가운데 30~70% 안에서). 한 번만 계산
function legSplit(im, legs) {
  let v = splitCache.get(im);
  if (v !== undefined) return v;
  v = 0.5;
  try {
    const W = 64, H = 64, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(im, 0, 0, W, H);
    const y0 = Math.floor(H * (legs + 0.08)), d = g.getImageData(0, y0, W, H - y0).data;
    let best = 1e9;
    for (let x = Math.floor(W * 0.3); x <= Math.ceil(W * 0.7); x++) {
      let a = 0; for (let y = 0; y < H - y0; y++) a += d[(y * W + x) * 4 + 3];
      const score = a + Math.abs(x - W / 2) * 40; // 가운데에 가까울수록 좋다
      if (score < best) { best = score; v = x / W; }
    }
  } catch { v = 0.5; }
  splitCache.set(im, v);
  return v;
}
export function drawPuppet(ctx, im, x, y, h, facing = 1, o = {}) {
  const iw = im.naturalWidth, ih = im.naturalHeight, w = (iw / ih) * h;
  ctx.save(); ctx.translate(x, y); if (facing < 0) ctx.scale(-1, 1);
  if (o.walk == null) { // 가만히: 숨쉬기(아주 살짝 위아래로 늘었다 줄었다)
    const b = o.breath != null ? 1 + Math.sin(o.breath * 2.4) * 0.014 : 1;
    ctx.scale(2 - b, b); ctx.drawImage(im, -w / 2, -h, w, h); ctx.restore(); return;
  }
  const p = o.walk, L = o.legs ?? 0.7, sp = legSplit(im, L);
  const lift = h * (o.lift ?? 0.07), stride = w * (o.stride ?? 0.06);
  const sy = ih * L, sh = ih - sy, dy = h * L, dh = h - dy;
  // 다리 두 쪽: 반 박자 차이로 들어 올리고(위로) 앞뒤로 내딛는다
  const halves = [[0, sp, p], [sp, 1 - sp, p + Math.PI]];
  for (const [a, f, ph] of halves) {
    const up = Math.max(0, Math.sin(ph)) * lift, dx = Math.cos(ph) * stride;
    ctx.drawImage(im, a * iw, sy, f * iw, sh, -w / 2 + a * w + dx, -h + dy - up, f * w, dh);
  }
  // 윗몸: 발이 닿을 때 살짝 내려앉고(통통), 좌우로 아주 조금 기울어진다. 다리 위쪽과 조금 겹쳐 틈을 가린다
  const bounce = Math.abs(Math.sin(p)) * h * 0.035, tilt = Math.sin(p) * 0.035;
  const ov = ih * 0.04;
  ctx.translate(0, -dy * 0.5 - bounce); ctx.rotate(tilt);
  ctx.drawImage(im, 0, 0, iw, sy + ov, -w / 2, -h + dy * 0.5, w, dy + (ov / ih) * h);
  ctx.restore();
}
// 처음에 지형 텍스처를 미리 불러 둔다
export function preloadTiles() { return Promise.all(ART.tiles.map((t) => new Promise((res) => { const i = img("tiles", t); if (i) return res(); const im = cache.get("tiles/" + t); if (!im) return res(); im.addEventListener("load", res); im.addEventListener("error", res); }))); }
