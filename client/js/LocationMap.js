function createMatrix(m, n) {
    return Array.from({length: m}, () => new Array(n).fill(0));
};
  

class LocationMap {
    constructor(bounds) {
        this.bounds = bounds;
        this.mapMatrix = createMatrix(bounds.y, bounds.x);
        this.highestPopulation = 0;
    }
    setPopulationAt(i, j, population) {
        this.mapMatrix[i][j] = population;
        // Update the highest population statistic
        if(this.mapMatrix[i][j] > this.highestPopulation) this.highestPopulation = population;
    }
    getPopulationAt(i, j){
        return this.mapMatrix[i][j];
    }
    getHighestPopulation(){
        return this.highestPopulation;
    }
}

