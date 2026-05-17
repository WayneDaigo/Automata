/* ══════════════════════════════════════════
   AUTOMATA & FL — Finals Lab · script.js
   ══════════════════════════════════════════ */

// ── PAGES ────────────────────────────────────────────────────────
const PAGE_IDS = ['home', 'lab1', 'lab3', 'lab4'];
function goTo(id, triggerEl) {
  PAGE_IDS.forEach(p => {
    const page = document.getElementById('page-' + p);
    if (page) page.classList.toggle('active', p === id);
  });
  document.querySelectorAll('.dock-item').forEach(btn => btn.classList.remove('active'));
  if (triggerEl) {
    triggerEl.classList.add('active');
  } else {
    document.querySelectorAll('.dock-item').forEach(btn => {
      const oc = btn.getAttribute('onclick') || '';
      if (oc.includes("'" + id + "'")) btn.classList.add('active');
    });
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToId(id) {
  let matched = null;
  document.querySelectorAll('.dock-item').forEach(btn => {
    const oc = btn.getAttribute('onclick') || '';
    if (oc.includes("'" + id + "'")) matched = btn;
  });
  goTo(id, matched);
}

// ── MOBILE MENU ───────────────────────────────────────────────────
function toggleMobile() {
  const drawer = document.getElementById('mobile-nav');
  drawer.classList.toggle('open');
}
function closeMobile() {
  document.getElementById('mobile-nav').classList.remove('open');
}

// ── TABS (Lab 4) ──────────────────────────────────────────────────
function switchTab(name, btn) {
  ['fib', 'lucas', 'trib'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('active', t === name);
  });
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ── HELPERS ───────────────────────────────────────────────────────
function setOut(id, html) {
  document.getElementById(id).innerHTML = html;
}
function outLabel(text) {
  return `<span class="out-label">${text}</span>`;
}
function renderChips(containerId, nums) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.innerHTML =
    '<div class="seq-wrap">' +
    nums.map((n, i) =>
      `<span class="seq-chip${i === nums.length - 1 ? ' highlight' : ''}">${n}</span>`
    ).join('') +
    '</div>';
}

// ── HELPER: derive output id from input id ────────────────────────
function getOutId(inputId) {
  if (inputId === 'div-a' || inputId === 'div-b') return 'div-out';
  if (inputId === 'gcd-a' || inputId === 'gcd-b') return 'gcd-out';
  if (inputId === 'col-n')   return 'col-out';
  if (inputId === 'fib-n')   return 'fib-out';
  if (inputId === 'lucas-n') return 'lucas-out';
  if (inputId === 'trib-n')  return 'trib-out';
  return null;
}

// ── VISUAL STATE HELPERS ──────────────────────────────────────────
function applyInputState(el, state) {
  el.classList.remove('input-valid', 'input-invalid', 'input-disabled');
  if (state === 'valid')    el.classList.add('input-valid');
  if (state === 'invalid')  el.classList.add('input-invalid');
  if (state === 'disabled') el.classList.add('input-disabled');
}

function setButtonEnabled(btn, enabled) {
  btn.disabled = !enabled;
  btn.classList.toggle('btn-disabled', !enabled);
}

function showInlineError(outId, message) {
  setOut(outId,
    outLabel('Output') +
    `<span class="out-err">${message}</span>`
  );
}

function resetOutput(outId, hint) {
  setOut(outId,
    outLabel('Output') +
    `<span class="out-plain">${hint || 'Enter two integers and click Compute.'}</span>`
  );
}

// input blocking
let _pendingInvalidKey = null; // '-' | '.' | null

const _PAIR_MAP = {
  'div-a': { secondId: 'div-b', btnSel: '#page-lab1 .split .panel:first-child .btn' },
  'gcd-a': { secondId: 'gcd-b', btnSel: '#page-lab1 .split .panel:last-child .btn'  },
};

document.addEventListener('keydown', e => {
  if (e.target.tagName !== 'INPUT' || e.target.type !== 'number') return;

  if (['e', 'E', '+'].includes(e.key)) {
    e.preventDefault();
    return;
  }

  if (e.key === '-') {
    if (e.target.value !== '') {
      e.preventDefault();
      return;
    }
    _pendingInvalidKey = '-';
    return;
  }

  if (e.key === '.') {
    _pendingInvalidKey = '.';
  }
});

document.addEventListener('input', e => {
  if (e.target.tagName !== 'INPUT' || e.target.type !== 'number') return;

  // Strip any pasted/autofilled e/E characters
  if (/[eE]/.test(e.target.value)) {
    e.target.value = e.target.value.replace(/[eE]/g, '');
  }

  if (_pendingInvalidKey) {
    const key = _pendingInvalidKey;
    _pendingInvalidKey = null;

    const outId = getOutId(e.target.id);
    applyInputState(e.target, 'invalid');
    if (outId) {
      const msg = key === '-'
        ? 'INVALID — Negative numbers are not allowed. Enter a positive integer.'
        : 'INVALID — Decimals are not allowed. Enter a positive integer.';
      showInlineError(outId, msg);
    }

    const pair = _PAIR_MAP[e.target.id];
    if (pair) {
      const second = document.getElementById(pair.secondId);
      second.disabled = true;
      second.value = '';
      applyInputState(second, 'disabled');
      const btn = document.querySelector(pair.btnSel);
      if (btn) setButtonEnabled(btn, false);
    }

    e.stopImmediatePropagation();
  }
}, true);

// ══════════════════════════════════════════════════════════════════
// ACTIVITY 1 & 2 — DIVISION + EUCLIDEAN
// ══════════════════════════════════════════════════════════════════

function getPosIntState(rawVal) {
  if (rawVal === '' || rawVal == null) return 'empty';
  const n = Number(rawVal);
  if (isNaN(n) || !Number.isInteger(n)) return 'invalid';
  if (n < 0) return 'negative';
  if (n === 0) return 'zero';
  return 'valid';
}

function stateToVisual(state) {
  if (state === 'valid') return 'valid';
  if (state === 'empty') return 'empty';
  return 'invalid';
}

function lab1ErrMsg(state) {
  if (state === 'negative') return 'INVALID — Enter a positive integer. Negative numbers are not allowed.';
  if (state === 'zero')     return 'INVALID — Zero is not accepted. Enter a positive integer.';
  return 'INVALID — Enter a positive integer.';
}

function initLab1() {
  const divA   = document.getElementById('div-a');
  const divB   = document.getElementById('div-b');
  const divBtn = document.querySelector('#page-lab1 .split .panel:first-child .btn');

  const gcdA   = document.getElementById('gcd-a');
  const gcdB   = document.getElementById('gcd-b');
  const gcdBtn = document.querySelector('#page-lab1 .split .panel:last-child .btn');

  // Division — first field
  divA.addEventListener('input', () => {
    const aState = getPosIntState(divA.value);
    applyInputState(divA, stateToVisual(aState));
    const aOk = aState === 'valid';
    divB.disabled = !aOk;
    if (!aOk) {
      divB.value = '';
      applyInputState(divB, 'disabled');
      setButtonEnabled(divBtn, false);
      if (aState !== 'empty') showInlineError('div-out', lab1ErrMsg(aState));
      else resetOutput('div-out');
    } else {
      const bState = getPosIntState(divB.value);
      applyInputState(divB, stateToVisual(bState));
      setButtonEnabled(divBtn, bState === 'valid');
      if (bState !== 'invalid' && bState !== 'negative' && bState !== 'zero') resetOutput('div-out');
    }
  });

  // Division — second field
  divB.addEventListener('input', () => {
    if (getPosIntState(divA.value) !== 'valid') return;
    const bState = getPosIntState(divB.value);
    applyInputState(divB, stateToVisual(bState));
    setButtonEnabled(divBtn, bState === 'valid');
    if (bState !== 'valid' && bState !== 'empty') showInlineError('div-out', lab1ErrMsg(bState));
    else resetOutput('div-out');
  });

  // GCD — first field
  gcdA.addEventListener('input', () => {
    const aState = getPosIntState(gcdA.value);
    applyInputState(gcdA, stateToVisual(aState));
    const aOk = aState === 'valid';
    gcdB.disabled = !aOk;
    if (!aOk) {
      gcdB.value = '';
      applyInputState(gcdB, 'disabled');
      setButtonEnabled(gcdBtn, false);
      if (aState !== 'empty') showInlineError('gcd-out', lab1ErrMsg(aState));
      else resetOutput('gcd-out');
    } else {
      const bState = getPosIntState(gcdB.value);
      applyInputState(gcdB, stateToVisual(bState));
      setButtonEnabled(gcdBtn, bState === 'valid');
      if (bState !== 'invalid' && bState !== 'negative' && bState !== 'zero') resetOutput('gcd-out');
    }
  });

  // GCD — second field
  gcdB.addEventListener('input', () => {
    if (getPosIntState(gcdA.value) !== 'valid') return;
    const bState = getPosIntState(gcdB.value);
    applyInputState(gcdB, stateToVisual(bState));
    setButtonEnabled(gcdBtn, bState === 'valid');
    if (bState !== 'valid' && bState !== 'empty') showInlineError('gcd-out', lab1ErrMsg(bState));
    else resetOutput('gcd-out');
  });

  // Initial locked state
  divB.disabled = true;
  gcdB.disabled = true;
  applyInputState(divB, 'disabled');
  applyInputState(gcdB, 'disabled');
  setButtonEnabled(divBtn, false);
  setButtonEnabled(gcdBtn, false);
}

function runDivision() {
  const divA = document.getElementById('div-a');
  const divB = document.getElementById('div-b');
  if (getPosIntState(divA.value) !== 'valid' || getPosIntState(divB.value) !== 'valid') return;

  const a = parseInt(divA.value), b = parseInt(divB.value);
  const m = Math.max(a, b), n = Math.min(a, b);
  const q = Math.floor(m / n), r = m % n;

  setOut('div-out',
    outLabel('Output') +
    `<span class="out-step">SOLUTION:</span>\n` +
    `<span class="out-plain">${m} = ${n} (${q}) + ${r}</span>\n\n` +
    `<span class="out-result">The dividend is ${m}</span>\n` +
    `<span class="out-result">The divisor is ${n}</span>\n` +
    `<span class="out-result">The quotient is ${q} and the remainder is ${r}</span>`
  );
}

function runGCD() {
  const gcdA = document.getElementById('gcd-a');
  const gcdB = document.getElementById('gcd-b');
  if (getPosIntState(gcdA.value) !== 'valid' || getPosIntState(gcdB.value) !== 'valid') return;

  const a = parseInt(gcdA.value), b = parseInt(gcdB.value);
  const m = Math.max(a, b), n = Math.min(a, b);

  const steps = [];
  let x = m, y = n;
  while (y > 0) {
    const q = Math.floor(x / y), r = x % y;
    steps.push({ x, y, q, r });
    x = y; y = r;
  }
  const gcd = x, lcm = (m * n) / gcd;

  let html = outLabel('Output') + '<span class="out-step">SOLUTION:</span>\n';
  steps.forEach(s => {
    html += s.r === 0
      ? `<span class="out-plain">${s.x} = ${s.y} (${s.q})</span>\n`
      : `<span class="out-plain">${s.x} = ${s.y} (${s.q}) + ${s.r}</span>\n`;
  });
  html +=
    `\n<span class="out-result">The integers are ${m} and ${n}</span>\n` +
    `<span class="out-result">The GCD of ${m} and ${n} is ${gcd}</span>\n` +
    `<span class="out-result">The LCM of ${m} and ${n} is ${lcm}</span>`;
  setOut('gcd-out', html);

  const stepWrap = document.getElementById('gcd-steps');
  const stepList = document.getElementById('gcd-step-list');
  stepWrap.style.display = 'block';
  stepList.innerHTML = steps.map((s, i) => {
    const eq = s.r === 0 ? `${s.x} = ${s.y} × ${s.q}` : `${s.x} = ${s.y} × ${s.q} + ${s.r}`;
    return `
      <div class="step-row" style="animation-delay:${i * 55}ms">
        <span class="step-idx">S${i + 1}</span>
        <span>${eq}</span>
        ${s.r === 0 ? `<span class="step-gcd">← GCD = ${s.y}</span>` : ''}
      </div>`;
  }).join('');
}

// ══════════════════════════════════════════════════════════════════
// ACTIVITY 3 — COLLATZ  (positive ODD integer only)
// ══════════════════════════════════════════════════════════════════

function validateCollatz(raw) {
  if (raw === '') return { state: 'empty', message: null };
  const n = parseInt(raw);
  if (isNaN(n)) return { state: 'invalid', message: 'INVALID — Enter a positive odd integer.' };
  if (n < 0)   return { state: 'invalid', message: 'INVALID — Negative numbers are not allowed. Enter a positive odd integer.' };
  if (n === 0) return { state: 'invalid', message: 'INVALID — Zero is not accepted. Enter a positive odd integer.' };
  if (n % 2 === 0) return { state: 'invalid', message: 'INVALID — Initial value must be a positive ODD integer.' };
  return { state: 'valid', message: null };
}

function initCollatz() {
  const colN   = document.getElementById('col-n');
  const colBtn = document.querySelector('#page-lab3 .btn');
  const wrap   = document.getElementById('col-chain-wrap');

  colN.addEventListener('input', () => {
    const { state, message } = validateCollatz(colN.value);
    applyInputState(colN, state === 'empty' ? 'empty' : state);
    setButtonEnabled(colBtn, state === 'valid');
    if (state === 'invalid') {
      showInlineError('col-out', message);
      wrap.style.display = 'none';
    } else {
      resetOutput('col-out', 'Enter a positive odd integer and click Generate.');
      wrap.style.display = 'none';
    }
  });

  setButtonEnabled(colBtn, false);
}

function runCollatz() {
  const colN = document.getElementById('col-n');
  const wrap = document.getElementById('col-chain-wrap');
  const { state, message } = validateCollatz(colN.value);

  applyInputState(colN, state === 'empty' ? 'empty' : state);
  if (state !== 'valid') {
    showInlineError('col-out', message || 'INVALID — Enter a positive odd integer.');
    wrap.style.display = 'none';
    return;
  }

  const n = parseInt(colN.value);
  const seq = [n];
  let cur = n, iters = 0;
  while (cur !== 1 && iters < 10000) {
    cur = cur % 2 === 0 ? cur / 2 : 3 * cur + 1;
    seq.push(cur);
    iters++;
  }

  setOut('col-out',
    outLabel('Output') +
    `<span class="out-step">This program will find all the terms of the Collatz sequence.</span>\n\n` +
    `<span class="out-plain">Input initial value: ${n}</span>\n\n` +
    `<span class="out-result">The Collatz sequence: ${seq.join(', ')}</span>`
  );

  wrap.style.display = 'block';
  document.getElementById('col-chain').innerHTML = seq.map((v, i) => {
    const cls   = v === 1 ? 'end' : (v % 2 === 0 ? 'even' : 'odd');
    const arrow = i < seq.length - 1 ? '<span class="cz-arrow">→</span>' : '';
    return `<span class="cz-num ${cls}">${v}</span>${arrow}`;
  }).join('');

  const odds  = seq.filter(v => v % 2 !== 0 && v !== 1).length;
  const evens = seq.filter(v => v % 2 === 0).length;
  document.getElementById('col-stats').textContent =
    `Total terms: ${seq.length}  ·  Odd (excl. 1): ${odds}  ·  Even: ${evens}`;
}

// ══════════════════════════════════════════════════════════════════
// ACTIVITY 4 — RECURSIVE SEQUENCES
// Fib: > 2  |  Lucas: > 2  |  Tribonacci: > 3
// ══════════════════════════════════════════════════════════════════

const SEQ_CONFIG = {
  fib:   { min: 3, label: 'Fibonacci',  minLabel: 'greater than 2' },
  lucas: { min: 3, label: 'Lucas',      minLabel: 'greater than 2' },
  trib:  { min: 4, label: 'Tribonacci', minLabel: 'greater than 3' },
};

function validateSeq(type, raw) {
  const { min, minLabel } = SEQ_CONFIG[type];
  if (raw === '') return { state: 'empty', message: null };
  const n = parseInt(raw);
  if (isNaN(n))
    return { state: 'invalid', message: `INVALID — Input must be a positive integer ${minLabel}.` };
  if (n < 0)
    return { state: 'invalid', message: `INVALID — Negative numbers are not allowed. Enter a positive integer ${minLabel}.` };
  if (n === 0)
    return { state: 'invalid', message: `INVALID — Zero is not accepted. Enter a positive integer ${minLabel}.` };
  if (n < min)
    return { state: 'invalid', message: `INVALID — Input must be a positive integer ${minLabel}.` };
  return { state: 'valid', message: null };
}

function initSequences() {
  Object.keys(SEQ_CONFIG).forEach(type => {
    const input = document.getElementById(type + '-n');
    const outId = type + '-out';
    const btn   = document.querySelector(`#tab-${type} .btn`);

    input.addEventListener('input', () => {
      const { state, message } = validateSeq(type, input.value);
      applyInputState(input, state === 'empty' ? 'empty' : state);
      setButtonEnabled(btn, state === 'valid');
      if (state === 'invalid') {
        showInlineError(outId, message);
        document.getElementById(type + '-chips').innerHTML = '';
      } else {
        resetOutput(outId, 'Enter terms and click Compute.');
        document.getElementById(type + '-chips').innerHTML = '';
      }
    });

    setButtonEnabled(btn, false);
  });
}

function fibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) seq.push(seq[i - 1] + seq[i - 2]);
  return seq.slice(0, n);
}

function lucas(n) {
  const seq = [2, 1];
  for (let i = 2; i < n; i++) seq.push(seq[i - 1] + seq[i - 2]);
  return seq.slice(0, n);
}

function tribonacci(n) {
  const seq = [0, 0, 1];
  for (let i = 3; i < n; i++) seq.push(seq[i - 1] + seq[i - 2] + seq[i - 3]);
  return seq.slice(0, n);
}

function runSeq(type) {
  const { label } = SEQ_CONFIG[type];
  const outId   = type + '-out';
  const chipsId = type + '-chips';
  const input   = document.getElementById(type + '-n');
  const { state, message } = validateSeq(type, input.value);

  applyInputState(input, state === 'empty' ? 'empty' : state);
  if (state !== 'valid') {
    showInlineError(outId, message || 'INVALID — Check your input.');
    document.getElementById(chipsId).innerHTML = '';
    return;
  }

  const n = parseInt(input.value);
  const seq =
    type === 'fib'   ? fibonacci(n) :
    type === 'lucas' ? lucas(n)     : tribonacci(n);

  setOut(outId,
    outLabel('Output') +
    `<span class="out-step">This program will find all the terms of the ${label} numbers.</span>\n\n` +
    `<span class="out-plain">Input the number of terms: ${n}</span>\n\n` +
    `<span class="out-result">The ${label} numbers are: ${seq.join(', ')}</span>`
  );

  renderChips(chipsId, seq);
}

// keydown handler
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const id = document.activeElement?.id;
  if (id === 'div-a' || id === 'div-b')  runDivision();
  if (id === 'gcd-a' || id === 'gcd-b')  runGCD();
  if (id === 'col-n')                    runCollatz();
  if (id === 'fib-n')                    runSeq('fib');
  if (id === 'lucas-n')                  runSeq('lucas');
  if (id === 'trib-n')                   runSeq('trib');
});

// init
document.addEventListener('DOMContentLoaded', () => {
  resetOutput('div-out',   'Enter two integers and click Compute.');
  resetOutput('gcd-out',   'Enter two integers and click Compute.');
  resetOutput('col-out',   'Enter a positive odd integer and click Generate.');
  resetOutput('fib-out',   'Enter terms and click Compute.');
  resetOutput('lucas-out', 'Enter terms and click Compute.');
  resetOutput('trib-out',  'Enter terms and click Compute.');

  initLab1();
  initCollatz();
  initSequences();
});
