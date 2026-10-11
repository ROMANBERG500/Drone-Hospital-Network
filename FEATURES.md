# Hospital Drone Network — Regional weather copy

Live production website: https://hospital-drone-network.vercel.app

Vercel project: https://vercel.com/bang-dbbd/hospital-drone-network. Published through Vercel Drop using the standalone HTML as `index.html`. Hosted website data remains browser-local; added labs and deliveries are not synchronized between visitors or copied from the original local-file browser storage.

This is a separate local copy of the Houston hospital website. The original HTML, source directory, and saved browser data are unchanged. This copy uses browser storage key `hdn-weather-aware-v1`. Its initial sample drones are grounded so no sample aircraft launches without a check.

Open `hospital-drone-network-weather-aware.html` in a browser with an internet connection. The supplied source archive contains `dist/index.html` and all site assets. The standalone HTML embeds the application, styles, Leaflet library, and license. Map tiles and live weather require the internet.

## Showing the weather block

1. Select Demo weather, then Rain in northwest. Six rectangular geographic zones can be edited independently under Customize the six Houston zones. They are simulated weather areas, not official districts or real weather polygons.
2. Methodist Cypress → Methodist Willowbrook is blocked by northwest rain, while Houston Methodist → Greater Heights remains available in the clear area.
3. Select Low visibility in central Houston. The 7.2-mile Houston Methodist → Greater Heights hop is removed by the five-mile limit; the 0.4-mile Houston Methodist → Ben Taub hop remains available. Clear northern areas retain ten-mile hops.
4. Select Northwest rain + central low visibility to show rain, low visibility, and clear areas together. Use Clear across Houston to restore ten-mile hops. The original payload options and 45 mph simulation are retained.
5. Select Live weather to return to current public weather data. Demo conditions never overwrite live API results, and flights record which mode passed their launch check. The existing Weather button still opens the separate right-side local-weather panel.

## Joining a new lab

Choose **Join the network** above the map or in the facility directory. Enter the lab name and street address, then select **Find address**. The U.S. Census Bureau's public address geocoder returns a standardized address and approximate location. Review the map pin and nearby network stops, then choose **Add lab to network**. Internet access is required for address lookup and map tiles. The Census API supports JSONP for browser clients and does not require an API key: https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html.

The lab receives its own node and appears in the directory, map, route selectors, and New delivery pickup/destination options. It can act as an intermediate relay. Routes are recalculated immediately and retain the ten-mile clear-weather and five-mile low-visibility limits, rain restrictions, and preflight launch guards. A new lab can connect previously disconnected hospitals if its location creates an allowed path.

Locations must fall within the six-zone Houston demo area. Unmatched, malformed, and outside-area addresses cannot create nodes. Labs with no existing stop within ten miles can join as isolated nodes; their preview explains why flights are unavailable until a nearby stop joins. Duplicate lab/name/address entries are rejected. Editing an address invalidates its previous match, and pending lookups cannot add a node after the dialog closes.

Added labs are saved in the existing browser-local weather-copy storage alongside deliveries. They survive a reload and a fleet/delivery demo reset. Saved data is validated and restored before saved delivery routes are checked. The original website and original browser storage remain separate. This prototype does not register a lab in a shared online network; different browsers do not share these additions.

## Live weather and launch policy

Open-Meteo provides modeled current conditions and hourly forecasts through its public Forecast API: https://open-meteo.com/en/docs. There is no API key and no personal location is requested. Only public hospital coordinates and route midpoint coordinates are sent. Each flight leg is screened at its departure hospital, midpoint, and arrival hospital, using current conditions and the forecast during that leg's expected flight window. A four-hop path checks 12 samples in one request.

Demo limits allow wind below 20 mph, gusts below 25 mph, and temperatures from 32°F through 104°F. Visibility at least three miles allows ten-mile hops. Visibility from one mile to less than three miles reduces each affected hop to five miles; below one mile blocks launch. Rain, precipitation, snow, ice, freezing fog, and thunderstorms block launch. These are demonstration thresholds, not a particular aircraft's certified capabilities. The same visibility/range rule screens live current readings and forecasts.

Regional demo routing uses breadth-first search over allowed connections, checking the whole straight line through every zone, including boundary crossings. It finds the fewest allowed hops and uses additional relay hospitals if possible. A hop crossing rain cannot fly; a hop touching low visibility must be five miles or shorter. If no path exists, the planner explicitly reports it and disables launch. A blocked physical-network path remains on the map for reference. Live mode screens its chosen network path and does not search alternate routes.

Map overlays shade rain blue and low visibility amber. Red connections are blocked; low-visibility routes label their five-mile limit. A hospital's local coverage circle shrinks to five miles in low visibility. The New delivery popup retains the selected destination when weather changes and updates route choices and launch eligibility. Deliveries record their launch pattern, regional weather, and per-hop distance limits.

A check expires after two minutes. Current weather older than 45 minutes, missing variables, wrong or missing units, gaps in forecast coverage, API failures, and connection failures all block launch. Visibility is converted from feet or meters according to the response units. A Check again button forces a new check; visible selections are revisited every 30 seconds, and fresh cached results are reused until expiration. The displayed source, check timestamp, and weather timestamp identify the data being used.

Weather is enforced at dispatch in the map control, New delivery form, delivery creation function, and legacy sample launch action. A pending or failed check cannot consume a drone or create a delivery. Existing in-progress simulations keep their flight plan; this version does not simulate an aircraft diverting or landing after a weather change. The feed is modeled near-surface weather and does not provide operational clearance, airspace restrictions, altitude-specific wind, or complete aviation hazard coverage.

## Verification

Automated checks cover current and forecast hazards, regional rain/clear coexistence, whole-line zone intersections, visibility and five-mile boundaries, 4,032 minimum-hop source/destination combinations across seven patterns, an alternate relay path, live range reduction, US visibility conversion, incomplete/stale/gapped responses, connection/HTTP failure, cache expiry, response races, dispatch guards, saved launch limits, and isolated storage. Browser checks cover matching overlays, allowed and blocked routes, popup selection retention, custom zones, and phone layouts.

Lab checks cover validated address results and Houston bounds, duplicate prevention, source/destination/relay roles, a lab restoring a route under five-mile limits, rain blocking, persisted reload before delivery validation, protected original hospital IDs, sanitized stored URLs, canceled lookup cleanup, and co-located node handoffs with finite progress. The live Census geocoder was verified using 1000 Main St, Houston, TX 77002. Browser checks confirmed address lookup and pin review, a new node and directory entry, reload persistence, a Methodist → new lab → LBJ relay route using 3.8-mile and 4.9-mile hops, pickup/destination menus, invalidation after editing the address, and phone layouts without horizontal overflow. The lab used in browser verification is test data in a separate localhost origin and is not preloaded into the delivered website.

## DJI Flycart30 fleet

All fleet cards and drone details show the user-supplied DJI Flycart30 image and the configured 10 kg maximum payload. Unit IDs, statuses, battery levels, deliveries, and custom labs are preserved when restoring saved browser data. New deliveries accept 0.1–10 kg; the form, dispatch function, and legacy sample launch guard reject larger payloads before consuming a drone. The image is bundled in the source archive and embedded directly in the standalone HTML. The 10 kg limit is this website’s configured payload policy.
