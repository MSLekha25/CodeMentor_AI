from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import serializers, views, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
import openai
import os
from django.utils.crypto import get_random_string
from django.db.models import Q

from dotenv import load_dotenv

load_dotenv()


AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT")
AZURE_OPENAI_API_VERSION = "2025-01-01-preview"

from .models import SignupLog, ChatHistory

class CodeReviewSerializer(serializers.Serializer):
    code = serializers.CharField()
    learning_mode = serializers.BooleanField(default=False)

class MultiTurnCodeReviewSerializer(serializers.Serializer):
    messages = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of messages, each with 'role' and 'content'"
    )
    learning_mode = serializers.BooleanField(default=False, required=False)
    session_id = serializers.CharField(required=False, allow_blank=True)

@api_view(['POST'])
def fetch_user_chats(request):
    """
    Expects: {"email": "user@example.com"}
    Returns: [
      {"id": chat_id, "session_id": ..., "name": ..., "messages": [...]}, ...
    ]
    """
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email required'}, status=400)
    user = SignupLog.objects.filter(email=email).first()
    if not user:
        return Response({'chats': []})
    chats = ChatHistory.objects.filter(user=user).order_by('-updated_at')
    chat_list = []
    for chat in chats:
        # Name: first user message, or fallback
        name = None
        for msg in chat.messages:
            if msg.get('role') == 'user' and msg.get('content'):
                name = msg['content'].strip().split('\n')[0][:60]
                break
        if not name:
            name = f"Chat {chat.id}"
        chat_list.append({
            'id': chat.id,
            'session_id': chat.session_id,
            'name': name,
            'messages': chat.messages,
            'updated_at': chat.updated_at,
        })
    return Response({'chats': chat_list})

@api_view(['POST'])
def code_review(request):
    # Multi-turn: prefer messages, fallback to old code
    if 'messages' in request.data:
        serializer = MultiTurnCodeReviewSerializer(data=request.data)
        if serializer.is_valid():
            messages = serializer.validated_data['messages']
            learning_mode = serializer.validated_data.get('learning_mode', False)
            session_id = serializer.validated_data.get('session_id') or get_random_string(32)
            email = request.data.get('email')
            user = None
            if email:
                user = SignupLog.objects.filter(email=email).first()
            # Save or update chat history
            chat_obj, _ = ChatHistory.objects.get_or_create(session_id=session_id)
            chat_obj.messages = messages
            if user:
                chat_obj.user = user
            chat_obj.save()
            try:
                openai.api_type = "azure"
                openai.api_key = AZURE_OPENAI_API_KEY
                openai.api_base = AZURE_OPENAI_ENDPOINT
                openai.api_version = AZURE_OPENAI_API_VERSION
                # Compose system prompt and user/ai turns
                system_prompt = {
                    "role": "system",
                    "content": f"You are an AI code reviewer. Analyze code and provide feedback on style, bugs, and improvements.{' Also explain concepts for beginners.' if learning_mode else ''}"
                }
                chat_messages = [system_prompt] + [
                    {"role": m["role"], "content": m["content"]} for m in messages
                ]
                client = openai.AzureOpenAI(
                    api_key=AZURE_OPENAI_API_KEY,
                    api_version=AZURE_OPENAI_API_VERSION,
                    azure_endpoint=AZURE_OPENAI_ENDPOINT
                )
                response = client.chat.completions.create(
                    model=AZURE_OPENAI_DEPLOYMENT,
                    messages=chat_messages,
                    temperature=0.2,
                    max_tokens=2048,
                )
                ai_feedback = response.choices[0].message.content
                return Response({'feedback': {'ai': ai_feedback}, 'session_id': session_id})
            except Exception as e:
                print(f"Azure OpenAI error: {e}")
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    # Fallback: single-turn legacy
    serializer = CodeReviewSerializer(data=request.data)
    if serializer.is_valid():
        code = serializer.validated_data['code']
        learning_mode = serializer.validated_data['learning_mode']
        try:
            openai.api_type = "azure"
            openai.api_key = AZURE_OPENAI_API_KEY
            openai.api_base = AZURE_OPENAI_ENDPOINT
            openai.api_version = AZURE_OPENAI_API_VERSION
            prompt = f"""
You are an AI code reviewer. Analyze the following code and provide feedback on style, bugs, and improvements.{ ' Also explain concepts for beginners.' if learning_mode else '' }

Code:
{code}
"""
            client = openai.AzureOpenAI(
                api_key=AZURE_OPENAI_API_KEY,
                api_version=AZURE_OPENAI_API_VERSION,
                azure_endpoint=AZURE_OPENAI_ENDPOINT
            )
            response = client.chat.completions.create(
                model=AZURE_OPENAI_DEPLOYMENT,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=2048,
            )
            ai_feedback = response.choices[0].message.content
            return Response({'feedback': {'ai': ai_feedback}})
        except Exception as e:
            print(f"Azure OpenAI error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(max_length=128)

@api_view(['POST'])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        SignupLog.objects.create(
            name=serializer.validated_data['name'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        return Response({'message': 'Signup successful'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def home(request):
    return HttpResponse("<h1>Welcome to CodeMentor_AI</h1><p>AI Code Review Assistant for Beginners</p>")
