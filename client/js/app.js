import LocationMap from './models/LocationMap.js';
import CoordinateProvider from './services/CoordinateProvider.js';
import { renderMap, renderPopulationCharts } from './core/Visualization.js';
import { randomNumber } from './utilities/MathUtils.js';
/*
Visualization parameters
*/
const dataPath = "data/output_whole_15m.json"; 
const cityAreaPath = "data/bologna_city_area.json"; 

const randomData = false;
var timeStep = 1; //Time step
var bounds = {t: 60, x: 140, y: 115}; //We will use these bounds approx in the final application {t: 1440, x: 80, y: 80} 
var initialLocation = [44.45216343349134, 11.255149841308594];//[44.49381, 11.33875]; // Bologna is latitude=44.49381, longitude=11.33875
var initialCameraLocation = [44.49381, 11.33875];
var squareLength = 100; // 100 meters
var coordProvider = new CoordinateProvider(initialLocation, squareLength);
var locationMap = new LocationMap(bounds);

/*
Map related
*/
L.Map.include({
    'clearShapeLayers': function () {
        this.eachLayer(function (layer) {
            console.log(layer.feature);
            // if it's a shape layer and not a map polygon
            if (!(layer instanceof L.TileLayer) && ((layer instanceof L.Polygon) && (layer instanceof L.Rectangle))) this.removeLayer(layer);
        }, this);
    },
    'redrawShapeLayers': function () {
        this.eachLayer(function (layer) {
            // if it's a shape layer and not a map polygon
            if (!(layer instanceof L.TileLayer) && ((layer instanceof L.Polygon) && (layer instanceof L.Rectangle))) {layer._redraw();}
        }, this);
    }
});
// preferCanvas makes all points render in a canvas, avoiding to create a DOM element for each point, making the rendering faster
var map = L.map('mapid', {preferCanvas: true}).setView(initialCameraLocation, 18);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18}).addTo(map);
map.setZoom(14);
fetch(cityAreaPath).then(response => response.json()).then(loadedData => {
    L.geoJSON(loadedData, {
        "color": "#ff7800",
        "weight": 3,
        "opacity": 0.65
    }).addTo(map);
});

// population charts
var populationInBarChartContainer = document.getElementById('populationInBarChart');
var populationOutBarChartContainer = document.getElementById('populationOutBarChart');
// we create an empty initial dataset, because later we'll just update it, so it is needed to prevent empty dataset error
var emptyDataset = new vis.DataSet();
emptyDataset.add({x: 0, y: 0, z: 0, style: 0});
var populationChartOptionsBase = {
    width: "100%",
    height: '450px',
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
var populationInChartOptions = Object.assign({zLabel: "In"}, populationChartOptionsBase);
var populationOutChartOptions = Object.assign({zLabel: "Out"}, populationChartOptionsBase);

populationInChartOptions.tooltip = (point)=>"Incoming population: <b>"+point.z+"</b>";
populationOutChartOptions.tooltip = (point)=>"Outgoing population: <b>"+point.z+"</b>";

var populationInBarGraph = new vis.Graph3d(populationInBarChartContainer, emptyDataset, populationInChartOptions);
var populationOutBarGraph = new vis.Graph3d(populationOutBarChartContainer, emptyDataset, populationOutChartOptions);

var syncCamera = (setter, toSet) => toSet.setCameraPosition(setter.getCameraPosition());

// synchronize both cameras
populationInBarGraph.on('cameraPositionChange', (e)=>syncCamera(populationInBarGraph, populationOutBarGraph));
populationOutBarGraph.on('cameraPositionChange', (e)=>syncCamera(populationOutBarGraph, populationInBarGraph));

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
timeSlider.step = timeStep;
timeSlider.min = 0;
timeSlider.max = bounds.t - 1;
timeSlider.addEventListener('input', (e)=>{
    var newTimeOrig = e.target.value;
    var newTimeScaled = parseInt(newTimeOrig/timeStep);
    debugDiv.innerText = "Current time: "+newTimeOrig +"/"+(bounds.t*timeStep)+"m";
    map.clearShapeLayers();
    renderMap(map, newTimeScaled, bounds.x, bounds.y, bounds.t, coordProvider, locationMap);
    renderPopulationCharts(populationInBarGraph, populationOutBarGraph, locationMap, newTimeScaled);
    map.redrawShapeLayers();
});

debugDiv.innerText = "Current time: "+0;                        
map.on('click', function(e) {
    debugDiv.innerText = "Clicked on: "+e.latlng.lat+", "+e.latlng.lng;
});
// Render initial map for t=0
renderMap(map, 0, bounds.x, bounds.y, bounds.t, coordProvider, locationMap);

if(!randomData){
    
    fetch(dataPath).then((r)=>r.json()).then(response=>{
        var metaData = response.meta_data;
        bounds = {t: metaData.bounds.t, y: metaData.bounds.y, x: metaData.bounds.x};
        timeStep = metaData.time_delta;
        var responseMap = response.map;
        locationMap = new LocationMap(bounds);
        for(var t = 0; t < bounds.t; t++){
            for(var item in responseMap[t]){
                var population = responseMap[t][item];
                var yx = item.split("-");
                locationMap.setPopulationAt(t, yx[0], yx[1], {inBikes: population.in_bikes, outBikes: population.out_bikes, totalBikes: population.total_bikes});
            }
        }
        // update slider parameters
        timeSlider.step = timeStep;
        timeSlider.max = bounds.t*timeStep - timeStep;
        // update debug label
        debugDiv.innerText = "Current time: "+0+"/"+(bounds.t*timeStep)+"m"; 
        renderMap(map, 0, bounds.x, bounds.y, bounds.t, coordProvider, locationMap);
        renderPopulationCharts(populationInBarGraph, populationOutBarGraph, locationMap, 0);
    });
}
