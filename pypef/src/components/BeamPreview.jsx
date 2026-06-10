import { useRef } from "react";
import { C } from "./colors";

export default function BeamPreview({ L, loads, cursorX, onCursorChange }) {
  const svgRef = useRef(null);
  const w = 540, h = 120, padL = 60, padR = 25, bY = 58;
  const bw = w - padL - padR;
  const sx = (x) => padL + (x / L) * bw;

  const handleMouse = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const svgX = ((clientX - rect.left) / rect.width) * w;
    onCursorChange(Math.max(0, Math.min(L, ((svgX - padL) / bw) * L)));
  };

  return (
    <div style={{ background: C.white, borderRadius: 10, padding: 10, marginBottom: 10, border: `1px solid ${C.gray100}` }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: "100%", height: "auto", cursor: "crosshair", touchAction: "none" }}
        onMouseMove={handleMouse}
        onMouseLeave={() => onCursorChange(null)}
        onTouchMove={handleMouse}
        onTouchStart={handleMouse}
        onTouchEnd={() => onCursorChange(null)}
      >
        {/* Título / feedback do cursor */}
        <text x={w / 2} y={14} textAnchor="middle" fontSize="10" fontWeight="600" fill={C.gray400}>
          {cursorX !== null
            ? `Seção de corte: x = ${cursorX.toFixed(3)} m`
            : "Passe o cursor sobre a viga para inspecionar"}
        </text>

        {/* Engaste */}
        <rect x={padL - 14} y={bY - 22} width={14} height={44} fill={C.navy} rx="2" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={padL - 14} y1={bY - 18 + i * 8}
            x2={padL - 3} y2={bY - 12 + i * 8}
            stroke={C.gray50} strokeWidth="1" />
        ))}

        {/* Viga */}
        <line x1={padL} y1={bY} x2={sx(L)} y2={bY}
          stroke={C.navy} strokeWidth="4" strokeLinecap="round" />

        {/* Escala */}
        <line x1={padL} y1={bY + 28} x2={sx(L)} y2={bY + 28}
          stroke={C.gray200} strokeWidth=".8" />
        <text x={padL} y={bY + 40} textAnchor="middle" fontSize="8" fill={C.gray400}>0</text>
        <text x={sx(L)} y={bY + 40} textAnchor="middle" fontSize="8" fill={C.gray400}>{L} m</text>

        {/* Carregamentos */}
        {loads.map((ld, idx) => {
          // ── Força Concentrada ──
          if (ld.type === "concentrated") {
            const px = sx(ld.pos), dir = ld.Fy < 0 ? 1 : -1;
            return (
              <g key={idx}>
                <line x1={px} y1={bY - 32 * dir} x2={px} y2={bY}
                  stroke={C.orange} strokeWidth="2.2" />
                <polygon
                  points={`${px},${bY} ${px - 5},${bY - 9 * dir} ${px + 5},${bY - 9 * dir}`}
                  fill={C.orange} />
                <text x={px} y={bY - 35 * dir} textAnchor="middle"
                  fontSize="8.5" fill={C.orange} fontWeight="700">
                  {Math.abs(ld.Fy)} kN
                </text>
                {ld.Fx !== 0 && (
                  <>
                    <line x1={px - 20 * Math.sign(ld.Fx)} y1={bY} x2={px} y2={bY}
                      stroke={C.orangeLight} strokeWidth="1.8" />
                    <polygon
                      points={`${px},${bY} ${px - 7 * Math.sign(ld.Fx)},${bY - 4} ${px - 7 * Math.sign(ld.Fx)},${bY + 4}`}
                      fill={C.orangeLight} />
                  </>
                )}
              </g>
            );
          }

          // ── Momento Concentrado ──
          if (ld.type === "moment") {
            const px = sx(ld.pos);
            const r = 14;
            const clr = "#8e44ad";
            const cw = ld.M > 0 ? 1 : 0; // sweep flag para o arco

            // Arco de 270° (de -210° a 60° ou inverso)
            const a1 = ld.M > 0 ? -210 : -150;
            const a2 = ld.M > 0 ? 60 : 330;
            const toRad = (d) => (d * Math.PI) / 180;

            const x1 = px + r * Math.cos(toRad(a1));
            const y1 = bY + r * Math.sin(toRad(a1));
            const x2 = px + r * Math.cos(toRad(a2));
            const y2 = bY + r * Math.sin(toRad(a2));

            // Seta na ponta do arco
            const aDir = ld.M > 0 ? toRad(a2 + 90) : toRad(a2 - 90);
            const ax1 = x2 + 6 * Math.cos(aDir + 0.4);
            const ay1 = y2 + 6 * Math.sin(aDir + 0.4);
            const ax2 = x2 + 6 * Math.cos(aDir - 0.4);
            const ay2 = y2 + 6 * Math.sin(aDir - 0.4);

            return (
              <g key={idx}>
                <path
                  d={`M${x1},${y1} A${r},${r} 0 1,${cw} ${x2},${y2}`}
                  stroke={clr} strokeWidth="2" fill="none"
                />
                <polygon points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`} fill={clr} />
                <text x={px} y={bY - r - 6} textAnchor="middle"
                  fontSize="8.5" fill={clr} fontWeight="700">
                  {Math.abs(ld.M)} kN·m
                </text>
              </g>
            );
          }

          // ── Distribuída Uniforme ──
          if (ld.type === "uniform") {
            const x1 = sx(ld.start), x2 = sx(ld.end);
            const dir = ld.q < 0 ? 1 : -1, ar = 6;
            return (
              <g key={idx}>
                <rect x={Math.min(x1, x2)} y={bY - 28 * dir}
                  width={Math.abs(x2 - x1)} height={Math.abs(28 * dir)}
                  fill={C.orange} opacity=".08" />
                <line x1={x1} y1={bY - 28 * dir} x2={x2} y2={bY - 28 * dir}
                  stroke={C.orange} strokeWidth="1.8" />
                {Array.from({ length: ar }, (_, i) => {
                  const ax = x1 + ((x2 - x1) * i) / (ar - 1);
                  return (
                    <g key={i}>
                      <line x1={ax} y1={bY - 28 * dir} x2={ax} y2={bY}
                        stroke={C.orange} strokeWidth="1" />
                      <polygon
                        points={`${ax},${bY} ${ax - 3},${bY - 6 * dir} ${ax + 3},${bY - 6 * dir}`}
                        fill={C.orange} />
                    </g>
                  );
                })}
                <text x={(x1 + x2) / 2} y={bY - 32 * dir} textAnchor="middle"
                  fontSize="8.5" fill={C.orange} fontWeight="700">
                  {Math.abs(ld.q)} kN/m
                </text>
              </g>
            );
          }

          // ── Distribuída Triangular ──
          if (ld.type === "triangular") {
            const x1 = sx(ld.start), x2 = sx(ld.end);
            const dir = ld.qMax < 0 ? 1 : -1, hMax = 28, ar = 6;
            const pts = ld.direction === "crescente"
              ? `${x1},${bY} ${x2},${bY} ${x2},${bY - hMax * dir}`
              : `${x1},${bY} ${x2},${bY} ${x1},${bY - hMax * dir}`;
            return (
              <g key={idx}>
                <polygon points={pts} fill={C.orange} opacity=".08" />
                <line
                  x1={x1}
                  y1={ld.direction === "crescente" ? bY : bY - hMax * dir}
                  x2={x2}
                  y2={ld.direction === "crescente" ? bY - hMax * dir : bY}
                  stroke={C.orange} strokeWidth="1.8" />
                {Array.from({ length: ar }, (_, i) => {
                  const frac = i / (ar - 1), ax = x1 + (x2 - x1) * frac;
                  const ah = ld.direction === "crescente"
                    ? hMax * dir * frac : hMax * dir * (1 - frac);
                  return Math.abs(ah) > 3 ? (
                    <g key={i}>
                      <line x1={ax} y1={bY - ah} x2={ax} y2={bY}
                        stroke={C.orange} strokeWidth="1" />
                      <polygon
                        points={`${ax},${bY} ${ax - 3},${bY - 6 * dir} ${ax + 3},${bY - 6 * dir}`}
                        fill={C.orange} />
                    </g>
                  ) : null;
                })}
                <text x={(x1 + x2) / 2} y={bY - (hMax + 5) * dir}
                  textAnchor="middle" fontSize="8.5" fill={C.orange} fontWeight="700">
                  q={Math.abs(ld.qMax)} kN/m
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* Cursor na viga */}
        {cursorX !== null && (
          <>
            <line x1={sx(cursorX)} y1={bY - 30} x2={sx(cursorX)} y2={bY + 22}
              stroke={C.orange} strokeWidth="1.5" strokeDasharray="4,2" />
            <polygon
              points={`${sx(cursorX)},${bY - 4} ${sx(cursorX) - 5},${bY - 12} ${sx(cursorX) + 5},${bY - 12}`}
              fill={C.orange} />
            <polygon
              points={`${sx(cursorX)},${bY + 4} ${sx(cursorX) - 5},${bY + 12} ${sx(cursorX) + 5},${bY + 12}`}
              fill={C.orange} />
          </>
        )}
      </svg>
    </div>
  );
}