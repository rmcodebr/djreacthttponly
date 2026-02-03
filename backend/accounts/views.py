from django.shortcuts import render
from rest_framework.views import APIView, Response, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import (UserLoginSerializer, UserRegisterSerializer,
                          UserSerializer)
from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes

access_lifetime = settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()
refresh_lifetime = settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(
)
from rest_framework.generics import RetrieveUpdateAPIView


class UserAPIView(APIView):
  permission_classes = [IsAuthenticated]  # ✅ Corrigido

  def get(self, request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)


class UserRegisterAPIView(APIView):
  permission_classes = [AllowAny]
  authentication_classes = []

  @extend_schema(request=UserRegisterSerializer,
                 responses={201: UserRegisterSerializer})
  def post(self, request):
    serializer = UserRegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserLoginAPIVIew(APIView):
  permission_classes = [AllowAny]

  @extend_schema(request=UserLoginSerializer,
                 responses={201: UserLoginSerializer})
  def post(self, request):
    serializer = UserLoginSerializer(data=request.data)

    if serializer.is_valid():
      user = serializer.validated_data
      print(user)
      refresh = RefreshToken.for_user(user)
      access_token = str(refresh.access_token)

      response = Response({"user": UserSerializer(user).data},
                          status=status.HTTP_200_OK)
      response.set_cookie(
          "access_token",
          access_token,
          httponly=True,
          secure=not settings.DEBUG,
          samesite="Lax",
          max_age=int(access_lifetime),
      )

      response.set_cookie(
          "refresh_token",
          str(refresh),
          httponly=True,
          secure=not settings.DEBUG,
          samesite="Lax",
          max_age=int(refresh_lifetime),
      )

      return response
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutAPIView(APIView):
  permission_classes = [IsAuthenticated]

  def post(self, request):
    refresh_token = request.COOKIES.get("refresh_token")

    if refresh_token:
      try:
        refresh = RefreshToken(refresh_token)
        refresh.blacklist()
      except Exception as e:
        return Response({"Error": "Error invalidationg token: " + str(e)},
                        status=status.HTTP_400_BAD_REQUEST)

    response = Response({"message": "Successfully logged out"},
                        status=status.HTTP_200_OK)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response


class CookieTokenRefreshAPIView(APIView):

  def post(self, request):

    refresh_token = request.COOKIES.get('refresh_token')

    if not refresh_token:
      return Response({'error': 'Refresh token not provided'},
                      status=status.HTTP_401_UNAUTHORIZED)
    try:
      refresh = RefreshToken(refresh_token)
      access_token = str(refresh.access_token)

      response = Response({"message": "Access token refreshed succesfully"},
                          status=status.HTTP_200_OK)

      response.set_cookie(
          "access_token",
          access_token,
          httponly=True,
          secure=not settings.DEBUG,
          samesite="Lax",
          max_age=int(access_lifetime),
      )
      return response
    except InvalidToken:
      return Response({"error": "Invalid token"},
                      status=status.HTTP_401_UNAUTHORIZED)
