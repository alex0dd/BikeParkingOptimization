import argparse
from services import CoordinateProvider
from structures import LocationMap, LocationMapBounds
import pandas as pd
import datetime
import os

def placement_from_dataset_out(num_bikes):
    total_bikes = num_bikes
    usage_info = pd.read_csv(os.path.join(data_dir, "usage_percentage_out.csv"))
    placements = []
    for item in usage_info.itertuples():
        # PercOut is a percentual so we need to scale it to obtain the fraction
        out = int((total_bikes*item.PercOut/100.0))
        placements.append(((item.Row, item.Column), out))
    return placements

def placement_from_dataset_in(num_bikes):
    total_bikes = num_bikes
    usage_info = pd.read_csv(os.path.join(data_dir, "usage_percentage_out.csv"))
    placements = []
    for item in usage_info.itertuples():
        # PercOut is a percentual so we need to scale it to obtain the fraction
        out = int((total_bikes*item.PercIn/100.0))
        placements.append(((item.Row, item.Column), out))
    return placements

placement_functions = {"placement_from_dataset_in": placement_from_dataset_in, "placement_from_dataset_out": placement_from_dataset_out}

# Parse program arguments
parser = argparse.ArgumentParser(description='Perform a simulation for a given amount of time.')
parser.add_argument('--days', metavar='simulation_days', type=int, default=1, required=False, help='number of days to simulate (default: 1)')
parser.add_argument('--bikes', metavar='number_of_bikes', type=int, default=500000, required=False, help='number of days to simulate (default: 500000)')
parser.add_argument('--output_file', metavar='output_file', type=str, default="output.json", required=False, help='simulation output file (default: "output.json")')
parser.add_argument('--hide_output', action='store_true', default=False, required=False, help='hides simulation step output (default: False)')
parser.add_argument('--placement', choices=placement_functions.keys(), default="placement_from_dataset_out", required=False, help='placement function used by the simulator (default: placement_from_dataset_out)')
args = parser.parse_args()

#print(args)

DAY_MINUTES = 1440 # 60 minutes * 24 hours = 1440 minutes

number_of_bikes = args.bikes
placement_function = placement_functions[args.placement]
simulation_days = args.days
simulation_time = 60*24*simulation_days # 24 hours * simulation_days
time_delta = 15 # 15 min
rescaled_time_bound = int(simulation_time/time_delta)
map_bounds = LocationMapBounds(t=rescaled_time_bound, x=140, y=115)
spacing = 100 # 100 meters
initial_location = [44.45216343349134, 11.255149841308594]
coord_provider = CoordinateProvider(initial_location, spacing)

data_dir = "data"

def convert(x, n_steps):
    # 1440 is max minutes in a day
    return int(((n_steps)*x)/DAY_MINUTES) #+ 1

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
    t = 0
    location_map.add_time(t)
    # place bikes
    place_initial_bikes(location_map, simulation_parameters["placement_function"], simulation_parameters["total_bikes"])
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
                    # register the transit
                    location_map.get(time_index, i, j).transiting_bikes+=1
                    # register the bike
                    location_map.increment_total_bikes_at(i, j)
                    # remove from table
                    arrivals_table.pop(event.ActivityId)
                    # register event satisfaction
                    current_satisfied_events+=1
            else:
                # departure
                # if someone transiting
                if location_map.get(time_index, i, j).transiting_bikes > 0:
                    # decrement the transiting
                    location_map.get(time_index, i, j).transiting_bikes-=1
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
        if not args.hide_output:
            print("t={}, satisfied {} out of {} events.".format(t, current_satisfied_events, len(events_in_time_interval)))
        t+=time_delta
        location_map.add_time(t)
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
