import struct


def detect_rotation(video_bytes):
    def find_tkhd_start(data):
        # Search for 'trak' in the byte stream
        trak_pos = data.find(b"trak")
        if trak_pos == -1:
            return -1
        # Start searching for 'tkhd' after 'trak'
        data = data[trak_pos + len(b"trak") :]
        tkhd_pos = data.find(b"tkhd")
        if tkhd_pos == -1:
            return -1

        # Position of 'tkhd' box in the byte stream
        return trak_pos + len(b"trak") + tkhd_pos + 4  # +4 to skip 'tkhd'

    def get_rotation_matrix(data, tkhd_start):
        # Szukaj '@' (0x40) po atomie 'tkhd'
        at_pos = data.find(b"\x40", tkhd_start + 12)  # +12 aby pominąć nagłówek 'tkhd'
        if at_pos == -1:
            raise ValueError("Znak @ (0x40) nie znaleziony po atomie tkhd.")
        start = at_pos - 32
        if start < tkhd_start:
            start = tkhd_start

        matrix = data[start:at_pos]
        if len(matrix) != 32:
            raise ValueError("Nieprawidłowy rozmiar bufora macierzy rotacji.")

        return matrix

    def detect_rotation(matrix):
        matrix = [hex(i) for i in matrix]
        hex_string = "".join(format(int(x, 16), "02x") for x in matrix)
        matrix = hex_string[:36].upper()
        # no rotation
        if matrix == "000100000000000000000000000000000001":
            return 0
        # 180
        elif matrix == "FFFF0000000000000000000000000000FFFF":
            return 1
        # 90 cw
        elif matrix == "000000000001000000000000FFFF00000000":
            return 2
        # 90 ccw
        elif matrix == "00000000FFFF000000000000000100000000":
            return 3
        else:
            return 4

    # Find 'tkhd' atom position and extract rotation matrix
    tkhd_start = find_tkhd_start(video_bytes)
    if tkhd_start == -1:
        return "tkhd atom not found"

    matrix = get_rotation_matrix(video_bytes, tkhd_start)
    rotation = detect_rotation(matrix)
    return rotation
