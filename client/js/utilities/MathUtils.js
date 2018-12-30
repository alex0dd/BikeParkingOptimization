export function createVector(n){
    return new Array(n).fill(0);
}

export function createMatrix(m, n) {
    return Array.from({length: m}, () => createVector(n));
};

export function createTensor(t, m, n) {
    return Array.from({length: t}, () => createMatrix(m, n));
}

export function randomNumber(minimum, maximum){
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

export function convertInterval(value, min_a, max_a, min_b, max_b){
    return (max_b - min_b)/(max_a - min_a) * (value - min_a) + min_b;
}