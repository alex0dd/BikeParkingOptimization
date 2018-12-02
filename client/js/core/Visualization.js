import { rgbToHex } from '../utilities/ColorUtilities.js';

function drawRectOnMap(map, p1, p2, color, colorWeight, tooltip){
    L.rectangle([p1, p2],{
        color: "#00000f", 
        weight: 1.0, 
        fillColor: color, 
        fillOpacity: colorWeight
    }).bindPopup(tooltip).addTo(map);
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

// Population Bar Chart renderer
export function renderPopulationChart(graph, locationMap, currentTime) {
    var dataset = new vis.DataSet();
    var bounds = locationMap.getBounds();
    for (var x = 0; x < bounds.x; x+=1) {
        for (var y = 0; y < bounds.y; y+=1) {
            var population = locationMap.getPopulationAt(currentTime, y, x);
            var inPopulation = population.inBikes;
            var outPopulation = population.outBikes;
            var z = inPopulation;
            var isOutBigger = false;
            // if more outgoing then incoming
            if(inPopulation < outPopulation) {
                isOutBigger = true;
                z = outPopulation;
            }
            if(z > 0){
                // if more incoming
                if (!isOutBigger){
                    var colorWeight = (z/locationMap.getHighestInPopulation(currentTime))*0.9;
                    dataset.add({x:x, y:y, z: z, style: "#"+rgbToHex(0, 255*colorWeight, 0)});
                }
                else{
                    var colorWeight = (z/locationMap.getHighestOutPopulation(currentTime))*0.9;
                    dataset.add({x:x, y:y, z: z, style: "#"+rgbToHex(255*colorWeight, 0, 0)});
                }
            }
            else{
                dataset.add({x:x, y:y, z: z, style: "#"+rgbToHex(77, 77, 77)});
            }
        }
    }

    var camera = graph ? graph.getCameraPosition() : null;
    graph.setData(dataset);

    if (camera) graph.setCameraPosition(camera); // restore camera position
}