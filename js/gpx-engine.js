
import { isMapPanning } 
from "./map-module.js"; 
import {drawElevationChart} 

from "./chart-module.js";

import { getHoverMapMarker, setRouteData, syncHighlights} 
from "./controller-module.js";

import { getMap, worldFlyToBounds } 
from "./map-module.js";

export function getLastRouteCenter(){
    return lastRouteCenter; 
}
export function getLastRouteZoom(){
    return lastRouteZoom; 
}
let map = getMap();

let routeData = [];
let lastRouteCenter = null;
let lastRouteZoom = null; 
let currentGpxLayer = null;
let currentHitbox = null;
map.createPane("endMarkerPane");
map.getPane("endMarkerPane").style.zIndex = 650;
map.createPane('hoverMarkerPane');
map.getPane('hoverMarkerPane').style.zIndex = 700;  

let hoverMapMarker = L.circleMarker([0, 0], {
            radius: 6,
            color: "#14305F",    
            weight: 2,            
            fillColor: "#FFA046", 
            fillOpacity: 1,
            pane: 'hoverMarkerPane'
        }).addTo(map);
hoverMapMarker.setStyle({opacity:0, fillOpacity:0});
getHoverMapMarker(hoverMapMarker);

const startIconLarge = L.icon({
    iconUrl: "https://unpkg.com/leaflet-gpx@1.7.0/pin-icon-start.png",
    shadowUrl: "https://unpkg.com/leaflet-gpx@1.7.0/pin-shadow.png",
    iconSize: [32, 52],     // larger start icon
    iconAnchor: [16, 52],
    shadowSize: [40, 40],
    pane: "markerPane"
});

const endIconNormal = L.icon({
    iconUrl: "https://unpkg.com/leaflet-gpx@1.7.0/pin-icon-end.png",
    shadowUrl: "https://unpkg.com/leaflet-gpx@1.7.0/pin-shadow.png",
    iconSize: [24, 40],     // normal size
    iconAnchor: [12, 40],
    shadowSize: [32, 32],
    pane: "endMarkerPane"
});    
function toRadians(deg){
    return deg * (Math.PI / 180);
}
function haversine(lat1, lon1, lat2, lon2){
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) ** 2 +
                    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                    Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // distance in km
    return distance;
}
function processPointsAndAttach(points, layer) {
    if (!points || points.length === 0) {
        console.warn('No track points to process.');
        return;
    }
    let totalDistanceKm = 0;
    const distanceData = [0];
    const elevationData = [];

    const firstEle = (points[0].getElementsByTagName('ele')[0] || points[0].getElementsByTagNameNS('*','ele')[0]);
    elevationData.push(firstEle ? parseFloat(firstEle.textContent) : null);

    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const lat1 = parseFloat(prev.getAttribute('lat'));
        const lon1 = parseFloat(prev.getAttribute('lon'));
        const lat2 = parseFloat(curr.getAttribute('lat'));
        const lon2 = parseFloat(curr.getAttribute('lon'));
        const d = haversine(lat1, lon1, lat2, lon2); 
        totalDistanceKm += d;

        const eleTag = curr.getElementsByTagName('ele')[0] || curr.getElementsByTagNameNS('*','ele')[0];
        const ele = eleTag ? parseFloat(eleTag.textContent) : 0;
        
        routeData.push({
            lat2,
            lon2,
            ele,
            dist: totalDistanceKm
        });
        
        distanceData.push(totalDistanceKm);
        elevationData.push(ele);
    }
    setRouteData(routeData);

    layer.distanceData = distanceData;
    layer.elevationData = elevationData;
    layer.totalDistanceKm = totalDistanceKm;

    console.log('Route processed — points:', points.length, 'total km:', totalDistanceKm.toFixed(3));

    try {
        drawElevationChart(distanceData, elevationData, routeData,{
            onHover: (index) => {
                syncHighlights(index, "elevationChart");
            }
        });
    } catch (err) {
        console.error('Failed to draw elevation graph:', err);
    }
}

function findTrkpts(doc) {
    if (!doc) return [];
    let nodes = doc.getElementsByTagName('trkpt');
    if (nodes && nodes.length) return nodes;
    nodes = doc.getElementsByTagNameNS('*', 'trkpt');
    if (nodes && nodes.length) return nodes;
    try {
        const xpath = ".//*[local-name() = 'trkpt']";
        const res = doc.evaluate(xpath, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        if (res && res.snapshotLength) {
            const arr = [];
            for (let i = 0; i < res.snapshotLength; i++) arr.push(res.snapshotItem(i));
            return arr;
        }
    } catch (err) {
        console.warn('XPath not available or failed:', err);
    }
    return [];
}


export function loadGPX(gpxPath) { 
     if (!window.L || !L.GPX) {
        console.error('Leaflet or leaflet-gpx plugin is not loaded.');
        return;
    }
    if (currentGpxLayer) {
        try {
            map.removeLayer(currentGpxLayer);
        } catch (err) {
            console.warn('Failed to remove previous GPX layer:', err);
        }
        currentGpxLayer = null;
        hoverMapMarker.setStyle({opacity:0, fillOpacity:0});
    }
    if (currentHitbox) { 
        try {
             map.removeLayer(currentHitbox);
        } catch(err){
                console.warn('Failed to remove previous hitbox layer:', err);
        }
        currentHitbox = null; }
  
    if (window.elevationChart) {
        try { window.elevationChart.destroy(); } catch (e) {}
        window.elevationChart = null;
    }

    const gpx = new L.GPX(gpxPath, {
        async: true,
        polyline_options: { color: "#E78A3A", weight: 4, opacity: 0 },
        marker_options: {
            startIcon: startIconLarge,
            endIcon: endIconNormal,
            wptIcon: null
        }

    })
    .on('loaded', async function (e) {
        function findPolyline(layer) {
            if (layer instanceof L.Polyline) {
                return layer;
            }

            if (layer.getLayers) {
                const children = layer.getLayers();
                for (const child of children) {
                    const found = findPolyline(child);
                    if (found) return found;
                }
            }

            if (layer._layers) {
                for (let key in layer._layers) {
                    const found = findPolyline(layer._layers[key]);
                    if (found) return found;
                }
            }

            return null;
        }
        const polyline = findPolyline(e.target);
        const hitboxLine = L.polyline(polyline.getLatLngs(), {
            color: "#000",
            weight: 15,         
            opacity: 0,         
            interactive: true    
        }).addTo(map);
        currentHitbox = hitboxLine;

        if (!polyline) {
            console.error("No polyline found anywhere inside GPX layer.");
            console.log(e.target);
            return;
        }


        const bounds = e.target.getBounds();
        const targetZoom = map.getBoundsZoom(bounds);
        const targetCenter = bounds.getCenter();
        lastRouteCenter = targetCenter;
        lastRouteZoom = targetZoom;  

        await worldFlyToBounds(map, targetCenter, targetZoom);
        polyline.setStyle({ opacity: 1 , fillOpacity: 1 });
          

        const xmlOrString = e.target._gpx;
        const xmlDoc = (typeof xmlOrString === 'string') ? new DOMParser().parseFromString(xmlOrString, 'text/xml') : xmlOrString;
    
        function findNearestRoutePoint(latlng){
            let minDist = Infinity;
            let nearestIndex = 0;
            for (let i = 0; i < routeData.length; i++) {
                const p = routeData[i];
                const d = map.distance(latlng, [p.lat2, p.lon2]); 
                if (d < minDist) {
                    minDist = d;
                    nearestIndex = i;
                }
            }

            return nearestIndex;
        }
        
        let lastHoverTime = 0;
        const HOVER_INTERVAL = 16; 

        hitboxLine.on('mousemove', function(evt) {
        const now = performance.now();
        if (now - lastHoverTime < HOVER_INTERVAL) return; 
        lastHoverTime = now;

        if (!routeData.length || isMapPanning()) return;
        const index = findNearestRoutePoint(evt.latlng);
        syncHighlights(index, "map");
        });

        let trkpts = findTrkpts(xmlDoc);
        if (!trkpts || trkpts.length === 0) {
            console.warn('No trkpt found from plugin XML. Falling back to fetch:', gpxPath);
            fetch(gpxPath).then(r => {
                if (!r.ok) throw new Error('GPX fetch failed: ' + r.status);
                return r.text();
            }).then(text => {
                const parsed = new DOMParser().parseFromString(text, 'text/xml');
                trkpts = findTrkpts(parsed);
                processPointsAndAttach(trkpts, e.target);
            }).catch(err => console.error('GPX fetch fallback failed:', err));
            return;
        }

        processPointsAndAttach(trkpts, e.target);
        currentRouteId = gpxPath;
        loadingRouteId = null;


    }).addTo(map);
    routeData = [];
    currentGpxLayer = gpx;
}
