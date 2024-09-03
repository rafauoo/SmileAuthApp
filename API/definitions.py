from pydantic import BaseModel


class ImageData(BaseModel):
    image: str
    """ImageData dataclass
    """


class VideoData(BaseModel):
    video: str
    """VideoData dataclass
    """