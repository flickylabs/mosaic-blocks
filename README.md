# Mosaic Blocks

Browser block puzzle prototype with a separate Player and Maker flow.

## Features

- 8x8 block puzzle board
- Three candidate blocks per turn
- Row and column clears with score, best score, and combo
- Player/Maker toggle
- Photo skin upload
- Texture presets
- Local skin pack persistence

## Local Run

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000/index.html`.

## Test

```bash
npm test
```
