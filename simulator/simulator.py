from services import CoordinateProvider
from structures import LocationMap, LocationMapBounds
import pandas as pd
import datetime

map_bounds = LocationMapBounds(t=60, x=30, y=30)
spacing = 100 # 100 meters
initial_location = [44.484443, 11.325102]
coord_provider = CoordinateProvider(initial_location, spacing)

def simulate(total_time, time_delta, events):
    """
    Performs a simulation for a given time with a fixed collection of events, logs and return statistics.
    total_time: max simulated time units
    time_delta: smallest time unit
    events: collection of events
    """
    location_map = LocationMap(map_bounds)
    arrivals_table = {}
    t = time_delta
    location_map.add_time(t)
    # date mapping
    initial_time = event_data["time"].min() 
    tmp_datetime = datetime.datetime.strptime(initial_time, '%H:%M')
    calendary_time = datetime.datetime(1, 1, 1, tmp_datetime.hour, tmp_datetime.minute, 0)
    calendary_time_delta = datetime.timedelta(minutes=time_delta)
    while t < total_time: # check also if no more events left(we can stop then)
        lower_bound = (calendary_time-calendary_time_delta).strftime("%H:%M:%S")
        upper_bound = calendary_time.strftime("%H:%M:%S")
        events_in_time_interval = event_data[(event_data["time"] >= lower_bound) & (event_data["time"] < upper_bound)]
        for event in events_in_time_interval.itertuples():
            i, j = coord_provider.find_interval(event.lat, event.lon)
            if(event.type == 'a'):
                # arrival
                if event.id in arrivals_table:
                    location_map.get(t-time_delta, i, j).in_bikes+=1
                    # remove from table
                    arrivals_table.pop(event.id)
            else:
                # departure
                location_map.get(t-time_delta, i, j).out_bikes+=1
                if location_map.get(t-time_delta, i, j).in_bikes - 1 >= 0:
                    location_map.get(t-time_delta, i, j).in_bikes-=1
                arrivals_table[event.id] = True
        t+=time_delta
        calendary_time+=calendary_time_delta
        location_map.add_time(t)
    return location_map
if __name__ == "__main__":
    event_data = pd.read_json('mock_event_data.json')
    event_data = event_data.sort_values(["time", "id"])
    # remove seconds from data
    event_data["time"] = pd.DatetimeIndex(event_data["time"]).time
    event_data['time'] = event_data['time'].apply(lambda t: t.strftime('%H:%M'))
    location_map = simulate(10, 1, event_data)
    with open('output.json', 'w') as f:
        f.write(location_map.to_json())