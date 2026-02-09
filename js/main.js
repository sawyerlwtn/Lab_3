var map = L.map('map').setView([41.2, -95.9], 5);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
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

// This tells the browser to go find the file in your project folder
fetch('data/USA_Major_Cities/USA_Major_Cities.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(USA_Major_Cities) {
        // EVERYTHING using the data must happen inside these curly braces
        
        L.geoJSON(USA_Major_Cities, {
            pointToLayer: function (feature, latlng) {
                // Ensure 'POPULATION' matches the exact case in your JSON
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
                // Ensure 'NAME' or 'CITY' matches your JSON exactly
                var popupContent = '<b>City:</b> ' + feature.properties.NAME + 
                       '<br><b>Population:</b> ' + feature.properties.POPULATION.toLocaleString();
                       layer.bindPopup(popupContent);
            }
        }).addTo(map);
    });

// Keep this function outside at the bottom
function calcRadius(val) {
    var scaleFactor = 0.02;
    return Math.sqrt(val) * scaleFactor;
};

//create a legend for the map
//Example 2.7 line 1...function to create the legend
function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            container.innerHTML = '<p class="temporalLegend">Population in <span class="year">1985</span></p>';

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="130px" height="130px">';

            //add attribute legend svg to container
            container.innerHTML += svg;

            return container;
        }
    });

    map.addControl(new LegendControl());

};