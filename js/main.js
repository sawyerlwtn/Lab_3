var map = L.map('map').setView([41.2, -95.9], 4);
var dataStats = {}; 
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//Create a title for the map YOOOOO
function createTitle() {
    var TitleControl = L.Control.extend({
        options: {
            position: 'topleft' // You can change this to 'topright' or 'topleft'
        },

        onAdd: function () {
            var container = L.DomUtil.create('div', 'map-title-container');
            
            // Use single quotes for the string as requested
            container.innerHTML = '<h1>Major City Populations in the USA</h1><p>Data Source: US Census Bureau</p>';
            
            return container;
        }
    });

    map.addControl(new TitleControl());
};


// 1. Declare global variables at the top

fetch('data/USA_Major_Cities/USA_Major_Cities.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(USA_Major_Cities) {
        // Calculate stats first so the legend knows the sizes
        calcStats(USA_Major_Cities);
        
        L.geoJSON(USA_Major_Cities, {
            pointToLayer: function (feature, latlng) {
                var attValue = Number(feature.properties.POPULATION); 
                return L.circleMarker(latlng, {
                    radius: calcRadius(attValue), 
                    fillColor: '#33fcff',
                    color: '#760000',
                    weight: 1,
                    fillOpacity: 0.8
                });
            },
            onEachFeature: function (feature, layer) {
                var popupContent = '<b>City:</b> ' + feature.properties.NAME + 
                       '<br><b>Population:</b> ' + feature.properties.POPULATION.toLocaleString();
                layer.bindPopup(popupContent);
            }
        }).addTo(map);

        // Create the legend after data is loaded
        createLegend(); 
        createTitle();
    });

function calcRadius(val) {
    var scaleFactor = 0.015; 
    // This math ensures the 8M city fits while the 250k city stays visible
    return (Math.sqrt(val) * scaleFactor) + 2; 
}

function calcStats(data) {
    var allValues = [];
    for (var city of data.features) {
        var value = city.properties.POPULATION;
        if (value) allValues.push(Number(value));
    }
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    dataStats.mean = allValues.reduce((a, b) => a + b) / allValues.length;
}

function createLegend() {
    var LegendControl = L.Control.extend({
        options: { position: 'bottomright' },
      onAdd: function () {
            var container = L.DomUtil.create('div', 'legend-control-container');
            container.innerHTML = '<b>City Population</b>';

            // We keep the height at 160px
            var svg = '<svg id="attribute-legend" width="180px" height="160px">';
            
            var circleValues = [8000000, 1000000, 250000];

            for (var i = 0; i < circleValues.length; i++) {
                var radius = calcRadius(circleValues[i]);
                
                // 1. Lower the 'floor' to 150 so circles sit at the very bottom
                var cy = 150 - radius; 

                svg += '<circle class="legend-circle" fill="#33fcff" fill-opacity="0.6" stroke="#760000" cx="45" cy="' + cy + '" r="' + radius + '"/>';
                
                // 2. Adjust Lift: 
                // We use -20 instead of -30 to keep the 8M label inside the box
                var verticalLift = (2 - i) * -20; 
                var textY = (cy - radius) + verticalLift;

                var labelValue = (circleValues[i] >= 1000000) ? 
                                 (circleValues[i] / 1000000).toFixed(1) + 'M' : 
                                 (circleValues[i] / 1000).toFixed(0) + 'k';
                
                svg += '<text x="120" y="' + (textY + 5) + '" style="font-size: 13px; font-weight: bold;">' + labelValue + '</text>';
                
                svg += '<line x1="45" y1="' + (cy - radius) + '" x2="115" y2="' + textY + '" stroke="gray" stroke-dasharray="2,2" />';
            }

            svg += '</svg>';
            container.insertAdjacentHTML('beforeend', svg);
            return container;
        }
    });
    map.addControl(new LegendControl());
}
//The following code creates multiple pop ups / polygons / pins on the map
// var marker = L.marker([51.5, -0.09]).addTo(map);
// // Polygon
// var circle = L.circle([51.508, -0.11], {
//     color: 'red', //specify color
//     fillColor: '#f03', //Fill
//     fillOpacity: 0.5,    radius: 500 //shade intesnity and how big the circle is
// }).addTo(map); // add to map
// //polygon, each coordinate is a pt and the polygon is just connected between the pts
// var polygon = L.polygon([
//     [51.509, -0.08],
//     [51.503, -0.06],
//     [51.51, -0.047]
// ]).addTo(map);
// //Give the polygons/popup text
// marker.bindPopup("<strong>Hello world!</strong><br />I am a popup.").openPopup(); //it will open automatically
// circle.bindPopup("I am a circle.");
// polygon.bindPopup("I am a polygon.");
// //pop up contents
// var popup = L.popup()
//     .setLatLng([51.5, -0.09])
//     .setContent("I am a standalone popup.")
//     .openOn(map);

// var popup = L.popup();
// //function, when click on map it displays lat/long
// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(map);
// }

// map.on('click', onMapClick);

//<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>\\
//<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>\\
//<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>\\
                                        //CHOROPLETH MAP\\
//<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>\\
//<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>\\
//<><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>\\
//establish variable for choropleth map (map2)
var map2 = L.map('map2').setView([41.2, -95.9], 4);
//create a basemap for the choropleth map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map2);

// 1. Define the color scale function for the Choropleth
function getChoroColor(d) {
    // Colors based on total city population within the state
    return d > 20000000 ? '#084594' :
           d > 10000000 ? '#2171b5' :
           d > 5000000  ? '#4292c6' :
           d > 1000000  ? '#6baed6' :
           d > 500000   ? '#9ecae1' :
                          '#eff3ff';
}

// 2. Fetch both the US States (polygons) and your Cities (points)
Promise.all([
    // Public US States GeoJSON for the areal units
    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json').then(res => res.json()),
    fetch('data/USA_Major_Cities/USA_Major_Cities.json').then(res => res.json())
]).then(function(data) {
    var statesData = data[0];
    var citiesData = data[1];

    // 3. Perform the Spatial Join using Turf.js
    statesData.features.forEach(function(state) {
        var statePopSum = 0;

        citiesData.features.forEach(function(city) {
            // Check if the city point falls inside the state polygon
            if (turf.booleanPointInPolygon(city, state)) {
                statePopSum += Number(city.properties.POPULATION);
            }
        });

        // Add the calculated sum as a new property to the state
        state.properties.TOTAL_CITY_POP = statePopSum;
    });

    // 4. Add the joined data to map2
   // Add the joined data to map2
    L.geoJson(statesData, {
        style: function(feature) {
            return {
                fillColor: getChoroColor(feature.properties.TOTAL_CITY_POP),
                weight: 1.5,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.8
            };
        },
        // This is where the 'layer.on' magic happens
        onEachFeature: function (feature, layer) {
            var total = feature.properties.TOTAL_CITY_POP ? feature.properties.TOTAL_CITY_POP.toLocaleString() : '0';
            var popupContent = '<h1>' + feature.properties.name + '</h1>' + 
                               '<p>Total Urban Pop: ' + total + '</p>';

            // 1. Hover 'In' Event
            layer.on('mouseover', function (e) {
                // We use 'this' to refer to the specific state layer being hovered
                this.bindPopup(popupContent, { 
                    closeButton: false, 
                    offset: L.point(0, -10) 
                }).openPopup();
                
                // Visual highlight
                this.setStyle({
                    weight: 3,
                    color: '#333',
                    fillOpacity: 0.9
                });
            });

            // 2. Hover 'Out' Event
            layer.on('mouseout', function (e) {
                this.closePopup();
                
                // Reset to the original style
                this.setStyle({
                    weight: 1.5,
                    color: 'white',
                    fillOpacity: 0.8
                });
            });
        }
    }).addTo(map2);

    // 5. Add a Title specifically for map2
    createChoroTitle(map2);
    createChoroLegend(map2);
});

// Separate Title function for map2 (No box, centered text)
function createChoroTitle(mapInstance) {
    var TitleControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function () {
            var container = L.DomUtil.create('div', 'map-title-container');
            container.innerHTML = '<h1>State-wide Urban Population</h1>';
            return container;
        }
    });
    mapInstance.addControl(new TitleControl());
};
//create a legend lil bro
function createChoroLegend(mapInstance) {
    var LegendControl = L.Control.extend({
        options: { position: 'bottomright' },
        onAdd: function () {
            // Create the container using the same class as map1 for consistency
            var container = L.DomUtil.create('div', 'legend-control-container');
            container.innerHTML = '<b>Total Urban Pop</b><br>';

            // Define the breaks and colors to match your getChoroColor function
            var grades = [0, 500000, 1000000, 5000000, 10000000, 20000000];
            var labels = [];

            // Loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                container.innerHTML +=
                    '<i style="background:' + getChoroColor(grades[i] + 1) + '; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.8;"></i> ' +
                    (grades[i] >= 1000000 ? (grades[i] / 1000000) + 'M' : (grades[i] / 1000) + 'k') + 
                    (grades[i + 1] ? '&ndash;' + (grades[i + 1] >= 1000000 ? (grades[i + 1] / 1000000) + 'M' : (grades[i + 1] / 1000) + 'k') + '<br>' : '+');
            }

            return container;
        }
    });
    mapInstance.addControl(new LegendControl());
}