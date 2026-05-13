/* ══════════════════════════════════════════
   AUTOMATA & FL — Finals Lab · script.js
   ══════════════════════════════════════════ */

// ── PAGES ────────────────────────────────────────────────────────
const PAGE_IDS = ['home', 'lab1', 'lab3', 'lab4'];
function goTo(id, triggerEl) {
  // 1. Show correct page
  PAGE_IDS.forEach(p => {
    const page = document.getElementById('page-' + p);
    if (page) page.classList.toggle('active', p === id);
  });

  // 2. Clear active state from the actual dock items
  document.querySelectorAll('.dock-item').forEach(btn => {
    btn.classList.remove('active');
  });

  // 3. Mark the clicked element active
  if (triggerEl) {
    triggerEl.classList.add('active');
  } else {
    // If navigating via a Home Card, find the dock button that matches the ID
    document.querySelectorAll('.dock-item').forEach(btn => {
      const oc = btn.getAttribute('onclick') || '';
      if (oc.includes("'" + id + "'")) {
        btn.classList.add('active');
      }
    });
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToId(id) {
  // Find the dock button that corresponds to the page ID
  let matched = null;
  document.querySelectorAll('.dock-item').forEach(btn => {
    const oc = btn.getAttribute('onclick') || '';
    if (oc.includes("'" + id + "'")) matched = btn;
  });
  goTo(id, matched);
}
// ── MOBILE MENU ───────────────────────────────────────────────────
function toggleMobile() {
  const drawer = document.getElementById('mobile-nav'); // Changed from mobile-drawer
  drawer.classList.toggle('open');
}

function closeMobile() {
  document.getElementById('mobile-nav').classList.remove('open'); // Changed from mobile-drawer
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

// ── ACTIVITY 1: DIVISION ALGORITHM ───────────────────────────────
function runDivision() {
  const a = parseInt(document.getElementById('div-a').value);
  const b = parseInt(document.getElementById('div-b').value);

  if (!a || !b || a < 1 || b < 1) {
    setOut('div-out',
      outLabel('Output') +
      '<span class="out-err">Please enter two positive integers.</span>'
    );
    return;
  }

  const m = Math.max(a, b);  // dividend
  const n = Math.min(a, b);  // divisor
  const q = Math.floor(m / n);
  const r = m % n;

  setOut('div-out',
    outLabel('Output') +
    `<span class="out-step">SOLUTION:</span>\n` +
    `<span class="out-plain">${m} = ${n} (${q}) + ${r}</span>\n\n` +
    `<span class="out-result">The dividend is ${m}</span>\n` +
    `<span class="out-result">The divisor is ${n}</span>\n` +
    `<span class="out-result">The quotient is ${q} and the remainder is ${r}</span>`
  );
}

// ── ACTIVITY 2: EUCLIDEAN ALGORITHM (GCD & LCM) ──────────────────
function runGCD() {
  const a = parseInt(document.getElementById('gcd-a').value);
  const b = parseInt(document.getElementById('gcd-b').value);

  if (!a || !b || a < 1 || b < 1) {
    setOut('gcd-out',
      outLabel('Output') +
      '<span class="out-err">Please enter two positive integers.</span>'
    );
    return;
  }

  const m = Math.max(a, b);
  const n = Math.min(a, b);

  // Run Euclidean steps
  const steps = [];
  let x = m, y = n;
  while (y > 0) {
    const q = Math.floor(x / y);
    const r = x % y;
    steps.push({ x, y, q, r });
    x = y;
    y = r;
  }

  const gcd = x;
  const lcm = (m * n) / gcd;

  // Build main output
  let html = outLabel('Output') + '<span class="out-step">SOLUTION:</span>\n';
  steps.forEach(s => {
    if (s.r === 0) {
      html += `<span class="out-plain">${s.x} = ${s.y} (${s.q})</span>\n`;
    } else {
      html += `<span class="out-plain">${s.x} = ${s.y} (${s.q}) + ${s.r}</span>\n`;
    }
  });
  html +=
    `\n<span class="out-result">The integers are ${m} and ${n}</span>\n` +
    `<span class="out-result">The GCD of ${m} and ${n} is ${gcd}</span>\n` +
    `<span class="out-result">The LCM of ${m} and ${n} is ${lcm}</span>`;

  setOut('gcd-out', html);

  // Step-by-step rows
  const stepWrap = document.getElementById('gcd-steps');
  const stepList = document.getElementById('gcd-step-list');
  stepWrap.style.display = 'block';

  stepList.innerHTML = steps.map((s, i) => {
    const eq = s.r === 0
      ? `${s.x} = ${s.y} × ${s.q}`
      : `${s.x} = ${s.y} × ${s.q} + ${s.r}`;
    return `
      <div class="step-row" style="animation-delay: ${i * 55}ms">
        <span class="step-idx">S${i + 1}</span>
        <span>${eq}</span>
        ${s.r === 0 ? `<span class="step-gcd">← GCD = ${s.y}</span>` : ''}
      </div>`;
  }).join('');
}

// ── ACTIVITY 3: COLLATZ SEQUENCE ─────────────────────────────────
function runCollatz() {
  const raw = parseInt(document.getElementById('col-n').value);
  const wrap = document.getElementById('col-chain-wrap');

  if (!raw || raw < 1) {
    setOut('col-out',
      outLabel('Output') +
      '<span class="out-err">INVALID — Enter a positive integer.</span>'
    );
    wrap.style.display = 'none';
    return;
  }

  if (raw % 2 === 0) {
    setOut('col-out',
      outLabel('Output') +
      '<span class="out-err">INVALID — Initial value must be a positive ODD integer.</span>'
    );
    wrap.style.display = 'none';
    return;
  }

  // Generate sequence
  const seq = [raw];
  let cur = raw, iters = 0;
  while (cur !== 1 && iters < 10000) {
    cur = cur % 2 === 0 ? cur / 2 : 3 * cur + 1;
    seq.push(cur);
    iters++;
  }

  setOut('col-out',
    outLabel('Output') +
    `<span class="out-step">This program will find all the terms of the Collatz sequence.</span>\n\n` +
    `<span class="out-plain">Input initial value: ${raw}</span>\n\n` +
    `<span class="out-result">The Collatz sequence: ${seq.join(', ')}</span>`
  );

  // Render chain
  wrap.style.display = 'block';
  document.getElementById('col-chain').innerHTML = seq.map((n, i) => {
    const cls   = n === 1 ? 'end' : (n % 2 === 0 ? 'even' : 'odd');
    const arrow = i < seq.length - 1 ? '<span class="cz-arrow">→</span>' : '';
    return `<span class="cz-num ${cls}">${n}</span>${arrow}`;
  }).join('');

  // Stats
  const odds  = seq.filter(n => n % 2 !== 0 && n !== 1).length;
  const evens = seq.filter(n => n % 2 === 0).length;
  document.getElementById('col-stats').textContent =
    `Total terms: ${seq.length}  ·  Odd (excl. 1): ${odds}  ·  Even: ${evens}`;
}

// ── ACTIVITY 4: RECURSIVE SEQUENCES ──────────────────────────────
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
  const outId    = type + '-out';
  const chipsId  = type + '-chips';
  const raw      = parseInt(document.getElementById(type + '-n').value);
  const minTerms = type === 'trib' ? 4 : 3;
  const label    =
    type === 'fib'   ? 'Fibonacci'   :
    type === 'lucas' ? 'Lucas'       : 'Tribonacci';

  if (!raw || raw < minTerms) {
    setOut(outId,
      outLabel('Output') +
      `<span class="out-err">Input must be greater than ${minTerms - 1}.</span>`
    );
    document.getElementById(chipsId).innerHTML = '';
    return;
  }

  const seq =
    type === 'fib'   ? fibonacci(raw)   :
    type === 'lucas' ? lucas(raw)       : tribonacci(raw);

  setOut(outId,
    outLabel('Output') +
    `<span class="out-step">This program will find all the terms of the ${label} numbers.</span>\n\n` +
    `<span class="out-plain">Input the number of terms: ${raw}</span>\n\n` +
    `<span class="out-result">The ${label} numbers are: ${seq.join(', ')}</span>`
  );

  renderChips(chipsId, seq);
}

// ── ENTER KEY SUPPORT ─────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const id = document.activeElement?.id;
  if (id === 'div-a'   || id === 'div-b')  runDivision();
  if (id === 'gcd-a'   || id === 'gcd-b')  runGCD();
  if (id === 'col-n')                       runCollatz();
  if (id === 'fib-n')                       runSeq('fib');
  if (id === 'lucas-n')                     runSeq('lucas');
  if (id === 'trib-n')                      runSeq('trib');
});
