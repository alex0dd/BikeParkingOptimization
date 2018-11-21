class CoordinateProvider {
    constructor(initialLocation, spacing) {
        this.initialLocation = { latitude: initialLocation[0], longitude: initialLocation[1] };
        this.spacing = spacing;
        this.coef = this.spacing * 0.0000089; // meters in degrees
    }
    elementAt(i, j) {
        /*
            i = vertical quadrant index
            j = horizontal quadrant index
        */
        var cosSum = 0;
        for (var k = 0; k < j; k++)
            cosSum += 1 / Math.cos((this.initialLocation.latitude + k * this.coef) * 0.018); // 0.018 is pi/180
        var new_lat = this.initialLocation.latitude + i * this.coef;
        var new_lon = this.initialLocation.longitude + this.coef * cosSum;
        return [new_lat, new_lon];
    }
};
