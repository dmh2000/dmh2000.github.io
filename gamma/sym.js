const symbols = [
  // Α
  { Alpha: "Α" },
  { Beta: "Β" },
  { Gamma: "Γ" },
  { Delta: "Δ" },
  { Epsilon: "Ε" },
  { Zeta: "Ζ" },
  { Eta: "Η" },
  { Theta: "Θ" },
  { Iota: "Ι" },
  { Kappa: "Κ" },
  { Lambda: "Λ" },
  { Mu: "Μ" },
  { Nu: "Ν" },
  { Xi: "Ξ" },
  { Omikron: "Ο" },
  { Pi: "Π" },
  { Rho: "Ρ" },
  { Sigma: "Σ" },
  { Tau: "Τ" },
  { Upsilon: "Υ" },
  { Phi: "Φ" },
  { Chi: "Χ" },
  { Psi: "Ψ" },
  { Omega: "Ω" },
  { alpha: "α" },
  { beta: "β" },
  { gamma: "γ" },
  { delta: "δ" },
  { epsilon: "ε" },
  { zeta: "ζ" },
  { eta: "η" },
  { theta: "θ" },
  { iota: "ι" },
  { kappa: "κ" },
  { lambda: "λ" },
  { mu: "μ" },
  { nu: "ν" },
  { xi: "ξ" },
  { omikron: "ο" },
  { pi: "π" },
  { rho: "ρ" },
  { sigma: "σ" },
  { tau: "τ" },
  { upsilon: "υ" },
  { phi: "φ" },
  { chi: "χ" },
  { psi: "ψ" },
  { omega: "ω" },
  // operators
  { equal: "=" },
  { approximate: "≈" },
  { less_than_lt: "<" },
  { greate_than_gt: ">" },
  { less_equal_le: "≤" },
  { greater_equal_ge: "≥" },
  { plus_minus: "±" },
  { ne: "≠" },
  { div: "÷" },
  { times: "×" },
  { minus: "−" },
  { square_root: "√" },
  { cube_root: "∛" },
  { vector_sum: "⊕" },
  { vector_product: "⊗" },
  // other symbols
  { e: "e" },
  { infinity: "∞" },
  { function: "ƒ" },
  { double_prime: "″" },
  { triple_prime: "‴" },
  { therefore: "∴" },
  { dot_operator: "⋅" },
  { left_angle: "⟨" },
  { right_angle: "⟩" },
  { left_ceiling: "⌈" },
  { right_ceiling: "⌉" },
  { left_floor: "⌊" },
  { right_floor: "⌋" },
  { integral: "∫" },
  { double_integral: "∬" },
  { triple_integral: "∭" },
  { partial_differential: "∂" },
  { increment: "Δ" },
  { nabla: "∇" },

  // annotations
  { intersection: "⋂" },
  { union: "⋃" },
  { subset: "⊆" },
  { superset: "⊇" },
  { empty_set: "Ø" },
  { suchthat: "|" },
  { mp: "∓" },
  { times: "×" },
  { div: "÷" },
  { asterisk: "∗" },
  { vee: "∨" },
  { circ: "◦" },
  { wedge: "∧" },
  { dagger: "†" },
  { bullet: "•" },
  { ddagger: "‡" },
  { dot: "·" },
  { left_arrow: "⇐" },
  { up_arrow: "⇑" },
  { right_arrow: "⇒" },
  { down_arrow: "⇓" },
  { left_right_arrow: "⇔" },
  { infinity: "∞" },
  { imaginary: "ℑ" },
  { real: "ℝ" },
  { complex: "ℂ" },
  { natural: "ℕ" },
  { prime: "ℙ" },
  { rational: "ℚ" },
  { integers: "ℤ" }
];

// create a map to look up the symbol matching a name
const nameMap = symbols.reduce((p, v, i, a) => {
  let e = Object.entries(v)[0];
  return p.set(e[0], e[1]);
}, new Map());

// extract the list of names from the map
const names = symbols.map((v, i, a) => {
  return Object.entries(v)[0][0];
});

// find matching symbols, case insensitive
function findSymbols(name, keys, map) {
  return keys.reduce((p, v, i, a) => {
    if (v.toLowerCase().indexOf(name) >= 0) {
      p.push([v, map.get(v)]);
    }
    return p;
  }, []);
}

// when a string is entered, update the displayed symbols
// of matches
function showSymbols(e) {
  let letters = findSymbols(e.target.value, names, nameMap);
  let list = "";
  for (const index in letters) {
    list +=
      `<div class='label'> ${letters[index][0]} </div>` +
      `<textarea class='symbol' readonly='true' rows='1' cols='1'>${letters[index][1]}</textarea>`;
  }
  nameList.innerHTML = list;
}

const inputSymbol = document.getElementById("inputSymbol");
const nameList = document.getElementById("nameList");
inputSymbol.addEventListener("input", showSymbols);
empty = {
  target: {
    value: ""
  }
};
showSymbols(empty);
inputSymbol.focus();
