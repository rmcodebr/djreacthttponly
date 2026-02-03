from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate


class UserSerializer(serializers.ModelSerializer):

  class Meta:
    model = User
    fields = ['id', 'email']


class UserRegisterSerializer(serializers.ModelSerializer):
  password = serializers.CharField(write_only=True)
  password2 = serializers.CharField(write_only=True)

  class Meta:
    model = User
    fields = ['email', 'password', 'password2']

  def validate(self, attrs):
    if attrs['password'] != attrs['password2']:
      raise serializers.ValidationError('Password do not match')

    # password = attrs.get('password', '')
    # if len(password) < 8:
    #   raise serializers.ValidationError(
    #       'Password deve ter no mínimo 6 digitos')

    return attrs

  def create(self, validate_data):
    password = validate_data.pop('password')
    password2 = validate_data.pop('password2')

    user = User.objects.create_user(password=password, **validate_data)

    return user


class UserLoginSerializer(serializers.ModelSerializer):
  email = serializers.EmailField()
  password = serializers.CharField(write_only=True)

  class Meta:
    model = User
    fields = ['email', 'password']

  def validate(self, data):
    user = authenticate(**data)
    if user and user.is_active:
      return user
    raise serializers.ValidationError('Incorrect credentials')
