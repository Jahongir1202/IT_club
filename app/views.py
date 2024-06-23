from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Member, Question, Answer
import random
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login,authenticate
from .forms import SMSLoginForm
from .authentication import MemberAuthenticationBackend




def register(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        surname = request.POST.get('surname')
        email = request.POST.get('email')
        phone = request.POST.get('phone').replace(' ', '')


        if Member.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'message': "Bu pochta manzili avval ro'yxatga olingan"})
        
        if Member.objects.filter(phone=phone).exists():
            return JsonResponse({'success': False, 'message': "Bu raqam avval ro'yxatga olingan"})


        if not name or not surname or not email or not phone:
            return HttpResponse("All fields are required.", status=400)

        user = Member(name=name, surname=surname, email=email, phone=phone)
        user.save()

        return JsonResponse({'success': True, 'message': "Siz muvaffaqiyatli ro'yxatdan o'tdingiz"})

    else:
        return render(request, 'register.html')



def main(request):
    return render(request, 'main.html')


@csrf_exempt
def generate_code(request):
    data = json.loads(request.body)
    phone = data.get('phone').replace(' ', '')
    user = Member.objects.filter(phone=phone).first()

    if not user:
        print("Telefon topilmadi")
        return JsonResponse({'success': False, 'message': "Telefon raqami ro\'yxatdan o\'tmagan"})


    # Agar telefon raqami mavjud bo'lsa, kodni generatsiya qilish va qaytarish
    code = f"{random.randint(100000, 999999)}"
    user.verification_code = code

    print(code)
    user.save()
    return JsonResponse({'success': True, 'message': 'Kod yuborildi', 'code': code})




def send_sms(request):
    if request.method == 'POST':
        phone = request.POST.get('phone')
        sms_code = "123456"  # Bu misol uchun statik kod, amaliyotda bu kod generatsiya qilinishi kerak
        request.session['phone'] = phone
        request.session['sms_code'] = sms_code
        return redirect('verify_sms')
    else:
        return render(request, 'send_sms.html')

def verify_sms_code(request):
    if request.method == 'POST':
        user_sms_code = request.POST.get('sms_code')
        phone = request.session.get('phone')
        saved_sms_code = request.session.get('sms_code')
        
        print("Phone number is: ", phone)
        print("Session sms is: ", saved_sms_code)
        print("User sms is: ", user_sms_code)

        if user_sms_code == saved_sms_code:
            # Sessiyada saqlangan telefon orqali Member ob'ektini qidirish
            try:
                member = Member.objects.get(phone=phone)
                request.session['member_id'] = member.id  # Foydalanuvchi ID'sini sessiyada saqlash
                return redirect('main')  # Foydalanuvchini asosiy sahifaga yo'naltirish
            except Member.DoesNotExist:
                return HttpResponse("Bunday foydalanuvchi mavjud emas.", status=404)
        else:
            return HttpResponse("SMS kod noto'g'ri.", status=400)
    else:
        return render(request, 'verify_sms.html')
















def sms_login(request):
    if request.method == 'POST':
        form = SMSLoginForm(request.POST)
        if form.is_valid():
            phone = form.cleaned_data.get('phone')
            sms_code = form.cleaned_data.get('sms_code')
            user = authenticate(request, phone=phone, sms_code=sms_code)
            if user:
                login(request, user)
                return redirect('home')
            else:
                form.add_error(None, 'Telefon raqam yoki SMS kod noto\'g\'ri.')
    else:
        form = SMSLoginForm()
    return render(request, 'sms_login.html', {'form': form})






def login(request):
    if request.method == 'POST':
        print("Heeloo")
        phone = request.POST.get('phone')
        user_input_code = request.POST.get('code')  # Foydalanuvchi kiritgan kod

        # Foydalanuvchi bazada borligini tekshirish
        user = Member.objects.filter(phone=phone).first()
        if not user:
            return JsonResponse({'success': False, 'message': "Telefon raqami ro'yxatdan o'tmagan."})

        # Vaqtinchalik: Consolda ko'rsatilgan kodni tekshirish
        if 'generated_code' in request.session and request.session['generated_code'] == user_input_code:
            # Kod to'g'ri. Foydalanuvchi tizimga kiradi
            # Muvaffaqiyatli kirishni amalga oshiring. Masalan, sessiyani o'rnatish
            return JsonResponse({'success': True, 'message': "Siz muvaffaqiyatli tizimga kirdingiz."})
        else:
            return JsonResponse({'success': False, 'message': "Noto'g'ri kod."})
    else:
        # Yangi kod generatsiya qilish va uni consolga chiqarish
        generated_code = str(random.randint(100000, 999999))
        request.session['generated_code'] = generated_code  # Sessiyaga kodni saqlash
        print("Generated code:", generated_code)  # Vaqtinchalik chiqarish

        return render(request, 'send_sms.html')



def start_quiz(request):
    questions = Question.objects.all()[:10]  # 10 ta savolni olish
    return render(request, 'quiz.html', {'questions': questions})



# def submit_quiz(request):
#     if request.method == 'POST':
#         member_id = request.session.get('member_id')
#         if not member_id:
#             return redirect('/login/')  # Agar sessiyada member_id yo'q bo'lsa, login sahifasiga yo'naltirish
#         member = Member.objects.get(id=member_id)
#         print("Member is: ", member)
#         for key, value in request.POST.items():
#             print("Key: ", key)
#             print("Value: ", value)
#             if key.startswith('answer_'):
#                 parts = key.split('_')
#                 if len(parts) < 3:
#                     print(f"Skipping key with unexpected format: {key}")
#                     continue
#                 question_id = parts[2]
#                 question = Question.objects.get(id=question_id)
#                 if question.question_type == Question.CHOICE:
#                     answer_choice = value
#                     answer_text = None
#                 else:
#                     answer_text = value
#                     answer_choice = None
#                 print("Question is: ", question)
#                 print("User is: ", member)
#                 print("Answer text is: ", answer_text)
#                 print("Answer choice is: ", answer_choice)



#                 Answer.objects.create(
#                     question=question,
#                     user=member,
#                     answer_text=answer_text,
#                     answer_choice=answer_choice
#                 )
#         return redirect('/thank_you/')
#     return redirect('/quiz/')

def submit_quiz(request):
    if request.method == 'POST':
        print("Submit is working")
        member_id = request.session.get('member_id')
        if not member_id:
            return redirect('/login/')
        member = Member.objects.get(id=member_id)
        
        for key, value in request.POST.items():

            print("Key: ", key)
            print("Value: ", value)
            if key.startswith('answer_'):
                parts = key.split('_')
                if len(parts) != 2:
                    continue
                question_id = parts[1]
                question = Question.objects.get(id=question_id)
                
                if question.question_type == Question.CHOICE:
                    answer_choice = value
                    answer_text = question.choices.get(answer_choice, None)
                else:
                    answer_text = value
                    answer_choice = None

                # Javobni yangilash yoki yangi javob yaratish
                answer, created = Answer.objects.update_or_create(
                    question=question,
                    user=member,
                    defaults={'answer_text': answer_text, 'answer_choice': answer_choice}
                )

        return redirect('/thank_you/')
    return redirect('/quiz/')








def thank_you_view(request):
    return render(request, 'thank_you.html', {})


