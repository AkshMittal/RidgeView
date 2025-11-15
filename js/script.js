const map = L.map('map', {
    minZoom: 2.2,
    maxZoom: 18,
    worldCopyJump: false,
}).setView([20, 0], 2.2);

const worldBounds = [[-85, -180], [85, 180]];
map.setMaxBounds(worldBounds);

const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
L.GPX.prototype._fitBounds = function() {};

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'; 
const tiles = L.tileLayer(tileURL, {
    attribution,
    maxZoom: 18,
    updateWhenIdle: false,
    updateWhenZooming: true,
    keepBuffer: 5})
    .addTo(map); 

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


let activePeakMarker = null;  
let currentPeakId = null;
let currentRouteId = null;
let loadingRouteId = null;
let currentHitbox = null;
let lastRouteCenter = null;
let lastRouteZoom = null;   
let isPanning = false;
let worldFlyTimeouts = [];

function collapseAllScrollAreas() {
    const areas = document.querySelectorAll(".scroll-area");
    const arrows = document.querySelectorAll(".master-arrow");
    areas.forEach(a => {
        a.classList.remove("show");
        a.style.maxHeight = "0px";
    });
    arrows.forEach(a => a.classList.remove("rotated"));
}



function worldFly(map, targetLatLng, finalZoom = 10) {
    map.setMaxBounds(null);
    map.stop(); 
    worldFlyTimeouts.forEach(id => clearTimeout(id));
    worldFlyTimeouts = [];

    const currentZoom = map.getZoom();
    const currentCenter = map.getCenter();
    inWorldFly = true;

    if (currentZoom <= 3) {
        map.flyTo(targetLatLng, 3, {
            duration: 1.2,
            animate: true,
            easeLinearity: 0.25
        });
        worldFlyTimeouts.push(
            setTimeout(() => {
                map.flyTo(targetLatLng, finalZoom, {
                    duration: 1.5,
                    animate: true,
                    easeLinearity: 0.25
                });
            }, 1200)
        );
        return;
    }

    map.flyTo(currentCenter, 3, {
        duration: 0.8,
        animate: true,
        easeLinearity: 0.25
    });

    worldFlyTimeouts.push(
        setTimeout(() => {
            map.flyTo(targetLatLng, 3, {
                duration: 1.2,
                animate: true,
                easeLinearity: 0.25
            });
        }, 800)
    );

    worldFlyTimeouts.push(
        setTimeout(() => {
            map.flyTo(targetLatLng, finalZoom, {
                duration: 1.5,
                animate: true,
                easeLinearity: 0.25
            });
        }, 2000)
    );
    map.once("moveend", () => {
        map.setMaxBounds(worldBounds);
        inWorldFly = false;
        isPanning = false;  
    });
}


let inWorldFly = false;

function worldFlyToBounds(targetCenter, targetZoom) {
    isPanning = false;
    map.setMaxBounds(null);
    map.stop();
    worldFlyTimeouts.forEach(id => clearTimeout(id));
    worldFlyTimeouts = [];

    const currentZoom = map.getZoom();
    inWorldFly = true;

    if (currentZoom < 3) {
        map.flyTo(targetCenter, 3, { duration: 1.2 });

        map.once('moveend', () => {
            if (!inWorldFly) return;

            const zoomInId = setTimeout(() => {
                map.flyTo(targetCenter, targetZoom, { duration: 1.5 });

                const boundsId = setTimeout(() => {
                    map.setMaxBounds(worldBounds);
                }, 1000);
                worldFlyTimeouts.push(boundsId);

                isPanning = false;
                inWorldFly = false;
            }, 0);

            worldFlyTimeouts.push(zoomInId);
        });

        return;
    }

    map.flyTo(map.getCenter(), 3, { duration: 0.8 });

    map.once('moveend', () => {
        if (!inWorldFly) return;

        map.flyTo(targetCenter, 3, { duration: 1.2 });

        map.once('moveend', () => {
            const zoomInId = setTimeout(() => {
                map.flyTo(targetCenter, targetZoom, { duration: 1.5 });

                const boundsId = setTimeout(() => {
                    map.setMaxBounds(worldBounds);
                }, 500);
                worldFlyTimeouts.push(boundsId);

                isPanning = false;
                inWorldFly = false;
            }, 0);

            worldFlyTimeouts.push(zoomInId);
        });
    });
}


function makeEmptyChart() {
    let canvasEl = document.getElementById("elevationChart"); 
    let ctx = canvasEl.getContext("2d");                       
    canvasEl.style.backgroundColor = "#f2efe9";                
    window.elevationChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Elevation",
                data: [],
                borderWidth: 2,
                borderColor: "#333",
                pointRadius: 0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: "linear",
                    position: "bottom",
                    title: {
                        display: true,
                        text: "Distance (km)"
                    },
                    min: 0,
                    max: 100  // placeholder axis
                },
                y: {
                    title: {
                        display: true,
                        text: "Elevation (m)"
                    },
                    min: 0,
                    max: 5000
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function buildPeaksMaster(masterId, label, peaksObj) {
    const masterUL = document.getElementById(masterId);

    const header = document.createElement("li");
    header.classList.add("master-header");

    const labelSpan = document.createElement("span");
    labelSpan.textContent = label;
    labelSpan.classList.add("master-text");
    
    const arrow = document.createElement("span");
    arrow.classList.add("master-arrow");
    
    header.appendChild(arrow);
    header.appendChild(labelSpan);

    const inner = document.createElement("ul");
    inner.classList.add("master-inner");

    buildPeakRanges(inner, peaksObj);

    const scrollWrap = document.createElement("div");
    scrollWrap.classList.add("scroll-area");
    scrollWrap.appendChild(inner);

    masterUL.appendChild(header);
    masterUL.appendChild(scrollWrap);

    header.addEventListener("click", () => {
        const master = header.parentElement; 
        const scrollWrap = master.querySelector(".scroll-area");
        const otherMaster =
            master.id === "peakMaster"
            ? document.getElementById("routeMaster")
            : document.getElementById("peakMaster");

        const isExpanding = !scrollWrap.classList.contains("show");

            if (isExpanding) {
        if (window.innerWidth <= 850) {
            document.querySelectorAll(".scroll-area").forEach(a => {
                if (a !== scrollWrap) {
                    a.classList.remove("show");
                    a.style.maxHeight = "0px";
                }
            });
            document.querySelectorAll(".master-arrow").forEach(a => {
                if (a !== arrow) a.classList.remove("rotated");
            });
        }

        master.style.flex = "0 0 auto";
        if (otherMaster) otherMaster.style.flex = "0 0 auto";

            scrollWrap.classList.add("show");
            arrow.classList.add("rotated");
            scrollWrap.style.maxHeight = scrollWrap.scrollHeight + "px";
        } else {
            scrollWrap.classList.remove("show");
            arrow.classList.remove("rotated");
            scrollWrap.style.maxHeight = "0px";
            master.style.flex = "0 0 auto";
        }

    });
}   


function buildPeakRanges(container, peaksObj) {
    for (const range in peaksObj) {
        const rangeHeader = document.createElement("li");
        rangeHeader.classList.add("list-header");

        const labelSpan = document.createElement("span");
        labelSpan.textContent = range;
        
        const arrow = document.createElement("span");
        arrow.classList.add("inner-arrow");
    
        rangeHeader.appendChild(arrow);
        rangeHeader.appendChild(labelSpan);
        const inner = document.createElement("ul");
        inner.classList.add("inner-list");

        buildPeakItems(inner, peaksObj[range]);

        rangeHeader.addEventListener("click", () => {
            if (inner.classList.contains("show")) {
                inner.style.maxHeight = inner.scrollHeight + "px";
                requestAnimationFrame(() => (inner.style.maxHeight = "0px"));
                inner.classList.remove("show");
                arrow.classList.remove("rotated");
                
            } else {
                inner.classList.add("show");
                inner.style.maxHeight = inner.scrollHeight + "px";
                arrow.classList.add("rotated");
                inner.addEventListener("transitionend", function handler() {
                inner.removeEventListener("transitionend", handler);
                });
            }
        });


        container.appendChild(rangeHeader);
        container.appendChild(inner);
    }
}


function buildPeakItems(ul, peakArray) {
    peakArray.forEach(p => {
        const li = document.createElement("li");
        li.classList.add("item-row");

        li.dataset.coords = JSON.stringify(p.coords);
        if (p.height) li.dataset.height = p.height;
        if (p.image) li.dataset.image = p.image;  

        const textSpan = document.createElement("span");
        textSpan.classList.add("item-text");
        textSpan.textContent = p.name;
        li.appendChild(textSpan);
        // Click → flyTo + marker update
        textSpan.addEventListener("click", () => {
            if (window.innerWidth <= 850) {
                collapseAllScrollAreas();
            }
            const coords = JSON.parse(li.dataset.coords);

            if (currentPeakId === p.name) {
                map.stop(); 
                worldFlyTimeouts.forEach(id => clearTimeout(id));
                worldFlyTimeouts = [];
                map.flyTo(p.coords, 9, {
                    duration: 1,
                    animate: true
                });
                return;      
            }

            if (activePeakMarker) {
                map.removeLayer(activePeakMarker);
            }
            currentPeakId = p.name;
            activePeakMarker = L.marker(coords, {icon : getPeakIcon(li.dataset.height)})
            .addTo(map);

            let popupHTML = `<b>${p.name}</b>`;
            if (p.height) popupHTML += `<br>${p.height} m`;
            if (p.image) popupHTML += `<br><img src="${p.image}" width="200">`;

            activePeakMarker.bindPopup(popupHTML, { autoPan: false }).openPopup();

            map.stop();
            worldFly(map, coords, 9);
            
        });

        ul.appendChild(li);
    });
}

function buildRoutesMaster(masterId, label, routesObj) {
    const masterUL = document.getElementById(masterId);

    const header = document.createElement("li");
    header.classList.add("master-header");

    const labelSpan = document.createElement("span");
    labelSpan.textContent = label;

    const arrow = document.createElement("span");
    arrow.classList.add("master-arrow");
    
    header.appendChild(arrow);
    header.appendChild(labelSpan);
    
    const inner = document.createElement("ul");
    inner.classList.add("master-inner");

    buildRouteRanges(inner, routesObj);

    const scrollWrap = document.createElement("div");
    scrollWrap.classList.add("scroll-area");
    scrollWrap.appendChild(inner);

    masterUL.appendChild(header);
    masterUL.appendChild(scrollWrap);

    header.addEventListener("click", () => {
        const master = header.parentElement; 
        const scrollWrap = master.querySelector(".scroll-area");
        const otherMaster =
            master.id === "peakMaster"
            ? document.getElementById("routeMaster")
            : document.getElementById("peakMaster");

        const isExpanding = !scrollWrap.classList.contains("show");

            if (isExpanding) {
        if (window.innerWidth <= 850) {
            document.querySelectorAll(".scroll-area").forEach(a => {
                if (a !== scrollWrap) {
                    a.classList.remove("show");
                    a.style.maxHeight = "0px";
                }
            });
            document.querySelectorAll(".master-arrow").forEach(a => {
                if (a !== arrow) a.classList.remove("rotated");
            });
        }

        master.style.flex = "0 0 auto";
        if (otherMaster) otherMaster.style.flex = "0 0 auto";

            scrollWrap.classList.add("show");
            arrow.classList.add("rotated");
            scrollWrap.style.maxHeight = scrollWrap.scrollHeight + "px";
        } else {
            scrollWrap.classList.remove("show");
            arrow.classList.remove("rotated");
            scrollWrap.style.maxHeight = "0px";
            master.style.flex = "0 0 auto";
        }

    });
}


function buildRouteRanges(container, routesObj) {
    for (const range in routesObj) {

        const rangeHeader = document.createElement("li");
        rangeHeader.classList.add("list-header");

        const labelSpan = document.createElement("span");
        labelSpan.textContent = range;

        const arrow = document.createElement("span");
        arrow.classList.add("inner-arrow"); 
        
        rangeHeader.appendChild(arrow);
        rangeHeader.appendChild(labelSpan);

        const inner = document.createElement("ul");
        inner.classList.add("inner-list");

        buildRouteItems(inner, routesObj[range]);

        rangeHeader.addEventListener("click", () => {
            if (inner.classList.contains("show")) {
                inner.style.maxHeight = inner.scrollHeight + "px";
                requestAnimationFrame(() => (inner.style.maxHeight = "0px"));
                inner.classList.remove("show");
                arrow.classList.remove("rotated");
          
                inner.addEventListener("transitionend", function h() {
                
                inner.removeEventListener("transitionend", h);
                });
            } else {
                inner.classList.add("show");
                inner.style.maxHeight = inner.scrollHeight + "px";
                arrow.classList.add("rotated");

                inner.addEventListener("transitionend", function handler() {
                
                inner.removeEventListener("transitionend", handler);
                });
            }
        });


        container.appendChild(rangeHeader);
        container.appendChild(inner);
    }
}

function buildRouteItems(ul, routeArray) {
    routeArray.forEach(route => {
        const li = document.createElement("li");
        li.classList.add("item-row");

        li.dataset.gpx = route.path;

        const textSpan = document.createElement("span");
        textSpan.classList.add("item-text");
        textSpan.textContent = route.name;
        li.appendChild(textSpan);

        textSpan.addEventListener("click", () => {
            if (window.innerWidth <= 850) {
                collapseAllScrollAreas();
            }
            const clickedPath = route.path;
            
            if (currentRouteId === clickedPath && lastRouteCenter && lastRouteZoom) {
                map.stop();
                worldFlyTimeouts.forEach(id => clearTimeout(id));
                worldFlyTimeouts = [];
                map.flyTo(lastRouteCenter, lastRouteZoom, { duration: 1 });
                return;
            }

            if (loadingRouteId === clickedPath) {
                return;
            }
            loadingRouteId = clickedPath;
            currentRouteId = clickedPath
            loadGPX(clickedPath);
        });
        
        ul.appendChild(li);
    });
}

buildPeaksMaster("peakMaster", "Select Peaks", peaks);
buildRoutesMaster("routeMaster", "Select Routes", gpx);

function getPeakIcon(height){
    return L.icon({
        iconUrl: "Icons/mountain-solid-full.svg",
        iconSize:[32,32],
        iconAnchor:[16,28],
        popupAnchor:[0,-30]
    });
    
}   

let currentGpxLayer = null;
map.createPane("endMarkerPane");
map.getPane("endMarkerPane").style.zIndex = 650;
map.createPane('hoverMarkerPane');
map.getPane('hoverMarkerPane').style.zIndex = 700;  
const hoverMapMarker = L.circleMarker([0, 0], {
            radius: 6,
            color: "#14305F",    
            weight: 2,            
            fillColor: "#FFA046", 
            fillOpacity: 1,
            pane: 'hoverMarkerPane'
        }).addTo(map);
hoverMapMarker.setStyle({opacity:0, fillOpacity:0});
map.on('movestart', (e) => {
    isPanning = true;
    hoverMapMarker.setStyle({ opacity: 0, fillOpacity: 0 });
});

map.on('moveend', () => { 
    if(!inWorldFly){
        isPanning = false;
    }
});

map.on('dblclick', () => { 
  isPanning = true; 
  hoverMapMarker.setStyle({ opacity: 0, fillOpacity: 0 });
  setTimeout(() => { isPanning = false; }, 250);
});

function loadGPX(gpxPath) { 
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
    
    hoverMapMarker.setStyle({ opacity: 0, fillOpacity: 0 });

    let routeData = [];
    const gpx = new L.GPX(gpxPath, {
        async: true,
        polyline_options: { color: "#E78A3A", weight: 4, opacity: 0.8 },
        marker_options: {
            startIcon: startIconLarge,
            endIcon: endIconNormal,
            wptIcon: null
        }

    })
    .on('loaded', function (e) {
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
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                worldFlyToBounds(targetCenter, targetZoom);
            });
        });

          

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
        function syncHighlights(index, source){
            if(source !== "map"){
                updateMapHighlight(index);  
            }
            if(source !== "elevationChart"){
                updateElevationChartHighlight(index);
            }
        }
        function updateMapHighlight(index) {
        if (!routeData.length || !routeData[index]) {
            return;
        }
        const point = routeData[index];
        hoverMapMarker.setLatLng([point.lat2, point.lon2]);
        hoverMapMarker.setStyle({ opacity: 1, fillOpacity: 1 });

        }

        function updateElevationChartHighlight(index){
            const chart = window.elevationChart;
            if (!chart) return;
            chart.setActiveElements([{ datasetIndex: 0, index }]);
        
            const pt = chart.getDatasetMeta(0).data[index];
            if (pt && chart.tooltip && chart.tooltip.setActiveElements) {
                chart.tooltip.setActiveElements([{ datasetIndex: 0, index }], { x: pt.x, y: pt.y });
            }
            chart.update();
            hoverMapMarker.setLatLng([routeData[index].lat2, routeData[index].lon2]);
            hoverMapMarker.setStyle({ opacity: 1, fillOpacity: 1 });
        }
        
        let lastHoverTime = 0;
        const HOVER_INTERVAL = 16; 

        hitboxLine.on('mousemove', function(evt) {
        const now = performance.now();
        if (now - lastHoverTime < HOVER_INTERVAL) return; 
        lastHoverTime = now;

        if (!routeData.length || isPanning) return;
        const index = findNearestRoutePoint(evt.latlng);
        syncHighlights(index, "map");
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
            
            layer.distanceData = distanceData;
            layer.elevationData = elevationData;
            layer.totalDistanceKm = totalDistanceKm;

            console.log('Route processed — points:', points.length, 'total km:', totalDistanceKm.toFixed(3));

            try {
                drawElevationChart(distanceData, elevationData);
            } catch (err) {
                console.error('Failed to draw elevation graph:', err);
            }
        }
        function drawElevationChart(distanceData, elevationData) {
            canvas = document.getElementById('elevationChart');
            canvas.style.backgroundColor = "#f2efe9";
            if (!canvas) {
                console.error('#elevationChart canvas not found');
                return;
            }
            if (typeof Chart === 'undefined') {
                console.error('Chart.js not loaded');
                return;
            }

            if (!Array.isArray(distanceData) || distanceData.length === 0) distanceData = [0, 1, 2, 3];
            if (!Array.isArray(elevationData) || elevationData.length === 0) elevationData = [100, 150, 120, 180];
        
            const ctx = canvas.getContext('2d');

            window.elevationChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: routeData.map(function(p){
                        return p.dist.toFixed(2);
                    }),       
                    datasets: [{
                        label: 'Elevation (m)',
                        data: routeData.map(function(p){return p.ele}),
                        borderColor: '#14305F',
                        backgroundColor: '#3c92d85b',
                        fill: true,
                        pointRadius: 1,
                        tension: 0.25,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'nearest', intersect: false },
                    onHover: function(event, activeElement) {
                        if(isPanning){
                            return;
                        }
                        if(!activeElement.length){
                            return;
                        }
                        const index = activeElement[0].index;
                        syncHighlights(index, "elevationChart");
                    },                
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const idx = context.dataIndex;
                                    const elevs = context.dataset.data;
                                    const dists = (context.chart.data.labels || []).map(Number);

                                    const lines = [];
                                    const curElev = elevs[idx];
                                    lines.push(`Elevation: ${curElev == null ? 'n/a' : curElev.toFixed(0) + ' m'}`);

                                    let grad = null;
                                    if (idx > 0 && elevs[idx - 1] != null && !isNaN(dists[idx]) && !isNaN(dists[idx - 1])) {
                                        const deltaH = curElev - elevs[idx - 1];
                                        const deltaD = dists[idx] - dists[idx - 1]; // km
                                        if (deltaD !== 0) grad = deltaH / deltaD; // m per km
                                    } else if (idx < elevs.length - 1 && elevs[idx + 1] != null && !isNaN(dists[idx + 1]) && !isNaN(dists[idx])) {
                                        const deltaH = elevs[idx + 1] - curElev;
                                        const deltaD = dists[idx + 1] - dists[idx];
                                        if (deltaD !== 0) grad = deltaH / deltaD;
                                    }

                                    if (grad == null || !isFinite(grad)) {
                                        lines.push('Gradient: n/a');
                                    } else {
                                        const percent = grad / 10;
                                        lines.push(`Gradient: ${grad.toFixed(1)} m/km (${percent.toFixed(2)}%)`);
                                    }
                                    return lines;
                                }
                            }
                        }
                    },
                    scales: {
                        x: { title: { display: true, text: 'Distance (km)' } },
                        y: { title: { display: true, text: 'Elevation (m)' } }
                    }
                }
            });
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
    currentGpxLayer = gpx;
}

makeEmptyChart();




