from enum import Enum


"""
Check video rotation of the video.
It was created due to IOS videos being rotated when
transferred to the API.
"""


class VideoRotation(Enum):
    """VideoRotation enum

    Values:

        ERR = -1

        STRAIGHT = 0

        ROTATED_180 = 1

        ROTATED_90_CW = 2

        ROTATED_90_CCW = 3
    """

    ERR = -1
    STRAIGHT = 0
    ROTATED_180 = 1
    ROTATED_90_CW = 2
    ROTATED_90_CCW = 3


def detect_rotation(video_bytes: bytes) -> VideoRotation:
    """Detects rotation of the video.

    :param video_bytes: video bytes
    :type video_bytes: bytes
    """

    def find_tkhd_start(data: bytes) -> int:
        """Find 'trak tkhd' in bytes.

        :param data: data bytes
        :type data: bytes
        :return: position after 'trak tkhd'
        :rtype: int
        """
        trak_pos = data.find(b"trak")
        if trak_pos == -1:
            return -1
        data = data[trak_pos + len(b"trak") :]
        tkhd_pos = data.find(b"tkhd")
        if tkhd_pos == -1:
            return -1
        return trak_pos + len(b"trak") + tkhd_pos + 4

    def get_rotation_matrix(data: bytes, tkhd_start: int) -> bytes:
        """Get rotation bytes from data.

        :param data: data bytes
        :type data: bytes
        :param tkhd_start: position of tkhd
        :type tkhd_start: int
        :raises ValueError: @ was not found
        :raises ValueError: Not valid rotation bytes size
        :return: rotation bytes
        :rtype: bytes
        """
        at_pos = data.find(b"\x40", tkhd_start + 12)
        if at_pos == -1:
            raise ValueError("@ was not found")
        start = at_pos - 32
        if start < tkhd_start:
            start = tkhd_start

        matrix = data[start:at_pos]
        if len(matrix) != 32:
            raise ValueError("Not valid rotation bytes size")

        return matrix

    def detect_rotation(matrix: bytes) -> VideoRotation:
        """Detects rotation on bytes.

        :param matrix: rotation bytes
        :type matrix: bytes
        :return: video rotation information
        :rtype: VideoRotation
        """
        matrix = [hex(i) for i in matrix]
        hex_string = "".join(format(int(x, 16), "02x") for x in matrix)
        matrix = hex_string[:36].upper()
        # no rotation
        if matrix == "000100000000000000000000000000000001":
            return VideoRotation.STRAIGHT
        # 180
        elif matrix == "FFFF0000000000000000000000000000FFFF":
            return VideoRotation.ROTATED_180
        # 90 cw
        elif matrix == "000000000001000000000000FFFF00000000":
            return VideoRotation.ROTATED_90_CW
        # 90 ccw
        elif matrix == "00000000FFFF000000000000000100000000":
            return VideoRotation.ROTATED_90_CCW
        else:
            return VideoRotation.ERR

    tkhd_start = find_tkhd_start(video_bytes)
    if tkhd_start == -1:
        return VideoRotation.ERR
    try:
        matrix = get_rotation_matrix(video_bytes, tkhd_start)
        rotation = detect_rotation(matrix)
    except ValueError:
        return VideoRotation.ERR
    return rotation
