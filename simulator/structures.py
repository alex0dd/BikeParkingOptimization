import json
import numpy as np
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

    def __init__(self, in_bikes=0, out_bikes=0, transiting_bikes=0, total_bikes=0):
        self.in_bikes = in_bikes
        self.out_bikes = out_bikes
        self.transiting_bikes = transiting_bikes
        self.total_bikes = total_bikes

def serialize_cell(obj):
    if isinstance(obj, LocationMapCell):
        serial = obj.__dict__
        return serial
    else:
        raise TypeError ("Type not serializable")

class LocationMap:

    def __init__(self, bounds, time_delta=1):
        self.bounds = bounds
        self.map_tensor = []
        self.time_indices = []
        self.time_delta = time_delta
        self.current_bikes = np.zeros([bounds.y, bounds.x])

    def add_time(self, time):
        """
        Creates a map entry for the new given time
        """
        # if time is not already present and can insert another time index
        if time not in self.time_indices and len(self.time_indices) < self.bounds.t:
            time_map = {}
            self.map_tensor.append(time_map)
            self.time_indices.append(time)

    def get_bounds(self):
        return self.bounds

    def get(self, t, y, x):
        # We use a sparse index encoding to save space
        new_index = "{}-{}".format(y, x)
        if new_index not in self.map_tensor[t]:
            self.map_tensor[t][new_index] = LocationMapCell()
        return self.map_tensor[t][new_index]

    @property
    def total_bikes(self):
        return int(np.sum(self.current_bikes))

    def get_total_bikes_at(self, y, x):
        return self.current_bikes[y][x]

    def set_total_bikes_at(self, y, x, bikes):
        """
        NOTE: This method should be used only in the initialization phase.
        """
        self.current_bikes[y][x] = bikes

    def decrement_total_bikes_at(self, y, x):
        self.current_bikes[y][x]-= 1
    
    def increment_total_bikes_at(self, y, x):
        self.current_bikes[y][x]+= 1

    def to_json(self):
        return json.dumps({"meta_data":{"time_delta":self.time_delta, "bounds": {"t": self.bounds.t, "y": self.bounds.y, "x": self.bounds.x}}, "map": self.map_tensor}, default=serialize_cell)