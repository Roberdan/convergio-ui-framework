# Third-Party Licenses

The Convergio UI Framework bundles or ports work from the following upstream
projects. Their license notices are reproduced below in full.

---

## mapcn

The `MnGeoMap`, `MnGeoMarker`, `MnGeoPopup`, and `MnGeoControls` components
(together with their `.helpers.tsx` files) under `src/components/maranello/network/`
are ported and adapted from [mapcn](https://www.mapcn.dev) (source:
<https://github.com/AnmolSaini16/mapcn>).

```
MIT License

Copyright (c) 2025 Anmoldeep Singh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## MapLibre GL JS

`MnGeoMap` depends on [`maplibre-gl`](https://github.com/maplibre/maplibre-gl-js)
at runtime. It is installed as a regular npm dependency and its source is not
modified. MapLibre GL JS is distributed under the BSD-3-Clause license; its
full license text is included in the `maplibre-gl` package under
`node_modules/maplibre-gl/LICENSE.txt` when installed. A short summary:

```
BSD 3-Clause License

Copyright (c) 2020, MapLibre contributors
Copyright (c) 2014-2020, Mapbox

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the [three BSD conditions] are met.

[See node_modules/maplibre-gl/LICENSE.txt for the complete text.]
```

---

## Tile data and basemap styles

The framework **does not ship tile data**. `MnGeoMap` renders whatever tile
style the consumer supplies via the `styles` prop. Consumers remain solely
responsible for complying with the terms of service, attribution requirements,
and rate limits of their chosen tile provider. Notably:

- **OpenStreetMap** raster tiles served from `tile.openstreetmap.org` require
  the attribution "© OpenStreetMap contributors" and are subject to the
  [OSMF Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/),
  which prohibits heavy production use.
- **CARTO** basemaps (`basemaps.cartocdn.com`) require attribution and are
  governed by CARTO's Terms of Service.
- **MapTiler**, **Mapbox**, and other hosted providers require an API key and
  have their own attribution and usage terms.

MapLibre's built-in `attributionControl` automatically renders the
`attribution` string declared on each style's raster/vector source, so consumers
should always include that field.

The Convergio UI Framework showcase page uses OpenStreetMap raster tiles and
CARTO dark-matter tiles purely for demonstration and not as a production
recommendation.
