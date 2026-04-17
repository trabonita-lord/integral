// app.js — animations + interactive net-area demo (approximation)

/* =============== Scroll reveal =============== */
const sections = document.querySelectorAll(".section");
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add("in");
    }
  },
  { threshold: 0.12 }
);
sections.forEach((s) => io.observe(s));

/* =============== Scene: rays + particles =============== */
const scene = document.getElementById("scene");
if (scene) {
  // Rays
  for (let i = 0; i < 11; i++) {
    const ray = document.createElement("div");
    ray.className = "ray";
    ray.style.left = `${Math.random() * 110 - 5}%`;
    ray.style.animationDelay = `${Math.random() * 4}s`;
    ray.style.animationDuration = `${5 + Math.random() * 7}s`;
    scene.appendChild(ray);
  }
  // Particles
  for (let i = 0; i < 42; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${55 + Math.random() * 55}%`; // mostly underwater
    p.style.animationDelay = `${Math.random() * 6}s`;
    p.style.animationDuration = `${6 + Math.random() * 10}s`;
    scene.appendChild(p);
  }
}

/* =============== Net area demo =============== */
const fnSel = document.getElementById("fn");
const aIn = document.getElementById("a");
const bIn = document.getElementById("b");
const nIn = document.getElementById("n");
const btn = document.getElementById("compute");
const netOut = document.getElementById("net");
const totalOut = document.getElementById("total");
const canvas = document.getElementById("plot");
const ctx = canvas?.getContext("2d");

function fFactory(kind) {
  if (kind === "x-1") return (x) => x - 1;
  if (kind === "sin") return (x) => Math.sin(x);
  if (kind === "quad") return (x) => x * x - 1;
  if (kind === "negabs") return (x) => -Math.abs(x) + 1;
  return (x) => x - 1;
}

function clampSwapInterval(a, b) {
  if (!Number.isFinite(a)) a = -1;
  if (!Number.isFinite(b)) b = 2;
  if (a === b) b = a + 1;
  if (a > b) [a, b] = [b, a];
  return [a, b];
}

// Trapezoidal rule for integral approximation
function trapz(g, a, b, n) {
  const h = (b - a) / n;
  let sum = 0.5 * (g(a) + g(b));
  for (let i = 1; i < n; i++) {
    sum += g(a + i * h);
  }
  return sum * h;
}

function niceNumber(x) {
  // small formatting helper
  if (!Number.isFinite(x)) return "—";
  const ax = Math.abs(x);
  if (ax >= 1000) return x.toFixed(0);
  if (ax >= 10) return x.toFixed(3);
  if (ax >= 1) return x.toFixed(4);
  return x.toFixed(6);
}

function drawPlot(g, a, b, n) {
  if (!ctx || !canvas) return;

  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // sample points
  const xs = [];
  const ys = [];
  const h = (b - a) / n;
  for (let i = 0; i <= n; i++) {
    const x = a + i * h;
    const y = g(x);
    xs.push(x);
    ys.push(y);
  }

  // determine y-range with padding
  let ymin = Math.min(...ys);
  let ymax = Math.max(...ys);
  if (ymin === ymax) { ymin -= 1; ymax += 1; }
  const pad = 0.12 * (ymax - ymin);
  ymin -= pad; ymax += pad;

  // transforms
  const xToPx = (x) => ((x - a) / (b - a)) * (W - 60) + 40;
  const yToPx = (y) => (H - 35) - ((y - ymin) / (ymax - ymin)) * (H - 60);

  // background grid
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.10)";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    const yy = 20 + (i / 8) * (H - 40);
    ctx.beginPath();
    ctx.moveTo(20, yy);
    ctx.lineTo(W - 20, yy);
    ctx.stroke();
  }
  for (let i = 0; i <= 10; i++) {
    const xx = 20 + (i / 10) * (W - 40);
    ctx.beginPath();
    ctx.moveTo(xx, 20);
    ctx.lineTo(xx, H - 20);
    ctx.stroke();
  }

  // axis (y=0)
  const y0 = yToPx(0);
  ctx.strokeStyle = "rgba(125,249,255,0.75)";
  ctx.shadowColor = "rgba(125,249,255,0.35)";
  ctx.shadowBlur = 12;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, y0);
  ctx.lineTo(W - 20, y0);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Fill trapezoids: green for above, red for below
  for (let i = 0; i < n; i++) {
    const x1 = xs[i], x2 = xs[i + 1];
    const y1 = ys[i], y2 = ys[i + 1];

    // polygon points for the trapezoid down/up to the x-axis
    const px1 = xToPx(x1), px2 = xToPx(x2);
    const py1 = yToPx(y1), py2 = yToPx(y2);
    const py0 = yToPx(0);

    // decide color based on average sign
    const avg = (y1 + y2) / 2;
    const isPos = avg >= 0;

    ctx.beginPath();
    ctx.moveTo(px1, py0);
    ctx.lineTo(px1, py1);
    ctx.lineTo(px2, py2);
    ctx.lineTo(px2, py0);
    ctx.closePath();

    ctx.fillStyle = isPos ? "rgba(43,255,154,0.18)" : "rgba(255,60,60,0.18)";
    ctx.fill();

    // subtle outline
    ctx.strokeStyle = isPos ? "rgba(43,255,154,0.14)" : "rgba(255,60,60,0.14)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // curve
  ctx.strokeStyle = "rgba(255,255,255,0.88)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const px = xToPx(xs[i]);
    const py = yToPx(ys[i]);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // labels
  ctx.fillStyle = "rgba(255,255,255,0.80)";
  ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace";
  ctx.fillText(`x ∈ [${a}, ${b}]`, 18, 18);
  ctx.fillText(`y-range ≈ [${niceNumber(ymin)}, ${niceNumber(ymax)}]`, 18, H - 10);

  ctx.restore();
}

function compute() {
  const kind = fnSel?.value ?? "x-1";
  const g = fFactory(kind);

  let a = parseFloat(aIn?.value ?? "-1");
  let b = parseFloat(bIn?.value ?? "2");
  const n = Math.max(20, Math.min(5000, parseInt(nIn?.value ?? "400", 10)));

  [a, b] = clampSwapInterval(a, b);

  // net area ≈ ∫ f(x) dx
  const net = trapz(g, a, b, n);

  // total area ≈ ∫ |f(x)| dx
  const total = trapz((x) => Math.abs(g(x)), a, b, n);

  if (netOut) netOut.textContent = niceNumber(net);
  if (totalOut) totalOut.textContent = niceNumber(total);

  drawPlot(g, a, b, Math.min(n, 600));
}

// Hook up events
btn?.addEventListener("click", compute);
fnSel?.addEventListener("change", compute);
[aIn, bIn].forEach((el) => el?.addEventListener("change", compute));
nIn?.addEventListener("input", () => {
  // don’t spam heavy compute while dragging; do a light redraw
  // but still update results for responsiveness
  compute();
});

// initial
compute();