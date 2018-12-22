from .placement import Placement

class PlacementFromDataset(Placement):

    def __init__(self, usage_info, normalize_usage=True):
        """
        Initializes a placement object that uses usage_info in order to place items
        usage_info: A pandas dataframe in the following format: (Row, Column, Usage)
        normalize_usage: If usage column should be normalized to [0, 1] interval
        """
        self._usage_info = usage_info
        self._normalize_usage = normalize_usage

    def place(self, num_items):
        placements = []
        for item in self._usage_info.itertuples():
            if self._normalize_usage:
                # If usage is a percentual so we need to scale it to obtain the fraction
                usage = int((num_items*item.Usage/100.0))
            else:
                usage = int((num_items*item.Usage))
            placements.append(((item.Row, item.Column), usage))
        return placements