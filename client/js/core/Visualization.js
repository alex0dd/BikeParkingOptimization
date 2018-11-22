import { rgbToHex } from '../utilities/ColorUtilities.js';
// Map renderer
export function renderMap(map, time, boundX, boundY, boundT, coordProvider, locationMap){
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
            var colorWeight = (population/locationMap.getHighestPopulation(t))*0.9;
            L.rectangle([coordProvider.elementAt(i, j), coordProvider.elementAt(i+1,j+1)],{
                color: "#00000f", 
                weight: 1.0, 
                fillColor: "green", 
                fillOpacity: colorWeight
            }).bindPopup(locationMap.getPopulationAt(t, i, j)+"").addTo(map);
        }
    }
}

// Population Bar Chart renderer
export function renderPopulationChart(graph, locationMap, currentTime) {
    var dataset = new vis.DataSet();
    var bounds = locationMap.getBounds();
    for (var x = 0; x < bounds.x; x+=1) {
        for (var y = 0; y < bounds.y; y+=1) {
            var z = locationMap.getPopulationAt(currentTime, x, y);
            var population = locationMap.getPopulationAt(currentTime, x, y);
            var colorWeight = (population/locationMap.getHighestPopulation(currentTime))*0.9;    
            dataset.add({x:x, y:y, z: z, style: "#"+rgbToHex(0, 255*colorWeight, 0)});
        }
    }

    var camera = graph ? graph.getCameraPosition() : null;
    graph.setData(dataset);

    if (camera) graph.setCameraPosition(camera); // restore camera position
}