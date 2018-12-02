import {createVector, createTensor} from '../utilities/MathUtils.js';

export default class LocationMap {
    constructor(bounds) {
        this.bounds = bounds;
        this.mapTensor = {};
        this.highestInPopulation = createVector(bounds.t);
        this.highestOutPopulation = createVector(bounds.t);
        for(var t = 0; t < this.bounds.t; t++) this.mapTensor[t] = {};
    }
    setPopulationAt(t, i, j, population) {
        // population is an object of values
        // compact sparse index
        var new_index = i+"-"+j;
        if(this.mapTensor[t][new_index] === undefined){
            this.mapTensor[t][new_index] = {inBikes: 0, outBikes: 0, totalBikes: 0}; // initialize
        }
        this.mapTensor[t][new_index] = population;
        // Update the highest population statistic
        if(this.mapTensor[t][new_index].inBikes > this.highestInPopulation[t]) this.highestInPopulation[t] = population.inBikes;
        if(this.mapTensor[t][new_index].outBikes > this.highestOutPopulation[t]) this.highestOutPopulation[t] = population.outBikes;
    }
    getBounds(){
        return this.bounds;
    }
    getPopulationAt(t, i, j){
        var new_index = i+"-"+j;
        if(this.mapTensor[t][new_index] === undefined) return {inBikes: 0, outBikes: 0, totalBikes: 0};
        else return this.mapTensor[t][new_index];
    }
    getHighestInPopulation(t){
        return this.highestInPopulation[t];
    }
    getHighestOutPopulation(t){
        return this.highestOutPopulation[t];
    }
}

