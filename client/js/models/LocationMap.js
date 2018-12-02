import {createVector, createTensor} from '../utilities/MathUtils.js';

export default class LocationMap {
    constructor(bounds) {
        this.bounds = bounds;
        this.mapTensor = {};
        this.highestPopulation = createVector(bounds.t);
        for(var t = 0; t < this.bounds.t; t++) this.mapTensor[t] = {};
    }
    setPopulationAt(t, i, j, population) {
        // compact sparse index
        var new_index = i+"-"+j;
        if(this.mapTensor[t][new_index] === undefined){
            this.mapTensor[t][new_index] = 0; // initialize
        }
        this.mapTensor[t][new_index] = population;
        // Update the highest population statistic
        if(this.mapTensor[t][new_index] > this.highestPopulation[t]) this.highestPopulation[t] = population;
    }
    getBounds(){
        return this.bounds;
    }
    getPopulationAt(t, i, j){
        var new_index = i+"-"+j;
        if(this.mapTensor[t][new_index] === undefined) return 0;
        else return this.mapTensor[t][new_index];
    }
    getHighestPopulation(t){
        return this.highestPopulation[t];
    }
}

