# RidgeView
  
**Live Demo:** https://akshmittal.github.io/RidgeView  

---

## **What This Project Does**

This tool takes a GPX file and turns it into:

* A visual route on the map
* An elevation graph
* Key trek metrics
* Peak and range information (structured in the sidebar)
* Route paths and markers
* A clean, functional UI

It’s built to help understand the shape and difficulty of a trek at a glance.

---

## **Features**

* **Map Route Rendering** using Leaflet
* **Custom Markers** for peaks and points of interest
* **Dynamic Sidebar** for ranges, subgroups, and peaks
* **Elevation Graph** synced with the map
* **Hover Marker** showing point-specific elevation
* **Manually Managed Polyline** (for full control over route behavior)
* **Simple, Clean UI Layout** (sidebar + map + graph)
* **Future GPX Upload Support** (planned)

---

## **How It Works (Short Version)**

1. Parse GPX file → extract coordinates + elevation
2. Draw a polyline on the map
3. Sync the elevation graph with the route points
4. Display hover markers for interactive exploration
5. Load peak and range data from a structured JS file

Straightforward. Nothing overengineered.

---

## **Tech Stack**

* **HTML / CSS / Vanilla JavaScript**
* **Leaflet.js** for map rendering
* **Plotly (or your graph library)** for elevation charts
* **Modular JS structure** for map logic, UI logic, and data handling

---

## **Current State**

Core features work well. UI is stable. Code is being cleaned and modularized. More structure and refinements are ongoing.

---

## **Future Plans**

* Drag-and-drop GPX upload
* Multiple route layers
* Trek summary metrics (distance, elevation gain, highest point, etc.)
* Better markers + custom legend
* Togglable peaks and routes
* Cleaner, more polished UI
* General metrics panel (distance travelled, highest elevation, elevation gain, etc.)      


---

## **Why I Built This**

I didn’t build this because I love tech — I actually don’t.
I built it because I love the mountains.

Everything here exists for that reason. This project helps me make sense of treks, routes, elevation and the details that matter only when you genuinely care about being out there. The code is just the medium; the mountains are the motive.

---