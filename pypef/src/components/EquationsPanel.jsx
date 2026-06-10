import { C } from "./colors";
import { calcDiagrams, getValAtX, getTrechos } from "../calc/solver";

export default function EquationsPanel({ L, loads }) {
  const trechos = getTrechos(L, loads);

  return (
    <div style={{
      background: C.white, borderRadius: 10, padding: 12,
      border: `1px solid ${C.gray100}`,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 8 }}>
        Equações por Trecho
      </div>
      {trechos.map((tr, i) => {
        const xm = (tr.start + tr.end) / 2;
        const diagrams = calcDiagrams(L, loads, 20);
        const vals = getValAtX(diagrams, xm, L);
        return (
          <div key={i} style={{
            marginBottom: 6, padding: "8px 10px",
            background: C.gray50, borderRadius: 6, fontSize: 11,
          }}>
            <span style={{ fontWeight: 700, color: C.orange }}>Trecho {i + 1}:</span>
            <span style={{ color: C.navy, fontWeight: 600 }}>
              {" "}{tr.start.toFixed(2)} ≤ x ≤ {tr.end.toFixed(2)} m
            </span>
            <div style={{ color: C.gray600, marginTop: 3, fontFamily: "monospace", fontSize: 10.5 }}>
              V = {vals.V.toFixed(2)} kN · M = {vals.M.toFixed(2)} kN·m · N = {vals.N.toFixed(2)} kN
            </div>
          </div>
        );
      })}
    </div>
  );
}