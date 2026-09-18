# Piano Without Fear of Black Keys

*Piano Without Fear of Black Keys* is a Musifold publication about translating musical function across instrument geometries without treating a familiar hand shape as the musical object.

The book uses the four-layer model:

`function → pitch spelling → register → instrument geometry`

The canonical source is `piano_transposition_manual.md`. The `assets/` directory contains the diagrams referenced by that manuscript, and `style.css` controls the handbook PDF layout. Earlier copies in Google Drive are historical mirrors rather than sources of truth.

## Build

The build requires Pandoc and WeasyPrint. From this directory:

```sh
./build.sh
```

This produces `Piano_Without_Fear_of_Black_Keys.pdf`. `book.html` is an intermediate build artefact and should not be treated as source.

## Pitch notation

The book uses scientific pitch notation with middle C = C4. Some software and hardware use different octave-number labels for the same MIDI pitches; the book's octave numbers follow its stated convention rather than a product-specific display convention.

## Project lineage

Musifold grew out of Ableton Note Helper. Ableton Note Helper remains a separate predecessor/reference project; this publication belongs to the broader Musifold project and extends its concern with music geometry across piano, guitar, Ableton Note, Push, and related layouts.
