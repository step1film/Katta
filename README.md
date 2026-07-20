# Katarina Holzmann Ekholm — Portfolio

A very simple, professional one-page portfolio site for filmmaker and
freelancer Katarina Holzmann Ekholm.

- Black & white design, no scrolling (each view fills the screen)
- Menu: **Home**, **About**, **Works**
- **Home** shows her portrait and a short CV

## Run

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server
```

## Replace the portrait

The site currently uses a placeholder at `assets/katarina.svg`.

1. Add the real photo, e.g. `assets/katarina.jpg`
2. In `index.html`, update the image source:
   `<img src="assets/katarina.jpg" ...>`

A portrait-oriented image (roughly 4:5) works best. It's shown in
grayscale automatically to match the design.

## Edit the text

- **CV / experience** and contact email → `index.html` (Home section)
- **About** text → `index.html` (About section)
- **Works** list → `index.html` (Works section)

## Files

- `index.html` — content
- `styles.css` — styling
- `script.js` — menu / page switching
