from django.utils.deprecation import MiddlewareMixin
from .models import Member

class MemberAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        member_id = request.session.get('member_id')
        if member_id:
            try:
                request.member = Member.objects.get(id=member_id)
            except Member.DoesNotExist:
                del request.session['member_id']
