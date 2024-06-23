from django.urls import path
from . import views


urlpatterns = [
    path("register/", views.register, name="register"),
    path('login/', views.login, name='login'),
    path("main/", views.main, name="main"),
    path('generate-code/', views.generate_code, name='generate_code'),
    path('quiz/', views.start_quiz, name='start_quiz'),
    path('submit-quiz/', views.submit_quiz, name='submit_quiz'),
    path('thank_you/', views.thank_you_view, name='thank-you'),
    path('send-sms/', views.send_sms, name='send_sms'),  # Telefon raqamini yuborish
    path('verify-sms/', views.verify_sms_code, name='verify_sms'),  # SMS kodini tekshirish



]