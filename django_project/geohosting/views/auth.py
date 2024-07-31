import threading

from django.contrib.auth.hashers import make_password
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework import status

from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth import get_user_model

from geohosting.models import UserProfile
from geohosting.serializer.email_auth_token import EmailAuthTokenSerializer
from geohosting.serializer.register import RegisterSerializer


User = get_user_model()


class CustomAuthToken(ObtainAuthToken):
    serializer_class = EmailAuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request})
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
                password=make_password(
                    serializer.validated_data['password']
                )
            )
            token, created = Token.objects.get_or_create(
                user=user)
            user_profile, _ = UserProfile.objects.get_or_create(
                user=user
            )
            threading.Thread(target=user_profile.post_to_erpnext).start()
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ValidateTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {'detail': 'Token is valid.'},
            status=status.HTTP_200_OK)
