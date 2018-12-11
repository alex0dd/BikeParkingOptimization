import math

def memoize(func):
    cache = dict()

    def memoized_func(*args):
        if args in cache:
            return cache[args]
        result = func(*args)
        cache[args] = result
        return result

    return memoized_func

class CoordinateProvider:

    def __init__(self, initialLocation, spacing):
        self.initialLocation = { "latitude": initialLocation[0], "longitude": initialLocation[1] }
        self.spacing = spacing
        self.coef = self.spacing * 0.0000089 # meters in degrees

    @memoize
    def element_at(self, i, j):
        """
        i: vertical quadrant index
        j: horizontal quadrant index
        """
        cos_sum = 0
        for k in range(j):
            cos_sum += 1 / math.cos((self.initialLocation["latitude"] + k * self.coef) * 0.018) # 0.018 is pi/180
        new_lat = self.initialLocation["latitude"]  + i * self.coef
        new_lon = self.initialLocation["longitude"]  + self.coef * cos_sum
        return [new_lat, new_lon]

    def find_interval(self, lat, lon):
        i = int((lat-self.initialLocation["latitude"])/self.coef)
        j = 0
        found_j = False
        while not found_j:
            element = self.element_at(i, j)
            if (element[1] < lon):
                j+=1
            else:
                if j-1>=0:
                    j-=1
                found_j = True
        return [i, j]