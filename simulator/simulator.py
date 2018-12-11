from services import CoordinateProvider
from structures import LocationMap, LocationMapBounds
import pandas as pd
import datetime

DAY_MINUTES = 1440 # 60 minutes * 24 hours = 1440 minutes

simulation_days = 2
simulation_time = 60*24*simulation_days # 24 hours * simulation_days
time_delta = 15 # 15 min
rescaled_time_bound = int(simulation_time/time_delta)
map_bounds = LocationMapBounds(t=rescaled_time_bound, x=140, y=115)
spacing = 100 # 100 meters
initial_location = [44.45216343349134, 11.255149841308594]
coord_provider = CoordinateProvider(initial_location, spacing)

def convert(x, n_steps):
    # 1440 is max minutes in a day
    return int(((n_steps)*x)/DAY_MINUTES) #+ 1

def simulate(total_time, time_delta, events):
    """
    Performs a simulation for a given time with a fixed collection of events, logs and return statistics.
    total_time: max simulated time units
    time_delta: smallest time unit
    events: collection of events
    """
    # divide day minutes by delta
    n = int(DAY_MINUTES/time_delta)
    event_data["CurrentDelta"] = event_data['Minutes'].apply(lambda m: (convert(m, n)))
    delta_groups = event_data.groupby("CurrentDelta")

    location_map = LocationMap(map_bounds, time_delta=time_delta)
    arrivals_table = {}
    t = 0
    location_map.add_time(t)
    while t < total_time: # check also if no more events left(we can stop then)
        time_index = int(t/time_delta)
        time_group_index = int((t%DAY_MINUTES)/time_delta)
        events_in_time_interval = delta_groups.get_group(time_group_index)
        print("t=",t, len(events_in_time_interval))
        for event in events_in_time_interval.itertuples():
            i, j = coord_provider.find_interval(event.Latitude, event.Longitude)
            if(event.Type == 'A'):
                # arrival
                if event.ActivityId in arrivals_table:
                    # register the entrance
                    location_map.get(time_index, i, j).in_bikes+=1
                    # register the transit
                    location_map.get(time_index, i, j).transiting_bikes+=1
                    # remove from table
                    arrivals_table.pop(event.ActivityId)
            else:
                # departure
                # register the exit
                location_map.get(time_index, i, j).out_bikes+=1
                # if someone transiting
                if location_map.get(time_index, i, j).transiting_bikes - 1 >= 0:
                    # decrement the transiting
                    location_map.get(time_index, i, j).transiting_bikes-=1
                arrivals_table[event.ActivityId] = True
        t+=time_delta
        location_map.add_time(t)
    return location_map
if __name__ == "__main__":
    event_data = pd.read_csv("final_simulation_cycle_data.csv")
    location_map = simulate(simulation_time, time_delta, event_data)
    with open('output.json', 'w') as f:
        f.write(location_map.to_json())
