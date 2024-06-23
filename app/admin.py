from django.contrib import admin
from .models import Member, Question, Answer


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'question_type']
    fields = ['question_text', 'question_type', 'choices']

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['question', 'user', 'answer_text', 'answer_choice']


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0  # Qo'shimcha bo'sh formalar soni
    readonly_fields = ('question', 'answer_text', 'answer_choice')

    def has_add_permission(self, request, obj):
        return False  # Yangi javob qo'shishni o'chirish

    def has_delete_permission(self, request, obj=None):
        return False  # Javobni o'chirishni o'chirish

class MemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'surname', 'email', 'phone')
    inlines = [AnswerInline]
    readonly_fields = ('name', 'surname', 'email', 'phone', 'sms_code')

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.prefetch_related('answer_set__question')
        return queryset

admin.site.register(Member, MemberAdmin)


