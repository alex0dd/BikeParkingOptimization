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