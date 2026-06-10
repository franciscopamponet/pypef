import { C } from "./colors";

export default function CursorPanel({ vals }) {
  if (!vals) return null;
  return (
    <div style={{
      background: C.navy, borderRadius: 10, padding: 12,
      marginBottom: 10, border: `2px solid ${C.orange}`,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: C.orange,
        marginBottom: 6, textTransform: "uppercase", letterSpacing: 1,
      }}>
        Seção de Corte — x = {vals.x.toFixed(3)} m
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "V(x)", val: vals.V, unit: "kN", clr: C.orange },
          { label: "M(x)", val: vals.M, unit: "kN·m", clr: C.white },
          { label: "N(x)", val: vals.N, unit: "kN", clr: "#4ecdc4" },
        ].map((r, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.gray200, fontWeight: 600 }}>{r.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: r.clr, marginTop: 2 }}>
              {r.val.toFixed(2)}
            </div>
            <div style={{ fontSize: 10, color: C.gray400 }}>{r.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
