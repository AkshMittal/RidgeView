let isPanning = false;
let inWorldFly = false;
let worldFlyTimeouts = [];

export function getMap(){
    return map;
}

const map = L.map('map', {
    minZoom: 2.2,
    maxZoom: 18,
    worldCopyJump: false,
}).setView([20, 0], 2.2);

getMap(map);

export const worldBounds = [[-85, -180], [85, 180]];
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

export function setPanning(val) {
  isPanning = val;
}

export function isMapPanning() {
  return isPanning;
}

function setWorldFlying(val) {
  inWorldFly = val;
}

function isWorldFlying() {
  return inWorldFly;
}

export function clearWorldFlyTimeouts() {
  worldFlyTimeouts.forEach(id => clearTimeout(id));
  worldFlyTimeouts = [];
}

export function worldFly(map, targetLatLng, finalZoom = 10) {
  map.setMaxBounds(null);
  map.stop();
  clearWorldFlyTimeouts();

  const currentZoom = map.getZoom();
  const currentCenter = map.getCenter();
  setWorldFlying(true);

  if (currentZoom <= 3) {
    map.flyTo(targetLatLng, 3, { duration: 1.2, easeLinearity: 0.25 });
    worldFlyTimeouts.push(
      setTimeout(() => {
        map.flyTo(targetLatLng, finalZoom, { duration: 1.5, easeLinearity: 0.25 });
      }, 1200)
    );
    return;
  }

  map.flyTo(currentCenter, 3, { duration: 0.8 });

  worldFlyTimeouts.push(
    setTimeout(() => {
      map.flyTo(targetLatLng, 3, { duration: 1.2 });
    }, 800)
  );

  worldFlyTimeouts.push(
    setTimeout(() => {
      map.flyTo(targetLatLng, finalZoom, { duration: 1.5 });
    }, 2000)
  );

  map.once("moveend", () => {
    map.setMaxBounds(worldBounds);
    setWorldFlying(false);
    setPanning(false);
  });
}

export function worldFlyToBounds(map, targetCenter, targetZoom) {
  setPanning(false);
  map.setMaxBounds(null);
  map.stop();
  clearWorldFlyTimeouts();
  setWorldFlying(true);

  const currentZoom = map.getZoom();

  if (currentZoom < 3) {
    map.flyTo(targetCenter, 3, { duration: 1.2 });

    map.once("moveend", () => {
      if (!isWorldFlying()) return;

      worldFlyTimeouts.push(
        setTimeout(() => {
          map.flyTo(targetCenter, targetZoom, { duration: 1.5 });
          worldFlyTimeouts.push(
            setTimeout(() => map.setMaxBounds(worldBounds), 500)
          );
          setWorldFlying(false);
          setPanning(false);
        }, 0)
      );
    });
    return;
  }

  map.flyTo(map.getCenter(), 3, { duration: 0.8 });

  map.once("moveend", () => {
    if (!isWorldFlying()) return;

    map.flyTo(targetCenter, 3, { duration: 1.2 });

    map.once("moveend", () => {
      worldFlyTimeouts.push(
        setTimeout(() => {
          map.flyTo(targetCenter, targetZoom, { duration: 1.5 });
          worldFlyTimeouts.push(
            setTimeout(() => map.setMaxBounds(worldBounds), 500)
          );
          setWorldFlying(false);
          setPanning(false);
        }, 0)
      );
    });
  });
}
map.on('movestart', (e) => {
    setPanning(true);
});

map.on('moveend', () => { 
    if(!inWorldFly){
        setPanning(false);
    }
});

map.on('dblclick', () => { 
    setPanning(true);
    setTimeout(() => { setPanning(false); }, 250);
});