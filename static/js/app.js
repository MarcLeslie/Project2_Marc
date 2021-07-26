//var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const dispQuery = 'static/data/disp.geojson'
const crimesQuery = "static/data/crime.geojson"

var dispensaries = L.layerGroup();
var crime = L.layerGroup();

init();

////////////////////////////////////////////////////
// Define map layers
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "streets-v11",
    accessToken: API_KEY
});

var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
});

var grayscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});


////////////////////////////////////////////////////
// Define a baseMaps object to hold our base layers
var baseMaps = {
    "Grayscale": grayscalemap,
    "Street": streetmap,
    "Dark": darkmap
};


////////////////////////////////////////////////////
// Create overlay object to hold our overlay layer
var overlayMaps = {
    Dispensaries: dispensaries,
    Crime: crime
};


////////////////////////////////////////////////////
// Create Map
var myMap = L.map("map", {
    center: [34.0522, -118.357],
    zoom: 9.5,
    layers: [grayscalemap, dispensaries, crime] //ORDERING THIS SO THAT THE TOOLTIPS WORK
});

////////////////////////////////////////////////////
// Create a layer control
// Pass in our baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(myMap);


////////////////////////////////////////////////////
// Map disp data
function createDisp(yearVal) {

    d3.json(dispQuery).then(function(data) {
        // console.log(data.features)

        // Clear layer on val change
        dispensaries.clearLayers();

        // Define a function we want to run once for each feature in the features array
        function onEachFeature(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.business_name +
                "</h3><hr><p>" + new Date(feature.properties.location_start_date) +
                "</p><p>" + feature.properties.street_address + "</p>");
        }

        // Create filter for year
        function yearFilter(feature) {
            if (feature.properties.location_start_year <= yearVal) return true
        }

        // Create a GeoJSON layer containing the features array on the earthquakeData object
        // Add GeoJSON to the earthquakes layergroup
        L.geoJSON(data.features, {
            onEachFeature: onEachFeature,
            filter: yearFilter
        }).addTo(dispensaries);
    });

};


//////////////////////////////////////////////////
// Map crime data
function createCrime(yearVal) {
    d3.json(crimesQuery).then(function(data) {
        // Clear layer on val change
        crime.clearLayers();

        // Creating style for the choropleth
        function style(feature) {
            return {
                fillColor: getColor(feature.properties.crime_counts),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            }
        }

        function filter(feature) {
            if (feature.properties.year == yearVal) return true
        }

        // Add crimes GeoJSON to the techtonics layergroup
        L.geoJSON(data.features, {
            style: style,
            filter: filter
        }).addTo(crime)

    });
}

//////////////////////////////////////////////////
// Define colors for choropleth
function getColor(counts) {
    var color;

    if (counts < 5000) { color = '#FECFCF' } else if (counts < 5500) { color = '#FE9F9F' } else if (counts < 6000) { color = '#FD504F' } else if (counts < 6500) { color = '#FD0100' } else if (counts < 7000) { color = '#b01030' } else if (counts < 7500) { color = '#9a0e2a' } else if (counts < 8000) { color = '#840c24' } else { color = '#6e0a1e' }

    return color;
}


//////////////////////////////////////////////////
// LEGEND
// Create a legend to display information about our map
var legend = L.control({ position: "bottomright" });

// When the layer control is added, insert a div with the class of "legend"
legend.onAdd = function() {
    var div = L.DomUtil.create("div", "legend");
    categories = ['-10—9', '10—29', '30—49', '50—69', '70—89', '90+'];

    div.innerHTML += '';
    for (var i = 0; i < categories.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(categories[i]) + '"></i> ' +
            (categories[i] ? categories[i] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

////////////////////////////////////////////////////
//Populates the dropdown list
function populateDropDown(year) {
    // var dropdownTag = document.getElementById("selDataset");

    // for (var i = 0; i < year.length; i++) {
    //     var newOption = year[i];

    //     var el = document.createElement("option");
    //     el.textContent = newOption;
    //     el.value = newOption;

    //     dropdownTag.append(el);
    // }

    var radioTag = document.getElementById("control");

    for (var i = 0; i < year.length; i++) {
        var newRadio = year[i];

        // Create inputs for label
        var inp = document.createElement("input")
        inp.setAttribute("class", "form-check-input");
        inp.type = "radio";
        inp.id = newRadio;
        inp.name = "year";
        inp.value = newRadio;
        inp.setAttribute("onchange", "optionChanged(this.value)");

        // Add a default checked box to the first option selected
        if (i == 0) { inp.setAttribute("checked", "checked") }

        // Add column dividers for the radio buttons
        var div = document.createElement("div");
        div.setAttribute("class", "form-check form-check-inline")
        radioTag.append(div);

        // Add new radio to control tag
        //radioTag.append(inp);
        div.append(inp);

        // Create label for the radio
        var lb = document.createElement("label");
        lb.setAttribute("class", "form-check-label");
        lb.setAttribute("for", newRadio);
        lb.textContent = newRadio;

        // Add input to the control tag
        div.append(lb);
    }

};


////////////////////////////////////////////////////
//Initializes the Dashboard
function init() {
    var val = 2019;

    var year = [2019, 2018, 2017, 2016, 2015, 2014, 2013, "Time Lapse"];

    populateDropDown(year);
    optionChanged(val);


    // d3.json(samples).then((data) => {
    //   var listDDVals = data.names; //filter the json by getting just the names tag info

    //   populateDropDown(listDDVals);

    //   const defaultVal = listDDVals[0];
    //   //console.log(defaultVal); //sanity check

    //   //optionChanged(defaultVal)
    // });
}


////////////////////////////////////////////////////
//Captures on change values
function optionChanged(val) {
    if (isNaN(val) == false) {
        createDisp(val);
        createCrime(val);
    } else { autoRun() }
}


function autoRun() {
    optionChanged(val);
}