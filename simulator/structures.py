import json
class LocationMapBounds:
    def __init__(self, t=0, y=0, x=0):
        self._t = t
        self._y = y
        self._x = x

    @property
    def t(self):
        return self._t
    @property
    def y(self):
        return self._y
    @property
    def x(self):
        return self._x

class LocationMapCell:

    def __init__(self, in_bikes=0, out_bikes=0, total_bikes=0):
        self.in_bikes = in_bikes
        self.out_bikes = out_bikes
        self.total_bikes = total_bikes

def serialize_cell(obj):
    if isinstance(obj, LocationMapCell):
        if obj.in_bikes > 0 or obj.out_bikes > 0:
            print(obj.in_bikes, obj.out_bikes)
        serial = obj.__dict__
        return serial
    else:
        raise TypeError ("Type not serializable")

class LocationMap:

    def __init__(self, bounds):
        self.bounds = bounds
        self.map_tensor = []
        self.time_indices = []

    def add_time(self, time):
        """
        Creates a map entry for the new given time
        """
        # if time is not already present and can insert another time index
        if time not in self.time_indices and len(self.time_indices) < self.bounds.t:
            time_map = []
            for i in range(self.bounds.y):
                row = []
                for j in range(self.bounds.x):
                    # create an empty map cell
                    row.append(LocationMapCell())
                time_map.append(row)
            self.map_tensor.append(time_map)
            self.time_indices.append(time)

    def get_bounds(self):
        return self.bounds

    def get(self, t, y, x):
        return self.map_tensor[t][y][x]

    def to_json(self):
        return json.dumps({"bounds": {"t": self.bounds.t, "y": self.bounds.y, "x": self.bounds.x}, "map": self.map_tensor}, default=serialize_cell)