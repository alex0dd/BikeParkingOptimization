from .placement import Placement
import numpy as np

class RandomUniformPlacement(Placement):

    def __init__(self, usage_info):
        """
        Initializes a placement object that uses usage_info in order to place items in a random uniform way
        usage_info: A pandas dataframe in the following format: (Row, Column)
        normalize_usage: If usage column should be normalized to [0, 1] interval
        """
        self._usage_info = usage_info

    def place(self, num_items):
        # choose a random quadrant in uniform way
        choices = np.random.choice(len(self._usage_info), num_items)
        # count items per quadrant
        counts = np.bincount(choices)
        placements = []
        for index, item in enumerate(self._usage_info.itertuples()):
            if index < len(counts):
                to_place = counts[index]
                placements.append(((item.Row, item.Column), to_place))
        return placements

class RandomDatasetPlacement(Placement):

    def __init__(self, usage_info, normalize_usage=True):
        """
        Initializes a placement object that uses usage_info in order to place items in a random proportioned way
        usage_info: A pandas dataframe in the following format: (Row, Column, Usage)
        normalize_usage: If usage column should be normalized to [0, 1] interval
        """
        self._usage_info = usage_info
        self._normalize_usage = normalize_usage

    def place(self, num_items):
        usage_probs = self._usage_info.Usage/100 if self._normalize_usage else self._usage_info.Usage
        # choose a random quadrant with a probability coming from usage data for each item individually
        choices = np.random.choice(len(self._usage_info), num_items, p=usage_probs)
        # count items per quadrant
        counts = np.bincount(choices)
        placements = []
        for index, item in enumerate(self._usage_info.itertuples()):
            if index < len(counts):
                to_place = counts[index]
                placements.append(((item.Row, item.Column), to_place))
        return placements