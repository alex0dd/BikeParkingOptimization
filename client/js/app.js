import LocationMap from './models/LocationMap.js';
import CoordinateProvider from './services/CoordinateProvider.js';
import { renderMap, renderPopulationChart } from './core/Visualization.js';
import { randomNumber } from './utilities/MathUtils.js';
/*
Visualization parameters
*/
const randomData = false;
var bounds = {t: 60, x: 140, y: 115}; //We will use these bounds approx in the final application {t: 1440, x: 80, y: 80} 
var initialLocation = [44.45216343349134, 11.255149841308594];//[44.49381, 11.33875]; // Bologna is latitude=44.49381, longitude=11.33875
var squareLength = 100; // 100 meters
var coordProvider = new CoordinateProvider(initialLocation, squareLength);
var locationMap = new LocationMap(bounds);

/*
Map related
*/
var a = null;
L.Map.include({
    'clearShapeLayers': function () {
        this.eachLayer(function (layer) {
            // if it's a shape layer
            if (!(layer instanceof L.TileLayer)) this.removeLayer(layer);
        }, this);
    },
    'redrawShapeLayers': function () {
        this.eachLayer(function (layer) {
            // if it's a shape layer
            if (!(layer instanceof L.TileLayer)) {layer._redraw();}
        }, this);
    }
});
// preferCanvas makes all points render in a canvas, avoiding to create a DOM element for each point, making the rendering faster
var map = L.map('mapid', {preferCanvas: true}).setView(initialLocation, 18);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18}).addTo(map);
map.setZoom(14);

// population chart
var populationBarChartContainer = document.getElementById('populationBarChart');
// we create an empty initial dataset, because later we'll just update it, so it is needed to prevent empty dataset error
var emptyDataset = new vis.DataSet();
emptyDataset.add({x: 0, y: 0, z: 0, style: 0});
var populationChartOptions = {
    width: "100%",
    height: '600px',
    style: "bar-color",
    showPerspective: true,
    showGrid: true,
    showShadow: false,
    // Option tooltip can be true, false, or a function returning a string with HTML contents
    tooltip: function (point) {
        // parameter point contains properties x, y, z, and data
        // data is the original object passed to the point constructor
        return 'Population: <b>' + point.z + '</b>';
    },
    // Tooltip default styling can be overridden
    tooltipStyle: {
        content: {
            background: 'rgba(255, 255, 255, 0.7)',
            padding: '10px',
            borderRadius: '10px'
        },
        line: {
            borderLeft: '1px dotted rgba(0, 0, 0, 0.5)'
        },
        dot: {
            border: '5px solid rgba(0, 0, 0, 0.5)'
        }
    },
    keepAspectRatio: true,
    verticalRatio: 0.5
};
var populationBarGraph = new vis.Graph3d(populationBarChartContainer, emptyDataset, populationChartOptions);
if(randomData){
    // Generate random population data
    for(var t = 0; t < bounds.t; t++)
        for(var i = 0; i < bounds.y; i++) 
            for(var j = 0; j < bounds.x; j++) 
                locationMap.setPopulationAt(t, i, j, randomNumber(0, 100));
}
/*
Components
*/
var debugDiv = document.getElementById('debug');
var timeSlider = document.getElementById('timeSlider');
timeSlider.value = 0;
timeSlider.min = 0;
timeSlider.max = bounds.t - 1;
timeSlider.addEventListener('input', (e)=>{
    var newTimeValue = e.target.value;
    debugDiv.innerText = "Current time: "+newTimeValue;
    map.clearShapeLayers();
    renderMap(map, newTimeValue, bounds.x, bounds.y, bounds.t, coordProvider, locationMap);
    renderPopulationChart(populationBarGraph, locationMap, newTimeValue);
    map.redrawShapeLayers();
});

debugDiv.innerText = "Current time: "+0;                        
map.on('click', function(e) {
    debugDiv.innerText = "Clicked on: "+e.latlng.lat+", "+e.latlng.lng;
});
// Render initial map for t=0
renderMap(map, 0, bounds.x, bounds.y, bounds.t, coordProvider, locationMap);
//renderPopulationChart(populationBarGraph, locationMap, 0);

if(!randomData){
    
    fetch('./data/output.json').then((r)=>r.json()).then(response=>{
        bounds = {t: response.bounds.t, y: response.bounds.y, x: response.bounds.x};
        var responseMap = response.map;
        locationMap = new LocationMap(bounds);
        for(var t = 0; t < bounds.t; t++){
            for(var item in responseMap[t]){
                var value = responseMap[t][item].out_bikes;
                var yx = item.split("-");
                locationMap.setPopulationAt(t, yx[0], yx[1], value);
            }
        }
        /*for(var t = 0; t < bounds.t; t++)
            for(var i = 0; i < bounds.y; i++) 
                for(var j = 0; j < bounds.x; j++){
                    var value = response.map[t][i][j].out_bikes;
                    locationMap.setPopulationAt(t, i, j, value);
                }*/
        
        timeSlider.max = bounds.t - 1;
        renderMap(map, 0, bounds.x, bounds.y, bounds.t, coordProvider, locationMap);
        renderPopulationChart(populationBarGraph, locationMap, 0);
    });
}