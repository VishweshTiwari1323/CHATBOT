import os
import time
import random
import uuid
import shutil
import urllib.parse
import requests
import zoneinfo
from pathlib import Path
from io import BytesIO
from datetime import datetime, date
import re

from dotenv import load_dotenv
from openai import OpenAI

from django.conf import settings
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db.models import Q

# Safe imports for optional AI/Media libraries
try:
    import google.generativeai as genai
except ImportError:
    genai = None

try:
    from PIL import Image
    import numpy as np
    import imageio
except ImportError:
    Image = None
    np = None
    imageio = None

from .models import ChatMessage, Profile
from .forms import RegistrationForm, ProfileForm

# -----------------------------
# Environment Setup
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / 'APICHAT' / 'API.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    load_dotenv(dotenv_path=env_path, override=True)


# -----------------------------
# Real-Time Weather Integration
# -----------------------------
def get_weather(city_name):
    """Fetches real-time weather details for a given city using OpenWeatherMap."""
    api_key = os.getenv("OPENWEATHER_API_KEY", "9770a02a17080340645567777fdd4840")
    if not api_key:
        return "⚠️ Weather API key is missing."

    encoded_city = urllib.parse.quote(city_name)
    url = f"https://api.openweathermap.org/data/2.5/weather?q={encoded_city}&appid={api_key}&units=metric"

    try:
        response = requests.get(url, timeout=10)
        data = response.json()

        if response.status_code == 200:
            city = data["name"]
            country = data["sys"]["country"]
            temp = round(data["main"]["temp"])
            feels_like = round(data["main"]["feels_like"])
            description = data["weather"][0]["description"].title()
            humidity = data["main"]["humidity"]
            wind_speed = data["wind"]["speed"]

            return (
                f"🌤️ **Weather in {city}, {country}:**\n\n"
                f"* **Condition:** {description}\n"
                f"* **Temperature:** {temp}°C (Feels like {feels_like}°C)\n"
                f"* **Humidity:** {humidity}%\n"
                f"* **Wind Speed:** {wind_speed} m/s"
            )
        elif response.status_code == 401:
            return "⚠️ OpenWeather API key is invalid or still activating."
        elif response.status_code == 404:
            return f"Sorry, I couldn't find weather data for '{city_name}'. Please check the city spelling."
        else:
            return "Unable to fetch weather information right now."

    except Exception as e:
        print(f"❌ Weather Exception: {e}")
        return "An error occurred while connecting to the weather service."


# -----------------------------
# Nemotron / Groq Prompt Enhancer
# -----------------------------
def enhance_prompt_with_nemotron(user_prompt, media_type="image"):
    """Tries OpenRouter first; falls back to Groq if OpenRouter rate limit is hit."""
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")

    system_instruction = (
        f"You are an expert AI {media_type} prompt engineer. "
        f"Expand the user's short prompt into a detailed, high-quality prompt for a {media_type} generation model. "
        f"Return ONLY the expanded prompt string with no extra intro or conversational text."
    )

    # 1. Try OpenRouter
    if openrouter_key:
        try:
            client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=openrouter_key)
            completion = client.chat.completions.create(
                model="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=150
            )
            return completion.choices[0].message.content.strip()
        except Exception:
            pass

    # 2. Fallback to Groq API
    if groq_key:
        try:
            client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=groq_key)
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=150
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"Groq Prompt Enhancement Error: {e}")

    return user_prompt


# -----------------------------
# Home Page
# -----------------------------
def home(request):
    if request.user.is_authenticated:
        return redirect("dashboard")
    return redirect("login")


# -----------------------------
# Register
# -----------------------------
def register(request):
    if request.user.is_authenticated:
        return redirect("dashboard")

    form = RegistrationForm()

    if request.method == "POST":
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Registration Successful. Please Login.")
            return redirect("login")

    return render(request, "register.html", {"form": form})

register_view = register


# -----------------------------
# Login
# -----------------------------
def login_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard")

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f"Welcome {user.username}")
            return redirect("dashboard")

        messages.error(request, "Invalid Username or Password")
        return redirect("login")

    return render(request, "login.html")


# -----------------------------
# Dashboard
# -----------------------------
@login_required(login_url="login")
def dashboard(request):
    user_chats = ChatMessage.objects.filter(user=request.user)
    today = timezone.localdate()

    context = {
        "chat_count": user_chats.count(),
        "response_count": user_chats.count(),
        "saved_count": user_chats.filter(is_saved=True).count(),
        "today_count": user_chats.filter(created_at__date=today).count(),
        "recent_chats": user_chats[:4],
    }

    return render(request, "dashboard.html", context)


# -----------------------------
# Chatbot Page Load
# -----------------------------
@login_required(login_url="login")
def chatbot(request):
    if request.GET.get('new') == 'true':
        latest_chat = ChatMessage.objects.filter(user=request.user).order_by('id').last()
        request.session['cleared_up_to_id'] = latest_chat.id if latest_chat else 0
        
        if 'active_chat_id' in request.session:
            del request.session['active_chat_id']
            
        return redirect('chatbot')

    chat_id = request.GET.get('chat_id')
    if chat_id:
        request.session['active_chat_id'] = chat_id

    active_chat_id = request.session.get('active_chat_id')

    if active_chat_id:
        chat_messages = ChatMessage.objects.filter(
            user=request.user, 
            id__lte=active_chat_id
        ).order_by('created_at')
    else:
        chat_messages = ChatMessage.objects.filter(user=request.user).order_by('created_at')
        
        cleared_up_to_id = request.session.get('cleared_up_to_id')
        if cleared_up_to_id is not None:
            chat_messages = chat_messages.filter(id__gt=cleared_up_to_id)

    return render(request, 'chatbot.html', {'chat_messages': chat_messages})

chatbot_view = chatbot


# -----------------------------
# OpenRouter / Groq Chat API
# -----------------------------
@login_required(login_url='login')
def chat_api_view(request):
    if request.method == "POST":
        user_message = request.POST.get("message", "").strip()
        
        if not user_message:
            return JsonResponse({"error": "Message cannot be empty."}, status=400)

        user_message_lower = user_message.lower()
        weather_keywords = ["weather", "temperature", "climate", "forecast", "rain"]

        if any(kw in user_message_lower for kw in weather_keywords):
            filler_pattern = r'\b(what|is|the|how|tell|me|about|current|live|today|now|right|climate|weather|temperature|forecast|rain|in|of|for|at|like|please|show)\b'
            cleaned_city = re.sub(filler_pattern, ' ', user_message_lower)
            cleaned_city = re.sub(r'[^\w\s]', '', cleaned_city).strip()

            if cleaned_city and len(cleaned_city) >= 2:
                weather_response = get_weather(cleaned_city)
                
                chat_obj = ChatMessage.objects.create(
                    user=request.user,
                    message=user_message,
                    response=weather_response
                )
                return JsonResponse({
                    "id": chat_obj.id,
                    "message": chat_obj.message,
                    "response": chat_obj.response,
                    "created_at": chat_obj.created_at.strftime("%b %d, %Y - %I:%M %p"),
                })

        openrouter_key = os.getenv("OPENROUTER_API_KEY")
        groq_key = os.getenv("GROQ_API_KEY")

        if not openrouter_key and not groq_key:
            return JsonResponse({"error": "No API keys found in environment variables."}, status=500)

        try:
            ist_tz = zoneinfo.ZoneInfo("Asia/Kolkata")
            now_ist = datetime.now(ist_tz)
        except Exception:
            now_ist = timezone.localtime()

        live_datetime_str = now_ist.strftime("%A, %B %d, %Y at %I:%M:%S %p")

        past_chats = ChatMessage.objects.filter(user=request.user).order_by('created_at')
        
        messages_payload = [
            {
                "role": "system", 
                "content": (
                    f"You are a helpful AI assistant. "
                    f"The exact current local time is {live_datetime_str} (IST). "
                    f"Whenever asked for the time or date, state this exact time."
                )
            }
        ]

        for chat in past_chats:
            if chat.message:
                messages_payload.append({"role": "user", "content": chat.message})
            if chat.response:
                messages_payload.append({"role": "assistant", "content": chat.response})

        messages_payload.append({"role": "user", "content": user_message})

        ai_response = None

        if openrouter_key:
            openrouter_models = [
                "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
                "google/gemma-2-9b-it:free",
                "openrouter/free"
            ]
            client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=openrouter_key)
            
            for model_name in openrouter_models:
                try:
                    completion = client.chat.completions.create(
                        model=model_name,
                        messages=messages_payload,
                        max_tokens=1000
                    )
                    ai_response = completion.choices[0].message.content
                    if ai_response:
                        break
                except Exception as err:
                    print(f"⚠️ OpenRouter model {model_name} failed: {err}")
                    continue

        if not ai_response and groq_key:
            print("🔄 Falling back to Groq API...")
            try:
                client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=groq_key)
                completion = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=messages_payload,
                    max_tokens=1000
                )
                ai_response = completion.choices[0].message.content
            except Exception as groq_err:
                print(f"❌ Groq API Error: {groq_err}")

        if not ai_response:
            return JsonResponse({
                "error": "All AI models are currently rate-limited. Please wait a moment and try again."
            }, status=429)

        chat_obj = ChatMessage.objects.create(
            user=request.user,
            message=user_message,
            response=ai_response
        )

        return JsonResponse({
            "id": chat_obj.id,
            "message": chat_obj.message,
            "response": chat_obj.response,
            "created_at": chat_obj.created_at.strftime("%b %d, %Y - %I:%M %p"),
        })

    return JsonResponse({"error": "Invalid request method."}, status=405)


# -----------------------------
# Profile
# -----------------------------
@login_required(login_url="login")
def profile(request):
    profile_obj, created = Profile.objects.get_or_create(user=request.user)
    user_chats = ChatMessage.objects.filter(user=request.user).order_by('-created_at')
    today = timezone.localdate()

    context = {
        "profile": profile_obj,
        "chat_count": user_chats.count(),
        "response_count": user_chats.count(),
        "saved_count": user_chats.filter(is_saved=True).count(),
        "today_count": user_chats.filter(created_at__date=today).count(),
        "recent_chats": user_chats[:5],
    }

    return render(request, "profile.html", context)


# -----------------------------
# Edit Profile
# -----------------------------
@login_required(login_url="login")
def edit_profile(request):
    profile_obj, created = Profile.objects.get_or_create(user=request.user)

    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        email = request.POST.get("email", "").strip()
        first_name = request.POST.get("first_name", "").strip()
        last_name = request.POST.get("last_name", "").strip()
        bio = request.POST.get("bio", "").strip()

        if not username:
            messages.error(request, "Username cannot be empty.")
            return render(request, "edit_profile.html", {"profile": profile_obj})

        if not email:
            messages.error(request, "Email cannot be empty.")
            return render(request, "edit_profile.html", {"profile": profile_obj})

        if username != request.user.username:
            if User.objects.filter(username=username).exclude(id=request.user.id).exists():
                messages.error(request, "Username is already taken. Please choose another.")
                return render(request, "edit_profile.html", {"profile": profile_obj})

        if email != request.user.email:
            if User.objects.filter(email=email).exclude(id=request.user.id).exists():
                messages.error(request, "Email is already in use by another account.")
                return render(request, "edit_profile.html", {"profile": profile_obj})

        request.user.username = username
        request.user.email = email
        request.user.first_name = first_name
        request.user.last_name = last_name
        request.user.save()

        profile_obj.bio = bio
        if "image" in request.FILES:
            profile_obj.image = request.FILES["image"]
        profile_obj.save()

        messages.success(request, "Profile updated successfully.")
        return redirect("profile")

    return render(request, "edit_profile.html", {"profile": profile_obj})


# -----------------------------
# History
# -----------------------------
@login_required(login_url="login")
def history(request):
    search_query = request.GET.get('q', '')
    
    chats = ChatMessage.objects.filter(user=request.user).order_by('-created_at')
    
    if search_query:
        chats = chats.filter(
            Q(message__icontains=search_query) | 
            Q(response__icontains=search_query)
        )
        
    context = {'chats': chats}
    return render(request, 'history.html', context)


# -----------------------------
# Delete a Chat
# -----------------------------
@login_required(login_url="login")
def delete_chat(request, chat_id):
    chat = get_object_or_404(ChatMessage, id=chat_id, user=request.user)
    chat.delete()
    messages.success(request, "Chat deleted successfully.")
    return redirect("history")


# -----------------------------
# Save / Unsave a Chat
# -----------------------------
@login_required(login_url="login")
def toggle_save_chat(request, chat_id):
    chat = get_object_or_404(ChatMessage, id=chat_id, user=request.user)
    chat.is_saved = not chat.is_saved
    chat.save()
    return redirect("history")


# -----------------------------
# Change Password
# -----------------------------
@login_required(login_url="login")
def change_password(request):
    form = PasswordChangeForm(user=request.user)

    if request.method == "POST":
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, form.user)
            messages.success(request, "Password changed successfully.")
            return redirect("profile")
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")

    return render(request, "password_change.html", {"form": form})


# -----------------------------
# Logout
# -----------------------------
@login_required(login_url="login")
def logout_view(request):
    logout(request)
    messages.success(request, "Logged Out Successfully.")
    return redirect("login")


# -----------------------------
# Google Bypass (Mock Login)
# -----------------------------
def google_bypass(request):
    user = User.objects.first()
    
    if user:
        login(request, user)
        messages.success(request, f"Bypassed login! Welcome {user.username}")
        return redirect("dashboard")
    else:
        messages.error(request, "No users exist in the database to bypass with. Please register one first.")
        return redirect("login")


# -----------------------------
# Cloud Image Generator
# -----------------------------
@login_required(login_url="login")
def images_view(request):
    if request.method == "POST":
        raw_prompt = request.POST.get("prompt", "").strip()
        
        if not raw_prompt:
            return JsonResponse({"error": "Prompt cannot be empty."}, status=400)

        try:
            enhanced_prompt = enhance_prompt_with_nemotron(raw_prompt, media_type="image")

            encoded_prompt = urllib.parse.quote(enhanced_prompt)
            cloud_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&model=flux&nologo=true"

            response = requests.get(cloud_url, timeout=30)
            if response.status_code == 200:
                media_dir = Path(settings.MEDIA_ROOT) / 'generated_images'
                media_dir.mkdir(parents=True, exist_ok=True)

                filename = f"{uuid.uuid4()}.png"
                file_path = media_dir / filename

                with open(file_path, "wb") as f:
                    f.write(response.content)

                return JsonResponse({
                    "status": "success",
                    "image_url": f"/media/generated_images/{filename}"
                })
            else:
                return JsonResponse({"error": "Failed to retrieve image from cloud API."}, status=500)

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return render(request, 'images.html')


# -----------------------------
# Cloud Video Generator
# -----------------------------
@login_required(login_url="login")
def videos_view(request):
    if request.method == "POST":
        raw_prompt = request.POST.get("prompt", "").strip()
        if not raw_prompt:
            return JsonResponse({"error": "Prompt cannot be empty."}, status=400)

        if Image is None or np is None or imageio is None:
            return JsonResponse({"error": "Image/Video processing libraries are not installed on this environment."}, status=500)

        try:
            enhanced_prompt = enhance_prompt_with_nemotron(raw_prompt, media_type="video")

            encoded_prompt = urllib.parse.quote(enhanced_prompt)
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
            }

            max_retries = 3
            res = None

            for attempt in range(1, max_retries + 1):
                random_seed = random.randint(1000, 99999)
                cloud_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=768&height=512&model=flux&nologo=true&seed={random_seed}"

                res = requests.get(cloud_url, headers=headers, timeout=45)

                if res.status_code == 200 and len(res.content) > 0:
                    break

                if res.status_code == 429:
                    time.sleep(2)
                else:
                    time.sleep(1)

            if res and res.status_code == 200 and len(res.content) > 0:
                media_dir = Path(settings.MEDIA_ROOT) / 'generated_videos'
                media_dir.mkdir(parents=True, exist_ok=True)

                base_img = Image.open(BytesIO(res.content)).convert("RGB")
                w, h = base_img.size
                w, h = w - (w % 2), h - (h % 2)
                base_img = base_img.resize((w, h), Image.Resampling.LANCZOS)

                frames = []
                for i in range(30):
                    zoom = 1.0 + (i / 30) * 0.12
                    nw, nh = int(w / zoom), int(h / zoom)
                    left, top = (w - nw) // 2, (h - nh) // 2
                    cropped = base_img.crop((left, top, left + nw, top + nh))
                    frames.append(np.array(cropped.resize((w, h), Image.Resampling.LANCZOS)))

                filename = f"{uuid.uuid4()}.mp4"
                file_path = media_dir / filename

                imageio.mimsave(
                    str(file_path),
                    frames,
                    fps=10,
                    codec='libx264',
                    pixelformat='yuv420p'
                )

                return JsonResponse({"status": "success", "video_url": f"/media/generated_videos/{filename}"})

            else:
                status_code = res.status_code if res else "Unknown"
                return JsonResponse({
                    "status": "error", 
                    "message": "Cloud generator is temporarily busy. Please click generate once more."
                }, status=429 if status_code == 429 else 400)

        except requests.exceptions.Timeout:
            return JsonResponse({"status": "error", "message": "Connection timed out. Please try again."}, status=504)

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

    return render(request, 'videos.html')