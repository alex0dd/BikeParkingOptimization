import math

class CoordinateProvider:

    def __init__(self, initialLocation, spacing):
        self.initialLocation = { "latitude": initialLocation[0], "longitude": initialLocation[1] };
        self.spacing = spacing;
        self.coef = self.spacing * 0.0000089; # meters in degrees

    def element_at(self, i, j):
        """
        i: vertical quadrant index
        j: horizontal quadrant index
        """
        cosSum = 0;
        for k in range(j):
            cosSum += 1 / math.cos((self.initialLocation["latitude"] + k * self.coef) * 0.018); # 0.018 is pi/180
        new_lat = self.initialLocation["latitude"]  + i * self.coef;
        new_lon = self.initialLocation["longitude"]  + self.coef * cosSum;
        return [new_lat, new_lon];

    def find_interval(self, lat, lon):
        i = 0
        j = 0
        found_i = False
        found_j = False
        while not found_i:
            while not found_j:
                element = self.element_at(i, j)
                #print(lat, lon)
                #print(element)
                if (element[1] < lon):
                    j+=1
                else:
                    if j-1>=0:
                        j-=1
                    found_j = True
            element = self.element_at(i, j)
            if (element[0] < lat):
                i+=1
            else:
                if i-1>=0:
                    i-=1
                found_i = True
        return [i, j]