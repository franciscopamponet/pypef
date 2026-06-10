import { C } from "./colors";

const LOAD_TYPES = {
  concentrated: { label: "Força Concentrada", icon: "↓" },
  moment: { label: "Momento Concentrado", icon: "↻" },
  uniform: { label: "Distribuída Uniforme", icon: "▬" },
  triangular: { label: "Distribuída Triangular", icon: "◺" },
};

const TYPE_COLORS = {
  concentrated: C.orange,
  moment: "#8e44ad",
  uniform: C.orange,
  triangular: C.orange,
};

const inputStyle = {
  background: C.gray50,
  border: `1px solid ${C.gray200}`,
  borderRadius: 6,
  padding: "6px 8px",
  color: C.navy,
  fontSize: 12,
  outline: "none",
  width: 68,
};

export default function LoadForm({ load, onChange, onRemove }) {
  const upd = (k, v) => onChange({ ...load, [k]: v });

  const field = (label, key, unit, step = 0.1) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: "1 1 80px" }}>
      <span style={{ fontSize: 10, color: C.gray400, fontWeight: 600 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <input
          type="number" step={step} value={load[key]}
          onChange={(e) => upd(key, parseFloat(e.target.value) || 0)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <span style={{ fontSize: 9, color: C.gray400 }}>{unit}</span>
      </div>
    </div>
  );

  const borderColor = TYPE_COLORS[load.type] || C.orange;

  return (
    <div style={{
      background: C.white, borderRadius: 8, padding: 10, marginBottom: 8,
      border: `1px solid ${C.gray100}`, borderLeft: `3px solid ${borderColor}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>
          {LOAD_TYPES[load.type].icon} {LOAD_TYPES[load.type].label}
        </span>
        <button onClick={onRemove} style={{
          background: "none", border: "none", color: C.gray400, cursor: "pointer", fontSize: 15,
        }}>✕</button>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {load.type === "concentrated" && (
          <>{field("Fy", "Fy", "kN")}{field("Fx", "Fx", "kN")}{field("Posição", "pos", "m")}</>
        )}
        {load.type === "moment" && (
          <>{field("M", "M", "kN·m")}{field("Posição", "pos", "m")}</>
        )}
        {load.type === "uniform" && (
          <>{field("q", "q", "kN/m")}{field("Início", "start", "m")}{field("Fim", "end", "m")}</>
        )}
        {load.type === "triangular" && (
          <>
            {field("q_max", "qMax", "kN/m")}
            {field("Início", "start", "m")}
            {field("Fim", "end", "m")}
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: "1 1 100px" }}>
              <span style={{ fontSize: 10, color: C.gray400, fontWeight: 600 }}>Sentido</span>
              <select value={load.direction} onChange={(e) => upd("direction", e.target.value)}
                style={inputStyle}>
                <option value="crescente">Crescente</option>
                <option value="decrescente">Decrescente</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}