import json
from unittest.mock import mock_open, patch
from API.comment import Comment, CommentList


def test_comment_is_value_in_range():
    comment = Comment(0, 2, {'en': 'Test comment'})
    assert comment.is_value_in_range(1)
    assert not comment.is_value_in_range(3)


def test_comment_get_content():
    comment = Comment(0, 2, {'en': 'English comment', 'pl': 'Polski komentarz'})
    assert comment.get_content() == {'en': 'English comment', 'pl': 'Polski komentarz'}


def test_comment_repr():
    comment = Comment(0, 2, {'en': 'English comment'})
    assert repr(comment) == "Comment(min=0, max=2, content={'en': 'English comment'})"


def test_comment_list_singleton():
    mock_comments_data = json.dumps([
        {"min": 0, "max": 2, "content": {"en": "Test comment 1", "pl": "Komentarz 1"}},
        {"min": 3, "max": 5, "content": {"en": "Test comment 2", "pl": "Komentarz 2"}}
    ])

    with patch("builtins.open", mock_open(read_data=mock_comments_data)):
        instance1 = CommentList.from_file('mock_path')
        instance2 = CommentList.from_file('mock_path')

    assert instance1 is instance2


def test_comment_list_initialization():
    mock_comments_data = json.dumps([
        {"min": 0, "max": 2, "content": {"en": "Test comment 1", "pl": "Komentarz 1"}},
        {"min": 3, "max": 5, "content": {"en": "Test comment 2", "pl": "Komentarz 2"}}
    ])

    with patch("builtins.open", mock_open(read_data=mock_comments_data)):
        comment_list = CommentList.from_file('mock_path')

        assert len(comment_list.comments) == 2
        assert comment_list.comments[0].content['en'] == "Test comment 1"
        assert comment_list.comments[1].content['pl'] == "Komentarz 2"


def test_comment_list_available_comments():
    mock_comments_data = json.dumps([
        {"min": 0, "max": 2, "content": {"en": "Test comment 1", "pl": "Komentarz 1"}},
        {"min": 3, "max": 5, "content": {"en": "Test comment 2", "pl": "Komentarz 2"}}
    ])

    with patch("builtins.open", mock_open(read_data=mock_comments_data)):
        CommentList.from_file('mock_path')
        
        available = CommentList.available_comments(1)
        assert len(available) == 1
        assert available[0].content['en'] == "Test comment 1"

        available = CommentList.available_comments(4)
        assert len(available) == 1
        assert available[0].content['en'] == "Test comment 2"
