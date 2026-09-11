import assert from 'node:assert/strict';
import {
  CHORD_DICTIONARY,
  LAYOUTS,
  PATTERNS,
  identifyChords,
  layoutCells,
  layoutRange,
  midiNoteName,
  noteName,
  padMidi,
  patternPitchClasses,
  resolveSequence,
  resolveVoicing,
} from './music-theory.mjs';

function pitchClass(midi) {
  return ((midi % 12) + 12) % 12;
}

for (const layout of Object.values(LAYOUTS)) {
  const cells = layoutCells(layout.id);
  assert.equal(cells.length, layout.columns * layout.rows, `${layout.name} cell count`);
  assert.equal(padMidi(layout.id, 0, 0), layout.baseMidi, `${layout.name} bottom-left MIDI`);

  for (let row = 0; row < layout.rows; row += 1) {
    for (let column = 1; column < layout.columns; column += 1) {
      assert.equal(
        padMidi(layout.id, row, column) - padMidi(layout.id, row, column - 1),
        1,
        `${layout.name} must rise one semitone to the right`,
      );
    }
  }

  for (let row = 1; row < layout.rows; row += 1) {
    assert.equal(
      padMidi(layout.id, row, 0) - padMidi(layout.id, row - 1, 0),
      5,
      `${layout.name} must rise a perfect fourth between rows`,
    );
  }
}

assert.equal(LAYOUTS.ipad.columns, 13);
assert.equal(LAYOUTS.ipad.rows, 5);
assert.equal(midiNoteName(padMidi('ipad', 0, 0)), 'C2');
assert.equal(noteName(padMidi('ipad', 1, 0)), 'F');
assert.deepEqual(
  Array.from({ length: 5 }, (_, row) => noteName(padMidi('ipad', row, 0))),
  ['C', 'F', 'A#', 'D#', 'G#'],
);
assert.equal(pitchClass(padMidi('ipad', 0, 12)), pitchClass(padMidi('ipad', 0, 0)));

assert.equal(LAYOUTS.iphone.columns, 5);
assert.equal(LAYOUTS.iphone.rows, 5);
assert.deepEqual(
  Array.from({ length: 5 }, (_, column) => midiNoteName(padMidi('iphone', 0, column))),
  ['C2', 'C#2', 'D2', 'D#2', 'E2'],
);
assert.deepEqual(
  Array.from({ length: 5 }, (_, column) => midiNoteName(padMidi('iphone', 4, column))),
  ['G#3', 'A3', 'A#3', 'B3', 'C4'],
);
assert.deepEqual(layoutRange('iphone'), { low: 36, high: 60 });

assert.equal(LAYOUTS.push.columns, 8);
assert.equal(LAYOUTS.push.rows, 8);
assert.equal(midiNoteName(padMidi('push', 0, 0)), 'C1');
assert.deepEqual(layoutRange('push'), { low: 24, high: 66 });

assert.throws(() => padMidi('ipad', -1, 0), RangeError);
assert.throws(() => padMidi('ipad', 0, 13), RangeError);

const ids = PATTERNS.map((entry) => entry.id);
assert.equal(new Set(ids).size, ids.length, 'Pattern IDs must be unique');
for (const entry of PATTERNS) {
  assert.ok(entry.name.length > 0);
  assert.ok(entry.formula.length > 0);
  assert.ok(entry.intervals.length > 0);
  assert.ok(entry.intervals.every(Number.isFinite));
  if (!entry.voicing && !entry.sequence) {
    assert.ok(entry.intervals.every((interval) => interval >= 0 && interval < 12));
    assert.equal(new Set(entry.intervals).size, entry.intervals.length);
  }
  if (entry.sequence) assert.ok(entry.intervals.every(Number.isInteger));
}

assert.deepEqual(
  [...patternPitchClasses(0, [0, 2, 4, 5, 7, 9, 11])].sort((a, b) => a - b),
  [0, 2, 4, 5, 7, 9, 11],
);

assert.equal(identifyChords([48, 52, 55])[0].name, 'C');
assert.equal(identifyChords([52, 55, 60])[0].name, 'C/E');
assert.ok(identifyChords([45, 48, 52, 55]).some((match) => match.name === 'Am7'));
assert.ok(identifyChords([45, 48, 52, 55]).some((match) => match.name === 'C6/A'));
assert.equal(identifyChords([50, 53, 57, 60])[0].name, 'Dm7');
assert.equal(identifyChords([48, 52, 55], 'flat')[0].name, 'C');

for (const entry of CHORD_DICTIONARY) {
  const notes = entry.intervals.map((interval) => 48 + interval);
  assert.ok(
    identifyChords(notes).some((match) => match.quality === entry.quality && match.root === 0),
    `Chord dictionary entry must recognise C ${entry.quality}`,
  );
}

for (const layout of Object.values(LAYOUTS)) {
  const validPositions = new Set(layoutCells(layout.id).map((cell) => cell.key));
  for (let root = 0; root < 12; root += 1) {
    for (const entry of PATTERNS.filter((candidate) => candidate.voicing)) {
      const result = resolveVoicing(layout.id, root, entry.intervals);
      assert.equal(result.positions.length, result.positionKeys.size, `${entry.name} must not repeat pad positions`);
      assert.ok(result.positions.every((position) => validPositions.has(position.key)));
      assert.equal(result.positions.length, result.visibleNotes.length);
      if (result.complete) assert.equal(result.positions.length, entry.intervals.length);
    }
  }
}

const phrases = PATTERNS.filter((entry) => entry.sequence);
assert.equal(phrases.length, 12, 'The initial jazz library must contain twelve phrases');
assert.ok(phrases.some((entry) => entry.id === 'lick-bebop-dominant-descent'));
assert.ok(phrases.some((entry) => entry.id === 'lick-major-ii-v-i'));
assert.ok(phrases.some((entry) => entry.id === 'lick-minor-ii-v-i'));
assert.ok(phrases.some((entry) => entry.id === 'lick-the-lick'));

for (const layout of Object.values(LAYOUTS)) {
  const validPositions = new Set(layoutCells(layout.id).map((cell) => cell.key));
  for (let root = 0; root < 12; root += 1) {
    for (const entry of phrases) {
      const result = resolveSequence(layout.id, root, entry.intervals);
      assert.equal(result.positions.length, result.visibleSteps.length);
      assert.ok(result.positions.every((position) => validPositions.has(position.key)));
      assert.equal(
        [...result.stepsByPosition.values()].flat().length,
        result.visibleSteps.length,
        `${entry.name} must retain every visible step`,
      );
      if (result.complete) assert.equal(result.positions.length, entry.intervals.length);
    }
  }
}

const repeatedPhrase = resolveSequence('ipad', 0, [0, 2, 0]);
assert.equal(repeatedPhrase.complete, true);
assert.equal(repeatedPhrase.positions.length, 3);
assert.ok([...repeatedPhrase.stepsByPosition.values()].some((steps) => steps.length === 2));

const descendingPhrase = resolveSequence('push', 0, [12, 11, 10, 7, 4, 0]);
assert.equal(descendingPhrase.complete, true);
assert.deepEqual(descendingPhrase.targetNotes, [48, 47, 46, 43, 40, 36]);

const ipadDrop2 = resolveVoicing('ipad', 0, [0, 7, 11, 16]);
assert.equal(ipadDrop2.complete, true);
assert.deepEqual(ipadDrop2.targetNotes, [36, 43, 47, 52]);
assert.equal(ipadDrop2.positions.length, 4);
assert.equal(ipadDrop2.positionKeys.size, 4, 'A voicing must select one physical pad per note');

const iphoneBDrop2 = resolveVoicing('iphone', 11, [0, 7, 11, 16]);
assert.equal(iphoneBDrop2.complete, false);
assert.ok(iphoneBDrop2.missingNotes.length > 0);

const pushRootless = resolveVoicing('push', 0, [4, 10, 14, 21]);
assert.equal(pushRootless.complete, true);
assert.equal(pushRootless.positions.length, 4);

for (let root = 0; root < 12; root += 1) {
  for (const entry of CHORD_DICTIONARY) {
    const rootLabel = noteName(root);
    for (const bassInterval of entry.intervals) {
      const bassPitchClass = (root + bassInterval) % 12;
      const bassMidi = 48 + bassPitchClass;
      const notes = entry.intervals.map((interval) => {
        const pitchClassValue = (root + interval) % 12;
        let midi = 48 + pitchClassValue;
        while (midi < bassMidi || (midi === bassMidi && pitchClassValue !== bassPitchClass)) midi += 12;
        return midi;
      });
      const bassIndex = entry.intervals.indexOf(bassInterval);
      notes[bassIndex] = bassMidi;
      const expected = `${rootLabel}${entry.suffix}${bassPitchClass === root ? '' : `/${noteName(bassPitchClass)}`}`;
      assert.ok(
        identifyChords(notes).some((match) => match.name === expected),
        `Must recognise ${expected} from ${notes.join(', ')}`,
      );
    }
  }
}

assert.deepEqual(identifyChords([]), []);
assert.deepEqual(identifyChords([60]), []);
assert.deepEqual(identifyChords([60, Number.NaN]), []);
assert.ok(identifyChords([48, 52, 55, 60]).some((match) => match.name === 'C'));

const DEGREE_BASE = new Map([
  [1, 0], [2, 2], [3, 4], [4, 5], [5, 7], [6, 9], [7, 11],
  [9, 14], [11, 17], [13, 21],
]);

function formulaTokens(formula) {
  return formula.split(/[\s–]+/u).filter(Boolean);
}

function tokenInterval(token) {
  const degreeMatch = token.match(/(\d+)$/u);
  assert.ok(degreeMatch, `Formula token must contain a degree: ${token}`);
  const degree = Number(degreeMatch[1]);
  assert.ok(DEGREE_BASE.has(degree), `Unsupported degree in formula: ${token}`);
  let accidental = 0;
  for (const symbol of token.slice(0, -degreeMatch[1].length)) {
    if (symbol === '♭') accidental -= 1;
    else if (symbol === '♯') accidental += 1;
    else if (symbol === '𝄫') accidental -= 2;
    else if (symbol === '♮') accidental += 0;
    else assert.fail(`Unsupported accidental in formula token: ${token}`);
  }
  return DEGREE_BASE.get(degree) + accidental;
}

function formulaIntervals(entry) {
  const raw = formulaTokens(entry.formula).map(tokenInterval);
  if (!entry.voicing) return raw.map((interval) => ((interval % 12) + 12) % 12).sort((a, b) => a - b);
  const ascending = [];
  for (const rawInterval of raw) {
    let interval = rawInterval;
    while (ascending.length && interval <= ascending.at(-1)) interval += 12;
    ascending.push(interval);
  }
  return ascending;
}

for (const entry of PATTERNS) {
  if (entry.sequence) continue;
  assert.deepEqual(
    formulaIntervals(entry),
    [...entry.intervals],
    `${entry.name} formula must match its stored intervals`,
  );
}

const { readFileSync, existsSync } = await import('node:fs');
const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('./app.js', import.meta.url), 'utf8');

for (const requiredId of [
  'layout', 'global-root', 'spelling', 'link-roots', 'clear-taps',
  'recognised-name', 'recognised-detail', 'tapped-notes', 'charts', 'chart-template',
]) {
  assert.match(html, new RegExp(`id=["']${requiredId}["']`), `index.html must contain #${requiredId}`);
}
assert.doesNotMatch(
  html.match(/<section class="toolbar"[\s\S]*?<\/section>/u)?.[0] ?? '',
  /id="clear-taps"/u,
  'Clear-all control belongs in the tapped-note analyser, not the global toolbar',
);
assert.match(
  html.match(/<section id="recogniser"[\s\S]*?<\/section>/u)?.[0] ?? '',
  /id="clear-taps"/u,
  'Clear-all control must be adjacent to selected notes in the analyser',
);
assert.match(appSource, /elements\.clearSelection\.hidden = notes\.length === 0/u);
assert.ok(existsSync(new URL('./assets/favicon.svg', import.meta.url)));
assert.ok(existsSync(new URL('./assets/social-preview.svg', import.meta.url)));
assert.ok(existsSync(new URL('./assets/social-preview.png', import.meta.url)));
assert.ok(existsSync(new URL('./enhancements.css', import.meta.url)));
assert.match(html, /Not affiliated with or endorsed by Ableton/u);

console.log(`All Musifold tests passed (${PATTERNS.length} patterns, 3 layouts).`);
