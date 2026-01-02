import { isMapPanning } 
from "./map-module.js";

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
                    max: 100  
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
makeEmptyChart();
export function drawElevationChart(distanceData, elevationData, routeData, handlers = {}) {
    let canvas = document.getElementById('elevationChart');
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
    const {onHover} = handlers;
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
                if(isMapPanning()){
                    return;
                }
                if(!activeElement.length){
                    return;
                }
                const index = activeElement[0].index;
                if (onHover) {
                    onHover(index);
                }
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