/* ==========================================================================
   IE Toolkit — app.js
   1. Conversion data      (edit here to add units or categories)
   2. Pure functions       (convert, parseInput, formatNumber, evaluate)
   3. ConvertLab UI
   4. Site UI              (mobile nav, scroll reveal, footer year)
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Conversion data
     Linear units carry a `factor` to the category's base unit.
     Temperature units carry `toBase` / `fromBase` functions (base: kelvin).
     ------------------------------------------------------------------------ */
  const unit = (id, label, symbol, factor) => ({ id, label, symbol, factor });

  const CATEGORIES = [
    {
      id: 'length',
      label: 'Length',
      defaults: ['m', 'ft'],
      warnNegative: true,
      units: [
        unit('mm', 'Millimeter', 'mm', 0.001),
        unit('cm', 'Centimeter', 'cm', 0.01),
        unit('m', 'Meter', 'm', 1),
        unit('km', 'Kilometer', 'km', 1000),
        unit('in', 'Inch', 'in', 0.0254),
        unit('ft', 'Foot', 'ft', 0.3048),
        unit('yd', 'Yard', 'yd', 0.9144),
        unit('mi', 'Mile', 'mi', 1609.344),
      ],
    },
    {
      id: 'mass',
      label: 'Mass',
      defaults: ['kg', 'lb'],
      warnNegative: true,
      units: [
        unit('mg', 'Milligram', 'mg', 1e-6),
        unit('g', 'Gram', 'g', 0.001),
        unit('kg', 'Kilogram', 'kg', 1),
        unit('t', 'Metric ton', 't', 1000),
        unit('oz', 'Ounce', 'oz', 0.028349523125),
        unit('lb', 'Pound', 'lb', 0.45359237),
        unit('ton', 'US short ton', 'ton', 907.18474),
      ],
    },
    {
      id: 'pressure',
      label: 'Pressure',
      defaults: ['bar', 'psi'],
      units: [
        unit('pa', 'Pascal', 'Pa', 1),
        unit('kpa', 'Kilopascal', 'kPa', 1e3),
        unit('mpa', 'Megapascal', 'MPa', 1e6),
        unit('bar', 'Bar', 'bar', 1e5),
        unit('atm', 'Standard atmosphere', 'atm', 101325),
        unit('psi', 'Pound per square inch', 'psi', 6894.757293168),
        unit('mmhg', 'Millimeter of mercury', 'mmHg', 133.322387415),
      ],
    },
    {
      id: 'energy',
      label: 'Energy',
      defaults: ['kwh', 'mj'],
      units: [
        unit('j', 'Joule', 'J', 1),
        unit('kj', 'Kilojoule', 'kJ', 1e3),
        unit('mj', 'Megajoule', 'MJ', 1e6),
        unit('wh', 'Watt-hour', 'Wh', 3600),
        unit('kwh', 'Kilowatt-hour', 'kWh', 3.6e6),
        unit('cal', 'Calorie (thermochemical)', 'cal', 4.184),
        unit('kcal', 'Kilocalorie', 'kcal', 4184),
        unit('btu', 'British thermal unit (IT)', 'BTU', 1055.05585262),
      ],
    },
    {
      id: 'temperature',
      label: 'Temperature',
      defaults: ['c', 'f'],
      absolute: true,
      units: [
        { id: 'c', label: 'Celsius', symbol: '°C', toBase: (v) => v + 273.15, fromBase: (k) => k - 273.15 },
        { id: 'f', label: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v + 459.67) * 5) / 9, fromBase: (k) => (k * 9) / 5 - 459.67 },
        { id: 'k', label: 'Kelvin', symbol: 'K', toBase: (v) => v, fromBase: (k) => k },
        { id: 'r', label: 'Rankine', symbol: '°R', toBase: (v) => (v * 5) / 9, fromBase: (k) => (k * 9) / 5 },
      ],
    },
  ];

  const SIGNIFICANT_DIGITS = 6;
  const EMPTY_RESULT = '—';

  /* ------------------------------------------------------------------------
     2. Pure functions
     ------------------------------------------------------------------------ */
  const getCategory = (categoryId) => CATEGORIES.find((c) => c.id === categoryId);
  const getUnit = (category, unitId) => category.units.find((u) => u.id === unitId);

  const toBase = (u, value) => (u.toBase ? u.toBase(value) : value * u.factor);
  const fromBase = (u, base) => (u.fromBase ? u.fromBase(base) : base / u.factor);

  function convert(categoryId, value, fromId, toId) {
    const category = getCategory(categoryId);
    const from = category && getUnit(category, fromId);
    const to = category && getUnit(category, toId);
    if (!from || !to) return NaN;
    if (from === to) return value;
    const result = fromBase(to, toBase(from, value));
    // Offset conversions leave float residue (e.g. 5.7e-14 instead of 0).
    return category.absolute ? Math.round(result * 1e9) / 1e9 : result;
  }

  // Accepts "12", "-3.5", "3,5", ".5", "1e3". Returns { status, value }.
  function parseInput(raw) {
    const text = String(raw).trim().replace(/\s+/g, '').replace('−', '-');
    if (text === '') return { status: 'empty', value: null };
    if (!/^[+-]?(\d+([.,]\d*)?|[.,]\d+)(e[+-]?\d+)?$/i.test(text)) {
      return { status: 'invalid', value: null };
    }
    return { status: 'ok', value: Number(text.replace(',', '.')) };
  }

  const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };

  // Rounded to SIGNIFICANT_DIGITS, as a plain string parseInput can read back.
  function toPlainString(n) {
    const rounded = Number(n.toPrecision(SIGNIFICANT_DIGITS));
    return String(rounded === 0 ? 0 : rounded);
  }

  function formatNumber(n) {
    if (!Number.isFinite(n)) return EMPTY_RESULT;
    const rounded = Number(n.toPrecision(SIGNIFICANT_DIGITS));
    if (rounded === 0) return '0';
    const abs = Math.abs(rounded);
    let text;
    if (abs >= 1e9 || abs < 1e-6) {
      const [mantissa, exponent] = abs.toExponential().split('e');
      const power = String(Number(exponent)).split('').map((ch) => SUPERSCRIPT[ch]).join('');
      text = mantissa + ' × 10' + power;
    } else {
      text = abs.toLocaleString('en-US', { maximumFractionDigits: 12 });
    }
    return (rounded < 0 ? '−' : '') + text;
  }

  // Full pipeline for one conversion: parse, validate, convert.
  // Returns { status: 'empty' | 'error' | 'ok', value?, input?, message?, note? }.
  // `exactValue` (optional) replaces the parsed number when `raw` is only a rounded display of it.
  function evaluate(categoryId, raw, fromId, toId, exactValue) {
    const parsed = typeof exactValue === 'number' ? { status: 'ok', value: exactValue } : parseInput(raw);
    if (parsed.status === 'empty') return { status: 'empty' };
    if (parsed.status === 'invalid') return { status: 'error', message: 'Enter a valid number, for example 12.5' };
    if (!Number.isFinite(parsed.value)) return { status: 'error', message: 'That number is too large to convert' };

    const category = getCategory(categoryId);
    const from = getUnit(category, fromId);
    if (category.absolute && toBase(from, parsed.value) < -1e-9) {
      return { status: 'error', message: 'Below absolute zero (0 K) — enter a higher temperature' };
    }

    const value = convert(categoryId, parsed.value, fromId, toId);
    if (!Number.isFinite(value)) return { status: 'error', message: 'That number is too large to convert' };

    const note = category.warnNegative && parsed.value < 0
      ? 'Negative values are unusual for ' + category.label.toLowerCase()
      : '';
    return { status: 'ok', value, input: parsed.value, note };
  }

  // Lets the conversion logic be tested from Node without a browser.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CATEGORIES, convert, parseInput, formatNumber, toPlainString, evaluate };
  }
  if (typeof document === 'undefined') return;

  /* ------------------------------------------------------------------------
     3. ConvertLab UI
     ------------------------------------------------------------------------ */
  function initConvertLab() {
    const tabList = document.getElementById('cl-tabs');
    if (!tabList) return;

    const panel = document.getElementById('cl-panel');
    const valueInput = document.getElementById('cl-value');
    const fromSelect = document.getElementById('cl-from');
    const toSelect = document.getElementById('cl-to');
    const resultOutput = document.getElementById('cl-result');
    const swapButton = document.getElementById('cl-swap');
    const messageEl = document.getElementById('cl-message');
    const summaryEl = document.getElementById('cl-summary');

    let activeCategory = CATEGORIES[0];
    let lastResult = null;
    // After a swap the input shows a rounded number; this keeps the exact value
    // behind it so swapping back and forth does not accumulate rounding error.
    let carried = null;

    const tabs = CATEGORIES.map((category) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'tab';
      tab.id = 'cl-tab-' + category.id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'cl-panel');
      tab.textContent = category.label;
      tab.addEventListener('click', () => selectCategory(category));
      tabList.appendChild(tab);
      return tab;
    });

    function fillSelect(select, selectedId) {
      select.textContent = '';
      activeCategory.units.forEach((u) => {
        const option = document.createElement('option');
        option.value = u.id;
        option.textContent = u.label + ' (' + u.symbol + ')';
        select.appendChild(option);
      });
      select.value = selectedId;
    }

    function selectCategory(category) {
      activeCategory = category;
      carried = null;
      tabs.forEach((tab, index) => {
        const selected = CATEGORIES[index] === category;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', 'cl-tab-' + category.id);
      fillSelect(fromSelect, category.defaults[0]);
      fillSelect(toSelect, category.defaults[1]);
      update();
    }

    function update() {
      if (carried && carried.text !== valueInput.value) carried = null;
      const outcome = evaluate(
        activeCategory.id, valueInput.value, fromSelect.value, toSelect.value, carried ? carried.value : undefined
      );
      const isError = outcome.status === 'error';

      lastResult = outcome.status === 'ok' ? outcome.value : null;
      resultOutput.textContent = lastResult === null ? EMPTY_RESULT : formatNumber(lastResult);
      valueInput.setAttribute('aria-invalid', String(isError));
      messageEl.textContent = isError ? outcome.message : outcome.note || '';
      messageEl.classList.toggle('is-error', isError);

      if (lastResult === null) {
        summaryEl.textContent = '';
        return;
      }
      const from = getUnit(activeCategory, fromSelect.value);
      const to = getUnit(activeCategory, toSelect.value);
      summaryEl.textContent =
        formatNumber(outcome.input) + ' ' + from.symbol + ' = ' + formatNumber(lastResult) + ' ' + to.symbol;
    }

    function swap() {
      const previousFrom = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = previousFrom;
      if (lastResult !== null) {
        carried = { text: toPlainString(lastResult), value: lastResult };
        valueInput.value = carried.text;
      }
      swapButton.classList.toggle('is-flipped');
      update();
    }

    tabList.addEventListener('keydown', (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current === -1) return;
      const last = tabs.length - 1;
      const next = {
        ArrowRight: current === last ? 0 : current + 1,
        ArrowLeft: current === 0 ? last : current - 1,
        Home: 0,
        End: last,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].focus();
      selectCategory(CATEGORIES[next]);
    });

    valueInput.addEventListener('input', update);
    fromSelect.addEventListener('change', update);
    toSelect.addEventListener('change', update);
    swapButton.addEventListener('click', swap);

    selectCategory(activeCategory);
  }

  /* ------------------------------------------------------------------------
     4. Site UI
     ------------------------------------------------------------------------ */
  function initNav() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((item) => observer.observe(item));
  }

  function initFooterYear() {
    const year = document.getElementById('footer-year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  // Reveal styles only apply once JS is running, so content is never hidden without it.
  document.documentElement.classList.add('js');
  initConvertLab();
  initNav();
  initReveal();
  initFooterYear();
})();
