# Drone Hospital Network

An interactive Houston hospital drone delivery prototype.

**Live website:** https://hospital-drone-network.vercel.app

## Features

- Interactive map of 24 Houston hospitals, with scroll-wheel zoom.
- Routes use breadth-first search to find the fewest hops. Each clear-weather hop is limited to 10 miles; unreachable destinations are identified.
- Select a source and destination on the map, then use the New delivery popup to choose payload and delivery options.
- Deliveries show a moving drone along the route at a simulated 45 mph.
- Weather opens in a separate right-side panel. Live weather checks and editable regional demo conditions affect flight eligibility.
- DJI Flycart30 fleet with the supplied drone image and a configured maximum payload of 10 kg.
- Add a lab through address lookup and review its network connections.

## Run locally

The website is plain HTML, CSS, and JavaScript. No build or dependency installation is required.

From this repository's root, start a static server, for example with Python:

```sh
python -m http.server 4173 --directory dist
```

Open http://localhost:4173 in your browser. Map tiles, live weather, and address lookup require internet access.

## Deploy on Vercel

Import this repository into Vercel. The included `vercel.json` selects `dist` as the output directory and disables build and installation commands.

The existing live website was deployed through Vercel Drop. Pushing this repository does not automatically connect it to that Vercel project.

## Files

- `dist/` — website and bundled assets, ready for static hosting.
- `FEATURES.md` — detailed routing, weather, lab, fleet, and validation notes.
- `HOUSTON-SOURCES.json` — hospital location and map source references.
- `dist/vendor/LEAFLET-LICENSE.txt` — bundled Leaflet license.

Deliveries and added labs are saved locally in each browser. This prototype does not synchronize data between visitors. Its flight and payload limits are demonstration settings.
