export default class CoordinateProvider {
    constructor(initialLocation, spacing) {
        this.initialLocation = { latitude: initialLocation[0], longitude: initialLocation[1] };
        this.spacing = spacing;
        this.coef = this.spacing * 0.0000089; // meters in degrees
        this.cosInitialLat = Math.cos((this.initialLocation.latitude+this.coef)*0.018);
    }
    elementAt(i, j) {
        /**
         * Returns latitude and longitude of (i, j)th square
         * i = vertical quadrant index
         * j = horizontal quadrant index
        */
        var new_lat = this.initialLocation.latitude + i * this.coef;
        var new_lon = this.initialLocation.longitude + (this.coef *j)/this.cosInitialLat;
        return [new_lat, new_lon];
    }
    findSquare(lat, lon) {
        /**
         * Returns the square which contains the given point
         * lat: point's latitude
         * lon: point's longitude
         */
        var i = parseInt((lat-this.initialLocation.latitude)/this.coef);
        var j = parseInt(this.cosInitialLat*(lon-this.initialLocation.longitude)/this.coef);
        return {row: i, column: j};
    }
};
