// Initial tool for defining the caching starting area
// and the game boundries

var NEAREST_ROAD_ENDPOINT = 'https://roads.googleapis.com/v1/nearestRoads';
var GOOGLE_API_KEY = 'AIzaSyD_LYoOfB-svb8m17FvZ8_zuIbmaVfnv5I';

var appState = {
  startBounds: null,
  cachingBounds: null,
  map: null,
}

function concatenateCoordinates(coordinates) {
  var stringCoordinates = [];
  coordinates.forEach(function(coordinate) {
    stringCoordinates.push(coordinate.join());
  })

  return stringCoordinates.join('|');
}

function nearestRoad(coordinates) {
  var params = concatenateCoordinates(coordinates);
  $.ajax({
    method: "GET",
    url: NEAREST_ROAD_ENDPOINT +'?points='+ params +'&key='+ GOOGLE_API_KEY,
  })
    .done(function(data) {
      if(data) {
        data.snappedPoints.forEach(function(point) {
          new google.maps.Marker({
            position: {lat: point.location.latitude, lng: point.location.longitude},
            map: appState.map,
          });
        })
      }
    });
}

function generateMarkers(grid) {
  var positions = [];

  grid.features.forEach(function(feature) {
    var points = [];

    feature.geometry.coordinates[0].forEach(function(point) {
      points.push(turf.point(point));
    });

    var gridBbox = turf.bbox(turf.featureCollection(points));
    var randomnPosition = turf.randomPosition(gridBbox);
    positions.push(randomnPosition);
  });

  nearestRoad(positions);
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 50.718880, lng: -3.537581},
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
      var cellSide = 3;
      var options = {units: 'miles'};
      
      var grid = turf.squareGrid(bbox, cellSide, options);
      generateMarkers(grid);
    }
  });

  drawingManager.setMap(map);
}