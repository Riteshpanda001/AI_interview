🚀 PreNova AI --- AI Interview Preparation System

Prepare Smarter. Interview Stronger. Get Hired Faster.

PreNova AI is a full-stack AI-powered placement preparation platform
designed to bring resume building, ATS analysis, DSA practice,
company-specific interview preparation, AI mock interviews, interview
feedback, payments, and career-readiness tracking into one application.

🎯 Core Workflow

Resume → ATS Analysis → Skill Gaps → DSA Practice
      → Company Preparation → AI Mock Interview
      → AI Feedback → Career Readiness

✨ Features

🔐 Authentication & User Management

Email/password registration

OTP verification

JWT access and refresh tokens

Forgot-password OTP flow

Google OAuth

Protected routes

Profile and password management

Session refresh and login tracking

📄 AI Resume Builder

Section-by-section resume builder

Education, experience, skills and projects

Role-specific templates

Live resume preview

AI content generation

AI rewrite/polish

AI resume assistant

Job matching

Before/after comparison

PDF and DOCX export

Public shareable resume links

ATS score integration

📊 ATS Resume Analyzer

PDF/DOCX/TXT/JSON resume upload

ATS score

Keyword analysis

Missing-skill detection

Seven-category score breakdown

AI suggestions

Resume preview

Role-based interview questions

💻 DSA & Coding Practice

DSA problem practice

Status tracking

Code editor

JavaScript, Python, C, C++, and Java support

Local test execution

AI coding assistance for hints, debugging, explanations and
optimization

Production note: untrusted user code must be executed in a secure
sandbox such as disposable Docker containers or a dedicated judge
service.

🏢 Company Preparation

Company-specific questions

Interview rounds

Hiring-process information

Preparation roadmaps

Company management through Admin

Company DSA preparation material

🎙️ AI Mock Interview

Real-time interview workflow

Audio recording

Questions and submissions

Transcription flow

AI performance analysis

Interview scorecards

PDF interview reports

Production deployment should use reliable speech-to-text/text-to-speech
services and valid AI provider credentials.

🧠 AI Interview Feedback

Evaluates areas such as: - Technical skills - Communication -
Confidence - Problem solving - Answer structure - Overall interview
performance

📈 Career Readiness Dashboard

Tracks preparation metrics such as: - ATS score - Interview score -
Resume completion - Coding performance - Company preparation - AI
recommendations

💳 Payments & Subscriptions

Razorpay

Stripe

UPI QR

Order creation and verification

Webhooks

Subscription enforcement

Invoice generation

Pro-rated upgrades

Live credentials and production webhook configuration are required.

👑 Admin Dashboard

User management

Role changes

Ban/unban

Resume management

Interview management

Coding management

Payment management

Support tickets

System health

Coding problem CRUD

Admin access must be role-protected before production.

📬 Contact & Support

Contact form validation

Backend ticket storage

Admin email notification

⚙️ Settings

Theme preferences

Email notification settings

AI voice preference

Target role and experience

Profile settings

🏗️ Architecture

                    PRENOVA AI
                        │
          ┌─────────────┴─────────────┐
          │                           │
       React/Vite                  FastAPI
          │                           │
          └──────── REST/WebSocket ───┘
                        │
              ┌─────────┴─────────┐
              │                   │
           MongoDB              Redis
              │
              ▼
       AI / External Services
       Gemini / Groq / Hugging Face
       SMTP / Google OAuth
       Razorpay / Stripe

🛠️ Technology Stack

Frontend

React 19

Vite

JavaScript

Framer Motion

Monaco Editor

Backend

Python

FastAPI

Uvicorn

Pydantic

MongoDB integration

Redis

WebSockets

AI

Google Gemini

Groq

Hugging Face

NLP/resume analysis

AI interview analysis

Authentication

JWT

Refresh tokens

OTP

Google OAuth

SMTP

Payments

Razorpay

Stripe

UPI QR

📂 Project Structure

AI Interview Preparation System/
│
├── Backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── main.py
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── run.py
│
├── Frontend/
│   └── basic-ai-app/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── context/
│       │   └── App.jsx
│       └── package.json
│
├── DSA/
├── run_project.ps1
└── README.md

⚙️ Environment Variables

Use the exact variable names required by the current project
configuration. Typical categories include:

MONGODB_URI=
REDIS_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GEMINI_API_KEY=
GROQ_API_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

Never commit real secrets to GitHub. Keep .env files out of
version control and provide .env.example instead.

🚀 Quick Start

Automatic launcher

.un_project.ps1

Backend

cd Backend
python -m venv venv
venv\Scriptsctivate
pip install -r requirements.txt
python run.py

Backend Swagger:

http://localhost:8000/docs

Frontend

cd Frontendasic-ai-app
npm install
npm run dev

🧪 Testing

Run the project's configured test suite. For a pytest-based backend:

pytest

Recommended coverage includes authentication, OTP, Google OAuth,
resumes, ATS, coding, AI interviews, payments, admin permissions, and
contact tickets.

🎨 PreNova AI Design System

Background       #0B0B0F
Brand            #26215C
AI / Violet      #7F77DD
Action / Coral   #E85D30
Achievement      #EF9F27
Success          #22C55E
Error            #EF4444
Information      #38BDF8
Surface          #13131A
Elevated         #1A1A24
Border           #292936
Text             #F8F8FA
Secondary Text   #A7A7B5
Muted Text       #707080

Color meaning:

Deep Purple → Brand
Violet      → AI
Coral       → Important actions
Amber       → Achievements / XP / streaks
Green       → Success
Red         → Errors
Cyan        → Live / information
Dark        → Application environment

🔒 Production Checklist

Before production deployment:

Configure production MongoDB and Redis

Set strong JWT secrets

Configure SMTP/email delivery

Configure Google OAuth redirect URLs

Configure AI provider credentials

Use production STT/TTS

Sandbox user-submitted code

Configure Razorpay/Stripe live keys

Register payment webhooks

Replace simulated UPI verification

Protect Admin routes with role checks

Move resume files to cloud storage

Configure HTTPS/SSL

Configure production CORS

Add rate limiting

Add monitoring and logging

Seed company and coding data

Remove hardcoded fallback metrics

🚧 Known Gaps

The project audits identify several remaining production tasks:

Database seeding for coding problems and company data

Secure sandboxed code execution

Production AI/STT/TTS configuration

Payment credentials and frontend checkout completion

Admin role protection

Live dashboard analytics and history

Cloud storage for production resume exports

Additional testing and production hardening

🤝 Contributing

git checkout -b feature/your-feature
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature

Then open a Pull Request.

📜 License

Add the project's intended license in a LICENSE file. Do not claim a
specific license until the corresponding license file has been added.

👨‍💻 Project Vision

PreNova AI aims to become a complete AI-powered placement preparation
platform:

Resume
  ↓
ATS
  ↓
DSA
  ↓
Company Preparation
  ↓
AI Mock Interview
  ↓
AI Feedback
  ↓
Career Readiness
  ↓
Placement

⭐ PreNova AI --- Prepare Smarter. Interview Stronger. Get Hired
Faster.
