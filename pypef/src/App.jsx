import { useState, useCallback } from "react";
import { calcReactions, calcDiagrams, getValAtX } from "./calc/solver";
import { C } from "./components/colors";
import Diagram from "./components/Diagram";
import BeamPreview from "./components/BeamPreview";
import LoadForm from "./components/LoadForm";
import CursorPanel from "./components/CursorPanel";
import EquationsPanel from "./components/EquationsPanel";

// ── Constantes de configuração ──

const LOAD_TYPES = {
  concentrated: { label: "Força Concentrada", icon: "↓" },
  moment: { label: "Momento Concentrado", icon: "↻" },
  uniform: { label: "Distribuída Uniforme", icon: "▬" },
  triangular: { label: "Distribuída Triangular", icon: "◺" },
};

const defaultLoad = (type) => {
  switch (type) {
    case "concentrated": return { type, Fy: -10, Fx: 0, pos: 2 };
    case "moment": return { type, M: 5, pos: 2.5 };
    case "uniform": return { type, q: -5, start: 0.5, end: 3 };
    case "triangular": return { type, qMax: -8, start: 0.5, end: 3, direction: "crescente" };
    default: return { type: "concentrated", Fy: -10, Fx: 0, pos: 2 };
  }
};

let idC = 1;

// ── Estilos compartilhados ──

const s = {
  card: { background: C.white, borderRadius: 10, padding: 14, marginBottom: 12, border: `1px solid ${C.gray100}` },
  cardTitle: { fontSize: 12, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: .8 },
  input: { background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: 6, padding: "6px 8px", color: C.navy, fontSize: 12, outline: "none", width: 68 },
};

// ── App Principal ──

export default function PyPef() {
  const [L, setL] = useState(5);
  const [loads, setLoads] = useState([{ id: idC++, ...defaultLoad("concentrated") }]);
  const [computed, setComputed] = useState(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [cursorX, setCursorX] = useState(null);
  const [manualX, setManualX] = useState("");

  const addLoad = (type) => { setLoads(p => [...p, { id: idC++, ...defaultLoad(type) }]); setAddMenuOpen(false); };
  const updateLoad = (id, data) => setLoads(p => p.map(l => l.id === id ? { ...l, ...data } : l));
  const removeLoad = (id) => setLoads(p => p.filter(l => l.id !== id));

  const compute = useCallback(() => {
    const reactions = calcReactions(L, loads);
    const diagrams = calcDiagrams(L, loads);
    setComputed({ reactions, diagrams });
  }, [L, loads]);

  const activeX = cursorX !== null
    ? cursorX
    : (manualX !== "" ? Math.max(0, Math.min(L, parseFloat(manualX))) : null);

  const cursorVals = computed && activeX !== null
    ? getValAtX(computed.diagrams, activeX, L)
    : null;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: C.gray50, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <svg width="46" height="46" viewBox="0 0 100 100">
          <rect x="10" y="30" width="8" height="50" rx="1" fill={C.white}/>
          <rect x="82" y="30" width="8" height="50" rx="1" fill={C.white}/>
          <rect x="6" y="28" width="16" height="6" rx="1" fill={C.white}/>
          <rect x="78" y="28" width="16" height="6" rx="1" fill={C.white}/>
          <path d="M18 30 Q50 10 82 30" stroke={C.white} strokeWidth="3" fill="none"/>
          <path d="M18 33 L30 30 L42 33 L50 28 L58 33 L70 30 L82 33" stroke={C.white} strokeWidth="1.5" fill="none" opacity=".6"/>
          <rect x="18" y="44" width="64" height="3" rx="1" fill={C.orange}/>
          <path d="M44 58 C44 54 47 52 50 52 C53 52 56 54 56 58 L56 65 L50 65 L50 62 L44 62 Z" fill={C.navy} stroke={C.white} strokeWidth="1.5"/>
          <path d="M56 72 C56 76 53 78 50 78 C47 78 44 76 44 72 L44 65 L50 65 L50 68 L56 68 Z" fill={C.navy} stroke={C.orange} strokeWidth="1.5"/>
          <circle cx="48" cy="55.5" r="1.2" fill={C.white}/>
          <circle cx="52" cy="74.5" r="1.2" fill={C.orange}/>
        </svg>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>PyPef</div>
          <div style={{ fontSize: 11, color: C.gray200, marginTop: 1 }}>Calculadora de Esforços Solicitantes — Vigas Engastadas</div>
          <div style={{ fontSize: 9, color: C.gray400, marginTop: 1 }}>PEF 3208 · Fundamentos de Mecânica das Estruturas · Escola Politécnica da USP</div>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
          {/* Painel Esquerdo — Entrada */}
          <div>
            <div style={s.card}>
              <div style={s.cardTitle}>Parâmetros da Viga</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Comprimento L</span>
                <input type="number" min="0.1" step="0.1" value={L}
                  onChange={e => setL(parseFloat(e.target.value) || 1)}
                  style={{ ...s.input, width: 72, fontWeight: 700, fontSize: 13 }} />
                <span style={{ fontSize: 11, color: C.gray400 }}>m</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 10, color: C.gray400 }}>Engaste fixo em x = 0 (esquerda)</div>
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>
                Carregamentos
                <span style={{ background: C.orange, color: C.white, borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700, marginLeft: 6 }}>
                  {loads.length}
                </span>
              </div>
              <div style={{ marginTop: 10 }}>
                {loads.map(ld => (
                  <LoadForm key={ld.id} load={ld}
                    onChange={data => updateLoad(ld.id, data)}
                    onRemove={() => removeLoad(ld.id)} />
                ))}
              </div>
              <div style={{ position: "relative" }}>
                <button onClick={() => setAddMenuOpen(!addMenuOpen)}
                  style={{ width: "100%", padding: "8px 0", background: C.white, border: `1.5px dashed ${C.orange}`, borderRadius: 8, color: C.orange, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  + Adicionar Carregamento
                </button>
                {addMenuOpen && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.white, borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,.12)", zIndex: 10, overflow: "hidden", marginTop: 4, border: `1px solid ${C.gray100}` }}>
                    {Object.entries(LOAD_TYPES).map(([k, v]) => (
                      <button key={k} onClick={() => addLoad(k)}
                        style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontSize: 12, fontWeight: 600, color: C.navy, borderBottom: `1px solid ${C.gray100}` }}>
                        {v.icon} {v.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={compute}
              style={{ width: "100%", padding: "12px 0", background: `linear-gradient(135deg, ${C.orange}, ${C.orangeDark})`, color: C.white, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", marginTop: 4, boxShadow: `0 4px 12px ${C.orange}44` }}>
              Calcular Esforços
            </button>
          </div>

          {/* Painel Direito — Resultados */}
          <div>
            <BeamPreview L={L} loads={loads} cursorX={computed ? activeX : null} onCursorChange={setCursorX} />

            {computed && (
              <>
                <div style={{ background: C.navy, borderRadius: 10, padding: 14, marginBottom: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { label: "R_V", val: computed.reactions.Rv, unit: "kN" },
                    { label: "R_H", val: computed.reactions.Rh, unit: "kN" },
                    { label: "M_eng", val: computed.reactions.Me, unit: "kN·m" },
                  ].map((r, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: C.gray200, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{r.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: C.orange, marginTop: 2 }}>{r.val}</div>
                      <div style={{ fontSize: 10, color: C.gray400 }}>{r.unit}</div>
                    </div>
                  ))}
                </div>

                <CursorPanel vals={cursorVals} />

                {/* Input de seção exata */}
                <div style={{
                  background: C.white, borderRadius: 10, padding: 12,
                  marginBottom: 10, border: `1px solid ${C.gray100}`,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>
                    Seção exata:
                  </span>
                  <span style={{ fontSize: 11, color: C.gray400 }}>x =</span>
                  <input
                    type="number"
                    min="0"
                    max={L}
                    step="0.01"
                    value={manualX}
                    onChange={e => setManualX(e.target.value)}
                    placeholder="0.00"
                    style={{
                      ...s.input, width: 90, fontSize: 14, fontWeight: 700,
                      textAlign: "center", color: C.orange,
                    }}
                  />
                  <span style={{ fontSize: 11, color: C.gray400 }}>m</span>
                  {manualX !== "" && (
                    <button
                      onClick={() => setManualX("")}
                      style={{
                        background: "none", border: "none", color: C.gray400,
                        cursor: "pointer", fontSize: 14,
                      }}
                    >✕</button>
                  )}
                  <span style={{ fontSize: 9, color: C.gray400, marginLeft: "auto" }}>
                    ou passe o cursor na viga
                  </span>
                </div>

                <Diagram title="Força Cortante V(x)" xs={computed.diagrams.xs} ys={computed.diagrams.V} unit="kN" color={C.orange} L={L} cursorX={activeX} />
                <Diagram title="Momento Fletor M(x)" xs={computed.diagrams.xs} ys={computed.diagrams.M} unit="kN·m" color={C.navy} L={L} cursorX={activeX} />
                <Diagram title="Força Normal N(x)" xs={computed.diagrams.xs} ys={computed.diagrams.N} unit="kN" color="#2e7d5b" L={L} cursorX={activeX} />
                <EquationsPanel L={L} loads={loads} />
              </>
            )}

            {!computed && (
              <div style={{ textAlign: "center", padding: "50px 20px", color: C.gray400, fontSize: 13 }}>
                Configure os parâmetros e clique em <strong style={{ color: C.orange }}>Calcular Esforços</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}