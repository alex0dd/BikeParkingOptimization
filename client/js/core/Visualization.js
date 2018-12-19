import { rgbToHex } from '../utilities/ColorUtilities.js';

function drawRectOnMap(map, p1, p2, color, colorWeight, tooltip=""){
    L.rectangle([p1, p2],{
        color: "#00000f", 
        weight: 1.0, 
        fillColor: color, 
        fillOpacity: colorWeight
    }).bindPopup(tooltip).addTo(map);
}

// Parkings renderer
export function renderParkings(map, coordProvider, parkings, color, opacity=1.0, label=""){
    /**
     * map: map on which the parkings will be rendered
     * coordProvider: coordinate converter
     * parkings: array containing squares of parkings
     * color: color of rendered parkings
     */
    for(var i = 0; i < parkings.length; i++){
        var p = parkings[i];
        drawRectOnMap(map, coordProvider.elementAt(p.row, p.column), coordProvider.elementAt(p.row+1,p.column+1), color, opacity, label);
    }
}

// Map renderer
export function renderMap(map, time, boundX, boundY, boundT, coordProvider, locationMap, drawGrid=false){
    var t = time < boundT ? time : boundT - 1;
    /*
    pseudocode:
    for i=0 to n row
        for j=0 to n column
            renderRect([i, j], [i+1, j+1])
    */
    for(var i = 0; i < boundY; i++){
        for(var j = 0; j < boundX; j++){
            var population = locationMap.getPopulationAt(t, i, j);
            var inPopulation = population.inBikes;
            var outPopulation = population.outBikes;
            var colorWeightIn = 0.0;
            var colorWeightOut = 0.0;
            if(inPopulation > 0) colorWeightIn = (inPopulation/locationMap.getHighestInPopulation(t))*0.9;
            if(outPopulation > 0) colorWeightOut = (outPopulation/locationMap.getHighestOutPopulation(t))*0.9;
            // if doesn't need to draw grid, then only consider the populated area
            if((colorWeightIn!=0.0 && !drawGrid) || drawGrid){
                drawRectOnMap(map, coordProvider.elementAt(i, j), coordProvider.elementAt(i+1,j+1), "green", colorWeightIn, 
                "in: "+inPopulation+"\nout: "+outPopulation  
                );
            }
            if((outPopulation!=0.0 && !drawGrid) || drawGrid){
                drawRectOnMap(map, coordProvider.elementAt(i, j), coordProvider.elementAt(i+1,j+1), "red", colorWeightOut, 
                "in: "+inPopulation+"\nout: "+outPopulation  
                );
            }
        }
    }
}

// Population Bar Charts renderer
export function renderPopulationCharts(graphIn, graphOut, locationMap, currentTime) {
    var datasetIn = new vis.DataSet();
    var datasetOut = new vis.DataSet();
    var bounds = locationMap.getBounds();
    for (var x = 0; x < bounds.x; x+=1) {
        for (var y = 0; y < bounds.y; y+=1) {
            var population = locationMap.getPopulationAt(currentTime, y, x);
            var zIn = population.inBikes;
            var zOut = population.outBikes;
            // incoming
            if(zIn > 0){
                var colorWeight = (zIn/locationMap.getHighestInPopulation(currentTime))*0.9;
                datasetIn.add({x:x, y:y, z: zIn, style: "#"+rgbToHex(0, 255*colorWeight, 0)});
            }
            else{
                datasetIn.add({x:x, y:y, z: zIn, style: "#"+rgbToHex(77, 77, 77)});
            }
            // outgoing
            if(zOut > 0){
                var colorWeight = (zOut/locationMap.getHighestOutPopulation(currentTime))*0.9;
                datasetOut.add({x:x, y:y, z: zOut, style: "#"+rgbToHex(255*colorWeight, 0, 0)});
            }
            else{
                datasetOut.add({x:x, y:y, z: zOut, style: "#"+rgbToHex(77, 77, 77)});
            }
        }
    }

    var camera = graphIn ? graphIn.getCameraPosition() : null;
    graphIn.setData(datasetIn);
    graphOut.setData(datasetOut);

    if (camera) { 
        // restore camera position, synchronized with both charts
        graphIn.setCameraPosition(camera);
        graphOut.setCameraPosition(camera);
    }
}