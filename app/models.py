from django.db import models

class Member(models.Model):
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    sms_code = models.CharField(max_length=6, blank=True, null=True)

    def __str__(self):
        return f"{self.name} {self.surname}"

class Question(models.Model):
    TEXT = 'text'
    CHOICE = 'choice'
    
    QUESTION_TYPES = [
        (TEXT, 'Text Answer'),
        (CHOICE, 'Multiple Choice'),
    ]
    
    question_text = models.TextField()
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES, default=CHOICE)
    choices = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        return self.question_text

class Answer(models.Model):
    question = models.ForeignKey(Question, related_name='answers', on_delete=models.CASCADE)
    user = models.ForeignKey(Member, on_delete=models.CASCADE)  # Endi `Member`ga bog'lanadi
    answer_text = models.CharField(max_length=255, blank=True, null=True)
    answer_choice = models.CharField(max_length=1, blank=True, null=True)

    def __str__(self):
        return f"{self.user}'s answer to {self.question}"
