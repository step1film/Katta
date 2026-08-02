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

## Publishing

The site is plain static files, published with GitHub Pages from the
`main` branch, root folder (Settings → Pages → Deploy from a branch).

The custom domain is `kasplock.com`, set under Settings → Pages → Custom
domain, which commits a `CNAME` file. Add it only once DNS points at
GitHub — while a custom domain is configured, the `github.io` URL
redirects to it, so the site can't be previewed there.

The domain's DNS needs these records at the registrar:

| Record | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| CNAME | `www` | `step1film.github.io` |

Every push to `main` republishes the site.

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
