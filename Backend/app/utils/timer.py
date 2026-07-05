import time

class SessionTimer:
    def __init__(self):
        self.start_time = None

    def start(self):
        self.start_time = time.time()

    def get_elapsed(self) -> int:
        if not self.start_time:
            return 0
        return int(time.time() - self.start_time)
