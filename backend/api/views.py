from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import serializers, views, status
from rest_framework.response import Response
from rest_framework.decorators import api_view

# Create your views here.

class CodeReviewSerializer(serializers.Serializer):
    code = serializers.CharField()
    language = serializers.ChoiceField(choices=[('python', 'Python'), ('javascript', 'JavaScript')])
    learning_mode = serializers.BooleanField(default=False)

@api_view(['POST'])
def code_review(request):
    serializer = CodeReviewSerializer(data=request.data)
    if serializer.is_valid():
        code = serializer.validated_data['code']
        language = serializer.validated_data['language']
        learning_mode = serializer.validated_data['learning_mode']
        # Placeholder for AI integration
        feedback = {
            'style': 'Looks good!',
            'bugs': 'No obvious bugs found.',
            'improvements': 'Consider using more descriptive variable names.',
        }
        if learning_mode:
            feedback['learning'] = 'Using const in JavaScript prevents reassignment.'
        return Response({'feedback': feedback})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def home(request):
    return HttpResponse("<h1>Welcome to CodeMentor_AI</h1><p>AI Code Review Assistant for Beginners</p>")
