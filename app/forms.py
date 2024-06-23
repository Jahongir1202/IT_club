from django import forms

class SMSLoginForm(forms.Form):
    phone = forms.CharField(label='Telefon raqami')
    sms_code = forms.CharField(label='SMS Kod')
