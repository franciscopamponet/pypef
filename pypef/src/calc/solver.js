/**
 * PyPef — Motor de Cálculo de Esforços Solicitantes
 * Vigas com engastamento fixo em x = 0
 *
 * Convenção de sinais:
 *   - Fy negativo = força para baixo
 *   - q negativo  = carga distribuída para baixo
 *   - M positivo  = momento anti-horário
 *   - Rv positivo = reação vertical para cima
 *   - Me positivo = momento horário (traciona fibra inferior)
 */

/**
 * Calcula as reações no engaste (x = 0)
 * @param {number} L - comprimento da viga (m)
 * @param {Array} loads - array de carregamentos
 * @returns {{ Rv: number, Rh: number, Me: number }}
 */
export function calcReactions(L, loads) {
  let Rv = 0;
  let Rh = 0;
  let Me = 0;

  for (const ld of loads) {
    if (ld.type === "concentrated") {
      Rv += -ld.Fy;
      Rh += -ld.Fx;
      Me += -ld.Fy * ld.pos;
    } else if (ld.type === "moment") {
      Me += -ld.M;
    } else if (ld.type === "uniform") {
      const w = ld.end - ld.start;
      const R = ld.q * w;
      const xc = ld.start + w / 2;
      Rv += -R;
      Me += -R * xc;
    } else if (ld.type === "triangular") {
      const w = ld.end - ld.start;
      const R = (ld.qMax * w) / 2;
      const xc =
        ld.direction === "crescente"
          ? ld.start + (2 * w) / 3
          : ld.start + w / 3;
      Rv += -R;
      Me += -R * xc;
    }
  }

  return {
    Rv: +(Rv.toFixed(3)),
    Rh: +(Rh.toFixed(3)),
    Me: +(Me.toFixed(3)),
  };
}

/**
 * Calcula os diagramas N(x), V(x), M(x) discretizados
 * @param {number} L - comprimento da viga (m)
 * @param {Array} loads - array de carregamentos
 * @param {number} [n=500] - número de pontos de discretização
 * @returns {{ xs: number[], V: number[], M: number[], N: number[] }}
 */
export function calcDiagrams(L, loads, n = 500) {
  const dx = L / n;
  const xs = Array.from({ length: n + 1 }, (_, i) => i * dx);
  const V = new Array(n + 1).fill(0);
  const M = new Array(n + 1).fill(0);
  const N = new Array(n + 1).fill(0);

  const { Rv, Rh, Me } = calcReactions(L, loads);

  for (let i = 0; i <= n; i++) {
    const x = xs[i];
    let v = Rv;
    let m = -Me + Rv * x;
    let nn = Rh;

    for (const ld of loads) {
      if (ld.type === "concentrated") {
        if (x >= ld.pos) {
          v += ld.Fy;
          m += ld.Fy * (x - ld.pos);
          nn += ld.Fx;
        }
      } else if (ld.type === "moment") {
        if (x >= ld.pos) {
          m += ld.M;
        }
      } else if (ld.type === "uniform") {
        if (x > ld.start) {
          const xi = Math.min(x, ld.end) - ld.start;
          if (xi > 0) {
            v += ld.q * xi;
            m += ld.q * xi * (x - ld.start - xi / 2);
          }
        }
      } else if (ld.type === "triangular") {
        if (x > ld.start) {
          const w = ld.end - ld.start;
          const xi = Math.min(x, ld.end) - ld.start;
          if (xi > 0) {
            if (ld.direction === "crescente") {
              const qx = (ld.qMax / w) * xi;
              const R = (qx * xi) / 2;
              v += R;
              m += R * (x - ld.start - (2 * xi) / 3);
            } else {
              const q0 = ld.qMax;
              const qx = q0 * (1 - xi / w);
              const R = ((q0 + qx) * xi) / 2;
              const xc = (xi * (2 * q0 + qx)) / (3 * (q0 + qx));
              v += R;
              m += R * (x - ld.start - xc);
            }
          }
        }
      }
    }

    V[i] = +(v.toFixed(3));
    M[i] = +(m.toFixed(3));
    N[i] = +(nn.toFixed(3));
  }

  return { xs, V, M, N };
}

/**
 * Interpola os valores de V, M, N numa posição x arbitrária
 * @param {{ xs: number[], V: number[], M: number[], N: number[] }} diagrams
 * @param {number} xPos - posição x desejada (m)
 * @param {number} L - comprimento da viga (m)
 * @returns {{ x: number, V: number, M: number, N: number }}
 */
export function getValAtX(diagrams, xPos, L) {
  const n = diagrams.xs.length - 1;
  const idx = Math.max(0, Math.min(n, Math.round((xPos / L) * n)));
  return {
    x: diagrams.xs[idx],
    V: diagrams.V[idx],
    M: diagrams.M[idx],
    N: diagrams.N[idx],
  };
}

/**
 * Retorna os pontos de descontinuidade (trechos) da viga
 * @param {number} L
 * @param {Array} loads
 * @returns {{ start: number, end: number }[]}
 */
export function getTrechos(L, loads) {
  const pts = new Set([0, L]);
  for (const ld of loads) {
    if (ld.type === "concentrated" || ld.type === "moment") {
      pts.add(ld.pos);
    } else {
      pts.add(ld.start);
      pts.add(ld.end);
    }
  }
  const sorted = [...pts].sort((a, b) => a - b);
  return sorted.slice(0, -1).map((s, i) => ({ start: s, end: sorted[i + 1] }));
}