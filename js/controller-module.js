let hoverMapMarker = null;
let routeData = [];

export function setRouteData(_routeData){
    routeData = _routeData;
}
export function getHoverMapMarker(_hoverMapMarker){
    hoverMapMarker = _hoverMapMarker;
}

export function syncHighlights(index, source){
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
