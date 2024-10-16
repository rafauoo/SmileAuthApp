import json


class Comment:
    def __init__(self, min_value: int, max_value: int, content: dict):
        self.min = min_value
        self.max = max_value
        self.content = content

    def get_content(self) -> str:
        return self.content

    def is_value_in_range(self, value: float) -> bool:
        """Check if the given value falls within the comment's range."""
        return self.min <= value <= self.max

    def __repr__(self) -> str:
        return f"Comment(min={self.min}, max={self.max}, content={self.content})"


class CommentList:
    _instance = None

    def __init__(self, comments: list[Comment]):
        if CommentList._instance is not None:
            raise Exception("This class is a singleton!")
        self.comments = comments
        CommentList._instance = self

    @classmethod
    def from_file(cls, file_path: str):
        if cls._instance is None:
            with open(file_path) as fp:
                comments_data = json.load(fp)
                comments = [Comment(comment['min'], comment['max'],
                                    comment['content'])
                            for comment in comments_data]
                cls._instance = cls(comments)
        return cls._instance

    @classmethod
    def available_comments(cls, value: float) -> list[Comment]:
        """Return a list of comments whose range includes the given value."""
        instance = cls._instance
        if instance is None:
            raise Exception("CommentList is not initialized.")
        return [comment for comment in instance.comments
                if comment.is_value_in_range(value)]

    def __repr__(self) -> str:
        return f"CommentList({self.comments})"
