class MoreThanOneFaceException(Exception):
    def __init__(self, message, errors):
        super().__init__(message)

class NoFaceException(Exception):
    def __init__(self, message, errors):
        super().__init__(message)

class SmileNotDetectedException(Exception):
    def __init__(self, message, errors):
        super().__init__(message)