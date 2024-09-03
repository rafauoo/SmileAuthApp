import numpy as np
import cv2
import dlib
from cv2.typing import MatLike

FACIAL_LANDMARKS_IDXS = {
    "jaw": (0, 17),
    "right_brow": (17, 22),
    "left_brow": (22, 27),
    "nose": (27, 36),
    "right_eye": (36, 42),
    "left_eye": (42, 48),
    "mouth": (48, 61),
    "lips": (61, 68),
}

from DataScripts.utils import landmarks_to_np
from DataScripts.config import DESIRED_FACE_PHOTO_WIDTH
from DataScripts.config import DESIRED_LEFT_EYE_POS as DLAP


class FaceAligner:
    """FaceAligner class. It aligns, cuts and scales the face from an image.
    """
    def __init__(
        self,
        predictor: dlib.shape_predictor,
        desired_left_eye_pos: tuple = (DLAP, DLAP),
        desired_face_photo_width: int = DESIRED_FACE_PHOTO_WIDTH,
        desired_face_photo_height: int | None = None,
    ):
        """FaceAligner constructor

        :param predictor: predictor
        :type predictor: dlib.shape_predictor
        :param desired_left_eye_pos: desired left eye position, defaults to (0.35, 0.35)
        :type desired_left_eye_pos: tuple, optional
        :param desired_face_photo_width: desired face photo width, defaults to DESIRED_FACE_PHOTO_WIDTH
        :type desired_face_photo_width: int, optional
        :param desired_face_photo_height: desired face photo height, defaults to None
        :type desired_face_photo_height: int, optional
        """
        self.predictor = predictor
        self.desired_left_eye_pos = desired_left_eye_pos
        self.desired_face_photo_width = desired_face_photo_width
        self.desired_face_photo_height = desired_face_photo_height
        if self.desired_face_photo_height is None:
            self.desired_face_photo_height = self.desired_face_photo_width

    def align(self, image: MatLike, gray: MatLike, rect: dlib.rectangle) -> MatLike:
        """Aligns face on the frame

        :param image: source frame
        :type image: MatLike
        :param gray: grayed frame
        :type gray: MatLike
        :param rect: coordinates of the face
        :type rect: dlib.rectangle
        :return: aligned image
        :rtype: MatLike
        """
        if (
            isinstance(rect, np.ndarray) and len(rect) == 4
        ):  # data format for first 2 algorithms extracting faces
            x = rect[0]
            y = rect[1]
            w = rect[2]
            h = rect[3]
            rect = dlib.rectangle(x, y, x + w, y + h)
        shape = self.predictor(gray, rect)
        shape = landmarks_to_np(shape)
        (left_eye_beg, left_eye_end) = FACIAL_LANDMARKS_IDXS["left_eye"]
        (right_eye_beg, right_eye_end) = FACIAL_LANDMARKS_IDXS["right_eye"]
        left_eye_points = shape[left_eye_beg:left_eye_end]
        right_eye_points = shape[right_eye_beg:right_eye_end]

        for lep in left_eye_points:
            cv2.circle(
                img=image,
                center=(lep[0], lep[1]),
                radius=5,
                color=(0, 255, 0),
                thickness=-1,
            )
        for rep in right_eye_points:
            cv2.circle(
                img=image,
                center=(rep[0], rep[1]),
                radius=5,
                color=(0, 255, 0),
                thickness=-1,
            )

        # calculate an angle between a line connecting centres of eyes
        left_eye_center = left_eye_points.mean(axis=0).astype("int")
        right_eye_center = right_eye_points.mean(axis=0).astype("int")

        cv2.circle(
            img=image,
            center=(left_eye_center[0], left_eye_center[1]),
            radius=5,
            color=(0, 0, 255),
            thickness=-1,
        )
        cv2.circle(
            img=image,
            center=(right_eye_center[0], right_eye_center[1]),
            radius=5,
            color=(0, 0, 255),
            thickness=-1,
        )
        cv2.line(
            img=image,
            pt1=(left_eye_center[0], left_eye_center[1]),
            pt2=(right_eye_center[0], right_eye_center[1]),
            color=(255, 0, 0),
            thickness=2,
        )

        dY = right_eye_center[1] - left_eye_center[1]
        dX = right_eye_center[0] - left_eye_center[0]
        angle = np.degrees(np.arctan2(dY, dX)) - 180

        dist = np.sqrt((dX**2) + (dY**2))
        desired_right_eye_x = 1.0 - self.desired_left_eye_pos[0]
        desired_dist = desired_right_eye_x - self.desired_left_eye_pos[0]
        desired_dist *= self.desired_face_photo_width
        scale = desired_dist / dist

        eyes_center = (
            int((left_eye_center[0] + right_eye_center[0]) // 2),
            int((left_eye_center[1] + right_eye_center[1]) // 2),
        )

        cv2.circle(
            img=image,
            center=(eyes_center[0], eyes_center[1]),
            radius=7,
            color=(11, 214, 224),
            thickness=-1,
        )

        matrix = cv2.getRotationMatrix2D(eyes_center, angle, scale)
        tX = self.desired_face_photo_width * 0.5
        tY = self.desired_face_photo_height * self.desired_left_eye_pos[1]
        matrix[0, 2] += tX - eyes_center[0]
        matrix[1, 2] += tY - eyes_center[1]

        # apply the affine transformation
        (w, h) = (self.desired_face_photo_width, self.desired_face_photo_height)
        output = cv2.warpAffine(image, matrix, (w, h), flags=cv2.INTER_CUBIC)

        return output
