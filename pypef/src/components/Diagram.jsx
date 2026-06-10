import { C } from "./colors";

export default function Diagram({ title, xs, ys, unit, color, L, cursorX }) {
  const w = 540, h = 185, pad = { t: 28, b: 32, l: 58, r: 20 };
  const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
  const yMin = Math.min(0, ...ys), yMax = Math.max(0, ...ys), yRange = yMax - yMin || 1;
  const sx = (x) => pad.l + (x / L) * pw;
  const sy = (y) => pad.t + ph - ((y - yMin) / yRange) * ph;
  const zeroY = sy(0);
  const absMax = ys.reduce((a, b) => Math.abs(b) > Math.abs(a) ? b : a, 0);
  const maxIdx = ys.indexOf(absMax);

  let path = `M${sx(xs[0])},${zeroY}`;
  for (let i = 0; i < xs.length; i++) path += `L${sx(xs[i])},${sy(ys[i])}`;
  path += `L${sx(xs[xs.length - 1])},${zeroY}Z`;

  const ticks = 5;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => yMin + (yRange * i) / ticks);
  const ci = cursorX !== null
    ? Math.max(0, Math.min(xs.length - 1, Math.round((cursorX / L) * (xs.length - 1))))
    : null;
  const cxPx = ci !== null ? sx(xs[ci]) : null;
  const cyVal = ci !== null ? ys[ci] : null;

  return (
    <div style={{ background: C.white, borderRadius: 10, padding: 10, marginBottom: 10, border: `1px solid ${C.gray100}` }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
        <text x={w / 2} y={16} textAnchor="middle" fontSize="12" fontWeight="700" fill={C.navy}>
          {title} ({unit})
        </text>

        {/* Grid horizontal */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={sy(v)} y2={sy(v)} stroke={C.gray100} strokeWidth=".6" />
            <text x={pad.l - 6} y={sy(v) + 3.5} textAnchor="end" fontSize="8.5" fill={C.gray400}>
              {v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Eixo zero */}
        <line x1={pad.l} x2={w - pad.r} y1={zeroY} y2={zeroY}
          stroke={C.gray400} strokeWidth=".8" strokeDasharray="4,3" />

        {/* Área preenchida + linha do diagrama */}
        <path d={path} fill={color} opacity=".18" />
        <polyline
          points={xs.map((x, i) => `${sx(x)},${sy(ys[i])}`).join(" ")}
          fill="none" stroke={color} strokeWidth="2"
        />

        {/* Valor máximo */}
        {absMax !== 0 && (
          <>
            <circle cx={sx(xs[maxIdx])} cy={sy(absMax)} r="3.5"
              fill={C.white} stroke={color} strokeWidth="2" />
            <rect x={sx(xs[maxIdx]) - 48} y={sy(absMax) - 22}
              width="96" height="15" rx="4" fill={C.navy} opacity=".85" />
            <text x={sx(xs[maxIdx])} y={sy(absMax) - 11}
              textAnchor="middle" fontSize="9" fontWeight="700" fill={C.white}>
              {absMax.toFixed(2)} {unit} (x={xs[maxIdx].toFixed(2)}m)
            </text>
          </>
        )}

        {/* Cursor interativo */}
        {ci !== null && (
          <>
            <line x1={cxPx} y1={pad.t} x2={cxPx} y2={h - pad.b}
              stroke={C.orange} strokeWidth="1.2" strokeDasharray="3,2" />
            <circle cx={cxPx} cy={sy(cyVal)} r="4"
              fill={C.orange} stroke={C.white} strokeWidth="1.5" />
            <rect x={cxPx + 6} y={sy(cyVal) - 10} width="70" height="16" rx="3"
              fill={C.navy} opacity=".9" />
            <text x={cxPx + 10} y={sy(cyVal) + 1}
              fontSize="9" fontWeight="700" fill={C.orange}>
              {cyVal.toFixed(2)} {unit}
            </text>
          </>
        )}

        {/* Labels eixo X */}
        {Array.from({ length: 6 }, (_, i) => {
          const xv = (L * i) / 5;
          return (
            <text key={i} x={sx(xv)} y={h - 6}
              textAnchor="middle" fontSize="8" fill={C.gray400}>
              {xv.toFixed(1)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}