from API.comment import CommentList
from API.config import COMMENTS_PATH

CommentList.from_file(COMMENTS_PATH)
for i in range(0, 201):
    val = i / 2
    comments = CommentList.available_comments(val)
    print(val, len(comments))
