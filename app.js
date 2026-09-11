import {
  LAYOUTS,
  PATTERNS,
  PATTERN_GROUPS,
  getLayout,
  identifyChords,
  isAccidental,
  layoutCells,
  layoutRange,
  midiNoteName,
  mod,
  noteName,
  patternById,
  patternPitchClasses,
  resolveSequence,
  resolveVoicing,
} from './music-theory.mjs';

const STORAGE_KEY = 'musifold-state-v3';
const LEGACY_STORAGE_KEYS = Object.freeze(['abeton-note-helper-state-v2']);
const DEFAULT_CHARTS = Object.freeze([
  ['major', 0],
  ['natural-minor', 0],
  ['dorian', 0],
  ['arp-major7', 0],
]);

const state = {
  charts: [],
  selectedMidi: new Set(),
  spelling: 'sharp',
  linkRoots: true,
  globalRoot: 0,
  layout: 'ipad',
  nextId: 1,
};

const elements = {
  charts: document.querySelector('#charts'),
  template: document.querySelector('#chart-template'),
  globalRoot: document.querySelector('#global-root'),
  spelling: document.querySelector('#spelling'),
  linkRoots: document.querySelector('#link-roots'),
  layout: document.querySelector('#layout'),
  layoutSummary: document.querySelector('#layout-summary'),
  layoutDescription: document.querySelector('#layout-description'),
  recognisedName: document.querySelector('#recognised-name'),
  recognisedDetail: document.querySelector('#recognised-detail'),
  selectedNotes: document.querySelector('#tapped-notes'),
  addChart: document.querySelector('#add-chart'),
  reset: document.querySelector('#reset'),
  clearSelection: document.querySelector('#clear-taps'),
};

function safeLoad() {
  try {
    const keys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (key !== STORAGE_KEY) localStorage.removeItem(key);
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      charts: state.charts.map(({ pattern, root }) => ({ pattern, root })),
      spelling: state.spelling,
      linkRoots: state.linkRoots,
      globalRoot: state.globalRoot,
      layout: state.layout,
      version: 3,
    }));
  } catch {
    // The app remains fully usable when storage is blocked.
  }
}

function normaliseRoot(value) {
  const root = Number(value);
  return Number.isFinite(root) ? mod(root) : 0;
}

function rootOptions() {
  const fragment = document.createDocumentFragment();
  for (let pitchClass = 0; pitchClass < 12; pitchClass += 1) {
    const option = document.createElement('option');
    option.value = String(pitchClass);
    option.textContent = noteName(pitchClass, state.spelling);
    fragment.appendChild(option);
  }
  return fragment;
}

function fillRootSelect(select, value) {
  select.replaceChildren(rootOptions());
  select.value = String(value);
}

function fillPatternSelect(select, selectedId) {
  const groups = new Map(PATTERN_GROUPS.map((group) => [group, document.createElement('optgroup')]));
  for (const [group, optgroup] of groups) optgroup.label = group;

  for (const entry of PATTERNS) {
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = entry.name;
    groups.get(entry.group).appendChild(option);
  }

  select.replaceChildren(...groups.values());
  select.value = selectedId;
}

function fillLayoutSelect() {
  const options = Object.values(LAYOUTS).map((layout) => {
    const option = document.createElement('option');
    option.value = layout.id;
    option.textContent = layout.shortLabel;
    return option;
  });
  elements.layout.replaceChildren(...options);
  elements.layout.value = state.layout;
}

function addChart(pattern = 'major', root = state.globalRoot, { render = true } = {}) {
  state.charts.push({ id: state.nextId, pattern: patternById(pattern).id, root: normaliseRoot(root) });
  state.nextId += 1;
  if (render) renderAll();
}

function duplicateChart(id) {
  const chart = state.charts.find((entry) => entry.id === id);
  if (!chart) return;
  addChart(chart.pattern, chart.root);
}

function removeChart(id) {
  state.charts = state.charts.filter((chart) => chart.id !== id);
  renderAll();
}

function configureGridStyle(grid, layout) {
  grid.style.setProperty('--columns', String(layout.columns));
  grid.style.setProperty('--grid-min-width', `${layout.gridMinWidth}px`);
  grid.setAttribute('aria-label', `${layout.columns} columns by ${layout.rows} rows`);
  grid.setAttribute('aria-colcount', String(layout.columns));
  grid.setAttribute('aria-rowcount', String(layout.rows));
  grid.dataset.layout = layout.id;
}

function createPad(cell, chart, entry, exactPattern, pitchClasses) {
  const pitchClass = mod(cell.midi);
  const isMember = entry.voicing || entry.sequence
    ? exactPattern.positionKeys.has(cell.key)
    : pitchClasses.has(pitchClass);
  const isRoot = isMember && pitchClass === chart.root;
  const isSelected = state.selectedMidi.has(cell.midi);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `pad ${isAccidental(pitchClass) ? 'accidental' : 'natural'}`;
  if (isMember) button.classList.add('member');
  if (isRoot) button.classList.add('root');
  if (isSelected) button.classList.add('tapped');

  button.dataset.midi = String(cell.midi);
  button.dataset.position = cell.key;
  button.setAttribute('role', 'gridcell');
  button.setAttribute('aria-rowindex', String(cell.visualRow + 1));
  button.setAttribute('aria-colindex', String(cell.column + 1));
  button.setAttribute('aria-pressed', String(isSelected));
  const sequenceSteps = entry.sequence ? exactPattern.stepsByPosition.get(cell.key) ?? [] : [];
  button.setAttribute(
    'aria-label',
    `${midiNoteName(cell.midi, state.spelling)}${sequenceSteps.length ? `, phrase ${sequenceSteps.length === 1 ? 'step' : 'steps'} ${sequenceSteps.join(', ')}` : isMember ? ', in pattern' : ''}${isSelected ? ', selected' : ''}`,
  );

  const name = document.createElement('span');
  name.className = 'note-name';
  name.textContent = noteName(pitchClass, state.spelling);
  const octave = document.createElement('span');
  octave.className = 'octave';
  octave.textContent = String(Math.floor(cell.midi / 12) - 1);
  button.append(name, octave);
  if (sequenceSteps.length) {
    const order = document.createElement('span');
    order.className = 'sequence-steps';
    order.textContent = sequenceSteps.join('·');
    button.appendChild(order);
  }

  button.addEventListener('click', () => {
    if (state.selectedMidi.has(cell.midi)) state.selectedMidi.delete(cell.midi);
    else state.selectedMidi.add(cell.midi);
    renderAll();
  });

  return button;
}

function drawGrid(grid, chart, entry, warning) {
  const layout = getLayout(state.layout);
  configureGridStyle(grid, layout);
  const pitchClasses = patternPitchClasses(chart.root, entry.intervals);
  const exactPattern = entry.sequence
    ? resolveSequence(state.layout, chart.root, entry.intervals)
    : entry.voicing
      ? resolveVoicing(state.layout, chart.root, entry.intervals)
      : null;

  for (const cell of layoutCells(state.layout)) {
    grid.appendChild(createPad(cell, chart, entry, exactPattern, pitchClasses));
  }

  if (entry.voicing && !exactPattern.complete) {
    const missing = exactPattern.missingNotes.map((midi) => midiNoteName(midi, state.spelling)).join(', ');
    warning.hidden = false;
    warning.textContent = `This exact voicing exceeds the ${layout.name} range; visible notes are shown${missing ? `. Missing: ${missing}.` : '.'}`;
  } else if (entry.sequence && !exactPattern.complete) {
    const missing = exactPattern.missingSteps
      .map(({ midi, step }) => `${step}: ${midiNoteName(midi, state.spelling)}`)
      .join(', ');
    warning.hidden = false;
    warning.textContent = `This phrase exceeds the ${layout.name} range; visible steps are shown${missing ? `. Missing: ${missing}.` : '.'}`;
  } else {
    warning.hidden = true;
    warning.textContent = '';
  }
}

function renderCharts() {
  elements.charts.replaceChildren();
  const fragment = document.createDocumentFragment();

  for (const chart of state.charts) {
    const entry = patternById(chart.pattern);
    const node = elements.template.content.cloneNode(true);
    const card = node.querySelector('.chart-card');
    card.dataset.id = String(chart.id);

    node.querySelector('.chart-family').textContent = entry.family;
    node.querySelector('.chart-title').textContent = `${noteName(chart.root, state.spelling)} ${entry.name}`;
    node.querySelector('.chart-formula').textContent = entry.formula;

    const rootSelect = node.querySelector('.chart-root');
    fillRootSelect(rootSelect, chart.root);
    rootSelect.addEventListener('change', (event) => {
      chart.root = normaliseRoot(event.target.value);
      if (state.linkRoots) {
        state.globalRoot = chart.root;
        for (const other of state.charts) other.root = chart.root;
      }
      renderAll();
    });

    const patternSelect = node.querySelector('.chart-pattern');
    fillPatternSelect(patternSelect, chart.pattern);
    patternSelect.addEventListener('change', (event) => {
      chart.pattern = patternById(event.target.value).id;
      renderAll();
    });

    node.querySelector('.duplicate-chart').addEventListener('click', () => duplicateChart(chart.id));
    node.querySelector('.remove-chart').addEventListener('click', () => removeChart(chart.id));

    drawGrid(node.querySelector('.pad-grid'), chart, entry, node.querySelector('.voicing-warning'));
    fragment.appendChild(node);
  }

  elements.charts.appendChild(fragment);
  if (!state.charts.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No charts. Use Add chart to create one.';
    elements.charts.appendChild(empty);
  }
}

function renderRecognition() {
  const notes = [...state.selectedMidi].sort((left, right) => left - right);
  const matches = identifyChords(notes, state.spelling);
  elements.selectedNotes.replaceChildren();
  elements.clearSelection.hidden = notes.length === 0;

  for (const midi of notes) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'note-chip';
    chip.textContent = midiNoteName(midi, state.spelling);
    chip.setAttribute('aria-label', `Remove ${midiNoteName(midi, state.spelling)}`);
    chip.addEventListener('click', () => {
      state.selectedMidi.delete(midi);
      renderAll();
    });
    elements.selectedNotes.appendChild(chip);
  }

  if (!notes.length) {
    elements.recognisedName.textContent = 'Tap pads in any grid';
    elements.recognisedDetail.textContent = 'Selected pitches are analysed as a chord, including inversions.';
    return;
  }

  if (!matches.length) {
    elements.recognisedName.textContent = 'No exact chord match';
    elements.recognisedDetail.textContent = notes.map((midi) => midiNoteName(midi, state.spelling)).join(' · ');
    return;
  }

  elements.recognisedName.textContent = matches.map((match) => match.name).join(' · ');
  elements.recognisedDetail.textContent = matches
    .map((match) => `${match.quality}, ${match.inversion}`)
    .join(' · ');
}

function renderLayoutText() {
  const layout = getLayout(state.layout);
  const range = layoutRange(state.layout);
  elements.layoutSummary.textContent = `${layout.shortLabel} · ${midiNoteName(range.low, state.spelling)}–${midiNoteName(range.high, state.spelling)}`;
  elements.layoutDescription.textContent = layout.description;
}

function syncControls() {
  fillRootSelect(elements.globalRoot, state.globalRoot);
  elements.spelling.value = state.spelling;
  elements.linkRoots.checked = state.linkRoots;
  elements.layout.value = state.layout;
}

function renderAll() {
  syncControls();
  renderLayoutText();
  renderRecognition();
  renderCharts();
  saveState();
}

function reset() {
  state.charts = [];
  state.selectedMidi.clear();
  state.spelling = 'sharp';
  state.linkRoots = true;
  state.globalRoot = 0;
  state.layout = 'ipad';
  state.nextId = 1;
  for (const [pattern, root] of DEFAULT_CHARTS) addChart(pattern, root, { render: false });
  renderAll();
}

function restore() {
  const stored = safeLoad();
  if (!stored) {
    reset();
    return;
  }

  state.spelling = stored.spelling === 'flat' ? 'flat' : 'sharp';
  state.linkRoots = stored.linkRoots !== false;
  state.globalRoot = normaliseRoot(stored.globalRoot);
  state.layout = LAYOUTS[stored.layout] ? stored.layout : 'ipad';
  state.nextId = 1;
  state.charts = [];

  const charts = Array.isArray(stored.charts) ? stored.charts : DEFAULT_CHARTS;
  for (const chart of charts) {
    if (Array.isArray(chart)) {
      addChart(chart[0], chart[1], { render: false });
    } else if (chart && typeof chart === 'object') {
      addChart(chart.pattern, chart.root, { render: false });
    }
  }
  renderAll();
}

elements.addChart.addEventListener('click', () => addChart('major'));
elements.reset.addEventListener('click', reset);
elements.clearSelection.addEventListener('click', () => {
  state.selectedMidi.clear();
  renderAll();
});
elements.globalRoot.addEventListener('change', (event) => {
  state.globalRoot = normaliseRoot(event.target.value);
  if (state.linkRoots) for (const chart of state.charts) chart.root = state.globalRoot;
  renderAll();
});
elements.spelling.addEventListener('change', (event) => {
  state.spelling = event.target.value === 'flat' ? 'flat' : 'sharp';
  renderAll();
});
elements.linkRoots.addEventListener('change', (event) => {
  state.linkRoots = event.target.checked;
  if (state.linkRoots) for (const chart of state.charts) chart.root = state.globalRoot;
  renderAll();
});
elements.layout.addEventListener('change', (event) => {
  state.layout = LAYOUTS[event.target.value] ? event.target.value : 'ipad';
  renderAll();
});

fillLayoutSelect();
restore();
