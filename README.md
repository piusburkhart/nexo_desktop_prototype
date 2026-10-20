# Nexo concepts

A static site that hosts three Nexo prototypes (Brief, Feed, Productivity) as one explorable site. Plain HTML/CSS/JS, no build step. Each prototype loads in its own `<iframe>`, so its CSS and JS stay isolated.

- `index.html`: the shell (top bar, toggle, iframes)
- `concepts.json`: all configuration
- `prototypes/`: `brief.html`, `feed.html`, `productivity.html`

Links: `/#brief`, `/#feed`, `/#productivity`. Keys `1`, `2`, `3` switch concepts.

## Run locally

```sh
npx serve .
# or
python3 -m http.server 8000
```

Use a server rather than opening `index.html` directly: the shell reads `concepts.json` with `fetch`.

## Swap a prototype

Replace the file in `prototypes/` (keep the file name), then **bump `version` in `concepts.json`** and push. The version is appended to the iframe URL (`?v=...`), so browsers fetch the new file instead of a cached one.

## Add a fourth concept

1. Put the file in `prototypes/`, e.g. `prototypes/inbox.html`.
2. Add an entry to `concepts` in `concepts.json`:
   ```json
   { "id": "inbox", "label": "Inbox", "file": "prototypes/inbox.html", "description": "One-line description" }
   ```
3. Push. The toggle, hash link (`#inbox`) and shortcut (`4`) appear automatically.

## Deploy on Vercel

Import the GitHub repo in Vercel, framework preset **Other**, no build command, output directory = repo root. Every push to `main` then deploys. No `vercel.json` is needed.

## Notes

The prototypes load Figtree and Newsreader from Google Fonts, so they need an internet connection to show those fonts.
