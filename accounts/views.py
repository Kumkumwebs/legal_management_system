from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema

from .serializers import (
    RegisterSerializer,
    AddUserToFirmSerializer,
    InviteFirmUserSerializer,
    InvitePlatformUserSerializer,
    AcceptInviteSerializer,
)

from adminpanel.permissions import IsSuperAdmin


# ─────────────────────────────────────────────
# 🔐 REGISTER USER + FIRM
# ─────────────────────────────────────────────
class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={200: {"message": "User & Firm created successfully"}}
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User & Firm created successfully"})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# 🔑 LOGIN (FIXED WITH ROLE + FIRM)
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username and password required"}, status=400)

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({"error": "Invalid credentials"}, status=401)

    refresh = RefreshToken.for_user(user)

    # 🔥 GET ROLE + FIRM
    role = None
    firm = None
    if user.is_superuser:
        role = "super_admin"
        firm = None

    if hasattr(user, 'userprofile'):
        role = user.userprofile.role
        firm = user.userprofile.firm.id if user.userprofile.firm else None

    elif hasattr(user, 'platformuser'):
        role = user.platformuser.role

    return Response({
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": role,
            "firm": firm
        }
    })


# ─────────────────────────────────────────────
# 👥 ADD USER DIRECTLY TO FIRM
# ─────────────────────────────────────────────
class AddUserToFirmView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddUserToFirmSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User added to firm"})

        return Response(serializer.errors, status=400)


# ─────────────────────────────────────────────
# 📩 INVITE USER TO FIRM
# ─────────────────────────────────────────────
class InviteFirmUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = InviteFirmUserSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Invite sent"})

        return Response(serializer.errors, status=400)


# ─────────────────────────────────────────────
# 🏢 INVITE PLATFORM USER (SUPER ADMIN ONLY)
# ─────────────────────────────────────────────
class InvitePlatformUserView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = InvitePlatformUserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Platform invite sent"})

        return Response(serializer.errors, status=400)


# ─────────────────────────────────────────────
# ✅ ACCEPT INVITE (PUBLIC)
# ─────────────────────────────────────────────
class AcceptInviteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AcceptInviteSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Account created"})

        return Response(serializer.errors, status=400)


# ─────────────────────────────────────────────
# 🔍 CHECK SUPER ADMIN
# ─────────────────────────────────────────────
def is_super_admin(user):
    return user.is_superuser or (
        hasattr(user, 'platformuser') and user.platformuser.role == 'super_admin'
    )


# ─────────────────────────────────────────────
# 👤 USER LIST (ROLE BASED)
# ─────────────────────────────────────────────
class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = []

        # 🔥 SUPER ADMIN → ALL USERS
        if is_super_admin(user):
            users = User.objects.all()

        # 🔐 FIRM USER → ONLY THEIR FIRM
        elif hasattr(user, 'userprofile'):
            users = User.objects.filter(
                userprofile__firm=user.userprofile.firm
            )

        else:
            return Response([])

        for u in users:
            profile = getattr(u, 'userprofile', None)
            platform = getattr(u, 'platformuser', None)

            data.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": (
                    profile.role if profile else
                    platform.role if platform else
                    "unknown"
                ),
                "firm": profile.firm.name if profile else None,
                "joined": u.date_joined
            })

        return Response(data)