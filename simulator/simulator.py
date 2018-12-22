import argparse
from services import CoordinateProvider
from structures import LocationMap, LocationMapBounds
import pandas as pd
import numpy as np
import datetime
import os
from placements.dataset_placements import PlacementFromDataset
from placements.random_placements import RandomDatasetPlacement, RandomUniformPlacement

data_dir = "data"
usage_info = pd.read_csv(os.path.join(data_dir, "usage_percentage.csv"))

placement_from_dataset_in = PlacementFromDataset(usage_info[["Row", "Column", "PercIn"]].rename(columns={"PercIn": "Usage"}))
placement_from_dataset_out = PlacementFromDataset(usage_info[["Row", "Column", "PercOut"]].rename(columns={"PercOut": "Usage"}))
random_dataset_placement = RandomDatasetPlacement(usage_info[["Row", "Column", "PercIn"]].rename(columns={"PercIn": "Usage"}))
random_uniform_placement = RandomUniformPlacement(usage_info[["Row", "Column"]])

placement_functions = {
    "placement_from_dataset_in": placement_from_dataset_in, 
    "placement_from_dataset_out": placement_from_dataset_out, 
    "random_placement": random_dataset_placement,
    "random_uniform_placement": random_uniform_placement
}

# Parse program arguments
parser = argparse.ArgumentParser(description='Perform a simulation for a given amount of time.')
parser.add_argument('--days', metavar='simulation_days', type=int, default=1, required=False, help='number of days to simulate (default: 1)')
parser.add_argument('--bikes', metavar='number_of_bikes', type=int, default=500000, required=False, help='number of days to simulate (default: 500000)')
parser.add_argument('--output_file', metavar='output_file', type=str, default="output.json", required=False, help='simulation output file (default: "output.json")')
parser.add_argument('--hide_output', action='store_true', default=False, required=False, help='hides simulation step output (default: False)')
parser.add_argument('--placement', choices=placement_functions.keys(), default="placement_from_dataset_out", required=False, help='placement function used by the simulator (default: placement_from_dataset_out)')
args = parser.parse_args()




DAY_MINUTES = 1440 # 60 minutes * 24 hours = 1440 minutes

number_of_bikes = args.bikes
placement_function = placement_functions[args.placement].place
simulation_days = args.days
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

def compute_day(t):
    return int(t/DAY_MINUTES)+1

def place_initial_bikes(location_map, placement_function, num_bikes):
    placements = placement_function(num_bikes)
    for ((i, j), bikes) in placements:
        location_map.set_total_bikes_at(i, j, bikes)

def simulate(total_time, time_delta, events, simulation_parameters):
    """
    Performs a simulation for a given time with a fixed collection of events, logs and return statistics.
    total_time: max simulated time units
    time_delta: smallest time unit
    events: collection of events
    simulation_parameters: contains (total_bikes) number of bikes that will be used throughout whole simulation and (placement_function)
    """
    simulation_statistics = {"satisfied_events": 0, "total_events": 0}
    # divide day minutes by delta
    n = int(DAY_MINUTES/time_delta)
    event_data["CurrentDelta"] = event_data['Minutes'].apply(lambda m: (convert(m, n)))
    delta_groups = event_data.groupby("CurrentDelta")

    location_map = LocationMap(map_bounds, time_delta=time_delta)
    arrivals_table = {}
    prev_day = 1
    current_day = 1
    t = 0
    # satisfied events per day statistic
    day_satisfied_events = 0
    location_map.add_time(t)
    # place bikes
    place_initial_bikes(location_map, simulation_parameters["placement_function"], simulation_parameters["total_bikes"])
    print("Placed {} bikes on the map.".format(location_map.total_bikes))
    # loop until there's simulation time left
    while t < total_time:
        time_index = int(t/time_delta)
        time_group_index = int((t%DAY_MINUTES)/time_delta)
        events_in_time_interval = delta_groups.get_group(time_group_index)
        # satisfied events in current interval statistic
        current_satisfied_events = 0
        for event in events_in_time_interval.itertuples():
            i, j = coord_provider.find_interval(event.Latitude, event.Longitude)
            if(event.Type == 'A'):
                # arrival
                if event.ActivityId in arrivals_table:
                    # register the entrance
                    location_map.get(time_index, i, j).in_bikes+=1
                    # register the bike
                    location_map.increment_total_bikes_at(i, j)
                    # remove from table
                    arrivals_table.pop(event.ActivityId)
                    # register event satisfaction
                    current_satisfied_events+=1
            else:
                # departure
                # if any available bikes
                if location_map.get_total_bikes_at(i, j) > 0:
                    # register the exit
                    location_map.get(time_index, i, j).out_bikes+=1
                    # take a bike
                    location_map.decrement_total_bikes_at(i, j)
                    # start the ride
                    arrivals_table[event.ActivityId] = True
                    # register event satisfaction
                    current_satisfied_events+=1
        # increase day satisfied event statistic
        day_satisfied_events+=current_satisfied_events
        if not args.hide_output:
            print("day={}, t={}, satisfied {} out of {} events.".format(current_day, t, current_satisfied_events, len(events_in_time_interval)))
        
        prev_day = current_day
        t+=time_delta
        location_map.add_time(t)
        current_day = compute_day(t)
        if prev_day != current_day:
            print("Day {}, satisfied a total of {} out of {} events.".format(prev_day, day_satisfied_events, len(events)))
            day_satisfied_events = 0
        # update collected statistics
        simulation_statistics["total_events"]+=len(events_in_time_interval)
        simulation_statistics["satisfied_events"]+=current_satisfied_events
    print("Satisfied a total of {} out of {} events.".format(simulation_statistics["satisfied_events"], simulation_statistics["total_events"]))
    return location_map
if __name__ == "__main__":
    event_data = pd.read_csv(os.path.join(data_dir, "final_event_data.csv"))
    location_map = simulate(simulation_time, time_delta, event_data, {"placement_function": placement_function, "total_bikes": number_of_bikes})
    with open(args.output_file, 'w') as f:
        f.write(location_map.to_json())
