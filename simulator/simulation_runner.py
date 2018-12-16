"""
Simulation runner, used to perform multiple simulation runs.
Example of usage:
python3 simulation_runner.py --args "--bikes  6000 --placement random_placement --hide_output" --times 100 --output_dir simulation_6000_bikes_random_placement
"""

import os
import subprocess
import argparse

purple_string=lambda prt : "\033[95m{}\033[00m" .format(prt)

# Parse program arguments
parser = argparse.ArgumentParser(description='Perform a simulation for a given amount of time.')
parser.add_argument('--times', metavar='simulation_times', type=int, default=1, required=False, help='execute the simulation this amount of times (default: 1)')
parser.add_argument('--output_dir', metavar='output_dir', type=str, default=".", required=False, help='output directory (default: ".")')
parser.add_argument('--args', metavar='args', type=str, default="", required=False, help='arguments that will be passed to each simulation run (default: "")')
args = parser.parse_args()

times = args.times
run_args = args.args
output_dir = args.output_dir

# create new dir if not exists
if not os.path.exists(output_dir):
    os.mkdir(output_dir)

for i in range(times):
    # build arguments string
    subprocess_arguments = ["python3", "simulator.py", "--output_file", os.path.join(output_dir, "output_{}.json").format(i+1)]
    # if any run arguments
    if run_args.strip() != "":
        # divide them
        parsed_args = run_args.split()
        for arg in parsed_args:
            # append to arguments string
            subprocess_arguments.append(arg)
    print(purple_string("Run {}/{}".format(i+1, times)))
    # perform the run
    subprocess.call(subprocess_arguments)
