// Initial tool for defining the caching starting area
// and the game boundries

var appState = {
  startBounds: null,
  cachingBounds: null,
  map: null,
}

function generateMarkers(grid) {
  grid.features.forEach(function(feature) {
    var points = [];

    feature.geometry.coordinates[0].forEach(function(point) {
      points.push(turf.point(point));
    });

    var center = turf.center(turf.featureCollection(points));
    var coords = center.geometry.coordinates;

    new google.maps.Marker({
      position: {lat: coords[0], lng: coords[1]},
      map: appState.map,
    });
  });
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });

  appState.map = map;

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.MARKER,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ['rectangle', 'circle']
    }
  });

  google.maps.event.addListener(drawingManager, 'circlecomplete', function(circle) {
    if(appState.startBounds === null) {
      appState.startBounds = circle.getBounds();
    }
  });

  google.maps.event.addListener(drawingManager, 'rectanglecomplete', function(rectangle) {
    if(appState.cachingBounds === null) {
      appState.cachingBounds = rectangle.getBounds();

      var minX = appState.cachingBounds.getSouthWest().lat();
      var minY = appState.cachingBounds.getSouthWest().lng();
      var maxX = appState.cachingBounds.getNorthEast().lat();    
      var maxY = appState.cachingBounds.getNorthEast().lng();

      var bbox = [minX, minY ,maxX, maxY];
      var cellSide = 1;
      var options = {units: 'miles'};
      
      var grid = turf.squareGrid(bbox, cellSide, options);
      generateMarkers(grid);
    }
  });

  drawingManager.setMap(map);
}