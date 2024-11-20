import threading

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils.crypto import get_random_string
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models.preferences import Preferences
from core.settings.base import FRONTEND_URL, DEFAULT_FROM_EMAIL
from geohosting.models import UserProfile
from geohosting.serializer.email_auth_token import EmailAuthTokenSerializer
from geohosting.serializer.register import RegisterSerializer

User = get_user_model()


class CustomAuthToken(ObtainAuthToken):
    serializer_class = EmailAuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })


@api_view(['POST'])
def logout(request):
    try:
        request.user.auth_token.delete()
    except Exception as e:  # noqa
        pass
    return Response(status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.create(
                username=serializer.validated_data['email'],
                email=serializer.validated_data['email'],
                first_name=serializer.validated_data['first_name'],
                last_name=serializer.validated_data['last_name'],
                password=make_password(serializer.validated_data['password'])
            )
            token, created = Token.objects.get_or_create(user=user)
            user_profile, _ = UserProfile.objects.get_or_create(user=user)
            threading.Thread(target=user_profile.post_to_erpnext).start()
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ValidateTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'detail': 'Token is valid.'},
                        status=status.HTTP_200_OK)


class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        pref = Preferences.load()
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Email is not registered.'},
                status=status.HTTP_404_NOT_FOUND)

        reset_token = get_random_string(32)
        user_profile = UserProfile.objects.get(user=user)
        user_profile.reset_token = reset_token
        user_profile.save()

        reset_link = f"{FRONTEND_URL}/#/reset-password?token={reset_token}"
        reset_link = reset_link.replace('#/#', '#')
        html_content = render_to_string(
            template_name='emails/GeoHosting_Reset Password.html',
            context={
                'url': reset_link,
                'support_email': pref.support_email,
            }
        )

        # Create the email message
        email = EmailMessage(
            subject='Password Reset Request',
            body=html_content,
            from_email=DEFAULT_FROM_EMAIL,
            to=[email]
        )
        email.content_subtype = 'html'
        email.send()

        return Response(
            {'message': 'Password reset link sent.'},
            status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        if not token or not new_password:
            return Response(
                {'error': 'Token and new password are required.'},
                status=status.HTTP_400_BAD_REQUEST)

        try:
            user_profile = UserProfile.objects.get(reset_token=token)
            user = user_profile.user
            user.password = make_password(new_password)
            user.save()
            user_profile.reset_token = ''
            user_profile.save()
            return Response(
                {'message': 'Password has been reset.'},
                status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Invalid token.'},
                status=status.HTTP_400_BAD_REQUEST)
