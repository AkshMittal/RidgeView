
import {getLastRouteCenter, getLastRouteZoom, loadGPX } 
from "./gpx-engine.js";   

import {getMap, clearWorldFlyTimeouts, worldFly} 
from "./map-module.js";

import { showPhase1, showPhase3} 
from "./user-manuel.js";
let activePeakMarker = null;  
let currentPeakId = null;
let currentRouteId = null;
let loadingRouteId = null;
let clickedPath = null;
let map = getMap();
  
function collapseAllScrollAreas() {
    const areas = document.querySelectorAll(".scroll-area");
    const arrows = document.querySelectorAll(".master-arrow");
    areas.forEach(a => {
        a.classList.remove("show");
        a.style.maxHeight = "0px";
    });
    arrows.forEach(a => a.classList.remove("rotated"));
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

function getPeakIcon(height){
    return L.icon({
        iconUrl: "icons/mountain-solid-full.svg",
        iconSize:[32,32],
        iconAnchor:[16,28],
        popupAnchor:[0,-30]
    });
    
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
                clearWorldFlyTimeouts();
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
            if (!clickedPath){
                showPhase3();
            }
            if (window.innerWidth <= 850) {
                collapseAllScrollAreas();
            }
            clickedPath = route.path;
            let lastRouteCenter = getLastRouteCenter();
            let lastRouteZoom = getLastRouteZoom();
            if (currentRouteId === clickedPath && lastRouteCenter && lastRouteZoom) {
                map.stop();
                clearWorldFlyTimeouts();
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

showPhase1();



