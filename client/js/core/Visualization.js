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