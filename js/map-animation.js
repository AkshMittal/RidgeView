export let isPanning = false;
export let inWorldFly = false;
let worldFlyTimeouts = [];

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

export function worldFly(map, worldBounds, targetLatLng, finalZoom = 10) {
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

export function worldFlyToBounds(map, worldBounds, targetCenter, targetZoom) {
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
