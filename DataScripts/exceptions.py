class MoreThanOneFaceException(Exception):
    def __init__(self, message):
        super().__init__(message)


class NoFaceException(Exception):
    def __init__(self, message):
        super().__init__(message)


class SmileNotDetectedException(Exception):
    def __init__(self, message):
        super().__init__(message)
