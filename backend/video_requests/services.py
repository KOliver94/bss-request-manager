from video_requests.models import Comment


def create_comment(*, author, text, request):
    comment = Comment(author=author, text=text, request=request)
    comment.save()
    return comment
