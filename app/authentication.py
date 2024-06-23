from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from .models import Member

class MemberAuthenticationBackend(BaseBackend):
    def authenticate(self, request, phone=None, sms_code=None):


        try:
            print("Phone is: ", phone, " Code is: ", sms_code)
            member = Member.objects.get(phone=phone, sms_code=sms_code)
            print("Member is: ", member)
            return member
        except Member.DoesNotExist:
            return None
        

    def get_user(self, user_id):
        try:
            return Member.objects.get(pk=user_id)
        except Member.DoesNotExist:
            return None
