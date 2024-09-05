from API.exceptions import VideoTooLongException
from API.config import VIDEO_LENGTH_LIMIT_MS
import av
import io


def get_video_length(video_bytes: bytes) -> tuple[int, int]:
    """Get video length from video bytes.

    :param video_bytes: video bytes
    :type video_bytes: bytes
    :return: (duration, fps)
    :rtype: tuple[int, int]
    """
    video_buffer = io.BytesIO(video_bytes)
    with av.open(video_buffer) as container:
        duration = container.duration
        fps = container.streams.video[0].average_rate
        return int(duration / 1000), int(fps)


def validate_video(video_bytes: bytes) -> None:
    """Validate if video is OK to process.

    :param video_bytes: video bytes
    :type video_bytes: bytes
    :raises VideoTooLongException: when video duration > VIDEO_LENGTH_LIMIT_MS
    """
    duration, fps = get_video_length(video_bytes)
    if duration > VIDEO_LENGTH_LIMIT_MS:
        raise VideoTooLongException("Video too long", "")
