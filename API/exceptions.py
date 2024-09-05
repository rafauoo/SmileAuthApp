class VideoTooLongException(Exception):
    def __init__(self, message, errors):
        super().__init__(message)
