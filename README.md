# RidgeView

A GPX viewer for treks and routes. Takes a GPX file and turns it into a route on
a map, an elevation graph, and structured peak/range information — enough to
understand the shape and difficulty of a trek at a glance.

**Live:** https://akshmittal.github.io/RidgeView
**Build writeup:** [I didn't build this because I love tech](https://medium.com/@akshmittal/i-didnt-build-this-because-i-love-tech-b68a0c041bb0)

---

## Features

- **Route rendering** with Leaflet, on a manually managed polyline for full
  control over behaviour
- **Elevation graph** synced to the route
- **Bi-directional hover sync** — hover the chart, the map marker moves; hover
  the route, the chart follows
- **Custom markers** for peaks and points of interest
- **Dynamic sidebar** for ranges, routes and peaks
- **Onboarding overlay** that explains the hover-sync without blocking the view

## How it works

1. Parse the GPX → coordinates and elevation
2. Draw a polyline on the map
3. Sync the elevation graph to the route points
4. Hover markers for point-level inspection
5. Peak and range data loaded from a structured JS file

Straightforward. Nothing overengineered.

**Tech:** HTML, CSS, vanilla JavaScript, Leaflet, Chart.js.

---

## Things that turned out to be harder than they looked

**GPX files aren't uniform.** Some lack elevation, some structure points
differently. Fallbacks are necessary. What began as "draw a line on a map"
became parsing, the Haversine formula, and data-integrity assumptions.

**Bi-directional sync wants to loop forever.** Hovering the chart updates the
map, which updates the chart, and so on. My first fix was a boolean flag — crude
but effective. It works at this size; it doesn't scale. The better shape is a
controller that owns coordination rather than letting either side own it. That
was my first encounter with inversion of control, before I knew the term.

**Modularization broke things before it fixed them.** A 1,500-line JS file only I
could navigate got split into modules, and splitting it broke assumptions I
didn't know I had. Imported values are read-only; importing a variable directly
gives you a stale snapshot, and live state needs getters. Hover sync stopped
working because I was importing the correct variable and not its latest value —
the fix wasn't new logic, it was changing *where* state was accessed.
**Ownership matters more than access.** That's when state ownership clicked.

**Async became real when it broke the UI.** Clicking a route drew the polyline
immediately, mid-flight, while map tiles were still stretching from the zoom
animation. The route looked wrong until the animation settled. Fixing it
properly meant understanding promises, resolution timing,
`requestAnimationFrame`, and the difference between *code finishing* and *the
view being visually stable*.

**The onboarding overlay was a layering problem.** CSS tooltips fell apart under
responsive layouts. The working version is a dim visual layer, a transparent
click-catching layer above it, and highlighted elements in between — blocking
interaction without blocking visibility. White text worked over grey UI but
vanished over bright map tiles, so rather than recolouring per phase, a frosted
blur backdrop gives stable contrast everywhere.

---

## A race condition I chose not to fix

If a route is loading and you click another route mid-animation, the map updates
but the chart can show stale data.

The system is behaving exactly as designed — data is pipelined asynchronously
into modules that don't know which route is "current". Fixing it properly means
cancellation logic, versioning, or recursive callbacks.

I chose a simpler future guardrail instead: block interaction until a route
finishes loading. Not clever, but honest, and deferred deliberately rather than
missed.

---

## Status

v1 is a visualization tool, not a product. Core features work, the UI is stable.

Planned:

- Drag-and-drop GPX upload
- Multiple route layers
- Trek summary metrics — distance, elevation gain, highest point
- Better markers and a custom legend
- Persistent onboarding state
- Mid-flight interaction blocking (above)

Those are scope decisions, not bugs.

Data is currently injected directly into UI elements rather than going through a
data layer — not clean, but it matches what this is.

---

## What came next

[mapping-demo](https://github.com/AkshMittal/mapping-demo) extends this into an
embeddable trek viewer with smoothing, day segmentation, camps and route
playback.

---

## Why I built this

I didn't build this because I love tech — I actually don't. I built it because I
like mountains.

This project started making tech more bearable.

---

## Provenance

Written by hand — all modularization, all functions, the sync logic. I asked AI
questions and read docs while building, and checked my mental model against
what the system was actually doing rather than accepting explanations that
didn't match. Nothing here is pasted.
