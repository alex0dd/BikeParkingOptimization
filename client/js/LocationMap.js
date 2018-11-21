function createVector(n){
    return new Array(n).fill(0);
}

function createMatrix(m, n) {
    return Array.from({length: m}, () => createVector(n));
};

function createTensor(t, m, n) {
    return Array.from({length: t}, () => createMatrix(m, n));
}
  

class LocationMap {
    constructor(bounds) {
        this.bounds = bounds;
        this.mapTensor = createTensor(bounds.t, bounds.y, bounds.x);
        this.highestPopulation = createVector(bounds.t);
    }
    setPopulationAt(t, i, j, population) {
        this.mapTensor[t][i][j] = population;
        // Update the highest population statistic
        if(this.mapTensor[t][i][j] > this.highestPopulation[t]) this.highestPopulation[t] = population;
    }
    getPopulationAt(t, i, j){
        return this.mapTensor[t][i][j];
    }
    getHighestPopulation(t){
        return this.highestPopulation[t];
    }
}

