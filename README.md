# 🚀 PreNova AI — AI Interview Preparation System

> **Prepare Smarter. Interview Stronger. Get Hired Faster.**

PreNova AI is an end-to-end, full-stack placement preparation platform powered by AI. It integrates resume building, ATS resume analysis, interactive Data Structures & Algorithms (DSA) practice, company-specific interview preparation, real-time AI mock interviews, detailed performance analytics, payments, and placement-readiness tracking into a unified web application.

---

## 🎯 Core Workflow

```
Resume Building ➔ ATS Analysis ➔ Skill Gap Analysis ➔ DSA Coding Practice
      ➔ Company Preparation ➔ AI Mock Interview ➔ Performance Feedback ➔ Placement Readiness
```

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Email & Password Authentication**: Full registration and secure password hashing using Bcrypt.
- **OTP Verification**: Email-based 6-digit OTP verification for account activation and password resets.
- **JWT Token Management**: Short-lived Access Tokens (JSON Web Tokens) & Refresh Tokens for session persistence.
- **Google OAuth 2.0 Integration**: One-click social authentication flow.
- **Role-Based Access Control (RBAC)**: Route guards and administrative management capabilities (`user` vs `admin`).

### 📄 AI Resume Builder
- **Step-by-Step Builder**: Experience, Education, Technical Skills, Projects, and Certifications.
- **Role-Specific Templates**: Tailored for Software Engineering, Frontend, Backend, Full-Stack, and Data Science roles.
- **Live Preview & Export**: Real-time side-by-side rendering with instant PDF and DOCX export options.
- **AI Enhancement Engine**: AI-powered bullet-point generator, resume polishing/rewrite tool, and ATS compatibility analyzer.

### 📊 ATS Resume Analyzer
- **Multi-Format Upload**: Supports PDF, DOCX, TXT, and JSON resume files.
- **7-Category ATS Scoring**: Evaluates Impact, Brevity, Style, Skills, Format, Keywords, and Structure.
- **Keyword & Skill Gap Analysis**: Highlights missing industry keywords for targeted technical roles.
- **Actionable AI Suggestions**: Specific, actionable recommendations for resume optimization.

### 💻 DSA & Coding Practice
- **126+ Interactive Coding Problems**: Easy, Medium, and 20 Hard LeetCode Blind 75 questions (Sliding Window Maximum, Merge k Sorted Lists, Trapping Rain Water, N-Queens, Sudoku Solver, Alien Dictionary, etc.).
- **Multi-Language Code Execution**: Code editor supporting JavaScript, Python, C, C++, and Java.
- **Comprehensive Solution Guides**: Intuition breakdown, time/space complexity analysis, and multi-language implementations.
- **883+ Total DSA Question Bank**: Includes 19 downloadable company-specific DSA preparation guides.

### 🏢 Company-Specific Preparation
- **Top Tech Companies**: Preparation modules for Google, Amazon, Microsoft, Meta, Apple, TCS, Infosys, Wipro, Accenture, and more.
- **Round-by-Round Breakdown**: Online Assessments, Technical Round 1/2, System Design, and Behavioral HR rounds.
- **Interactive Practice Guides**: Downloadable & viewable preparation sheets.

### 🎙️ Real-Time AI Mock Interviews
- **Interactive AI Recruiter**: Dynamic question generation tailored to candidate's target role, experience level, and resume.
- **Audio & Speech Analysis**: Voice recording, speech-to-text transcription, and real-time response evaluation.
- **Comprehensive Feedback Report**: Detailed scoring on Technical Depth, Problem Solving, Communication, Confidence, and Answer Structure.

### 💳 Payments & Subscriptions
- **Multiple Gateways**: Integrated with Razorpay, Stripe, and Instant UPI QR Code payments.
- **Subscription Tiers**: Free Starter, Pro Plan, and Lifetime Access.
- **Invoice & Upgrade Management**: Automated invoice generation and pro-rated plan upgrades.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, Vite, Vanilla CSS Design System, Framer Motion, Monaco Code Editor |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic v2 |
| **Database & Cache** | MongoDB (Motor async driver), Redis |
| **AI / Machine Learning** | Google Gemini 1.5 Pro / Flash, Groq AI, Hugging Face Transformers |
| **Auth & Email** | PyJWT, Passlib (Bcrypt), SMTP (aiosmtplib), Google OAuth 2.0 |
| **Payments** | Razorpay SDK, Stripe API |

---

## 📂 Project Structure

```
AI Interview Preparation System/
├── Backend/
│   ├── app/
│   │   ├── api/          # FastAPI route handlers
│   │   ├── core/         # Security, JWT, DB & App Config
│   │   ├── models/       # Pydantic & Mongo models
│   │   ├── services/     # AI, Email, ATS & Payment services
│   │   ├── tests/        # Pytest unit & integration test suite (65/65 passing)
│   │   └── main.py       # FastAPI application entry point
│   ├── requirements.txt  # Backend dependencies
│   └── run.py            # Uvicorn server launcher
│
├── Frontend/
│   └── basic-ai-app/
│       ├── src/
│       │   ├── components/  # Reusable UI components & DSA modules
│       │   ├── pages/       # Core app pages (DashboardPage, Profile, etc.)
│       │   ├── context/     # Auth & Theme context providers
│       │   └── App.jsx      # React router & main routes
│       └── package.json
│
├── run_project.ps1          # Automatic double-server startup script
└── README.md
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the `Backend/` directory with the following variables:

```env
# Server Config
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development

# Database & Cache
MONGODB_URI=mongodb://localhost:27017/prenova_db
REDIS_URL=redis://localhost:6379/0

# JWT Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Providers
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Email SMTP Setup
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Payment Gateways
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+
- MongoDB instance (local or MongoDB Atlas)

### 1. Automatic Startup (Windows PowerShell)
```powershell
./run_project.ps1
```

### 2. Manual Startup

#### Backend Setup
```bash
cd Backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
> Interactive API Swagger Documentation is available at: **`http://localhost:8000/docs`**

#### Frontend Setup
```bash
cd Frontend/basic-ai-app
npm install
npm run dev
```
> Web Application runs at: **`http://localhost:5173`**

---

## 🧪 Automated Testing

To run the complete backend integration and unit test suite:

```bash
cd Backend
pytest app/tests
```

> **65/65 tests passing (100% test suite success rate across Auth, Resumes, ATS, Coding, AI Mock, Payments, and Admin modules).**

---

## 👨‍💻 Author & Project Vision

Developed by **Ritesh Panda** as an all-in-one AI placement acceleration & career preparation system.

---

## 📜 License

This project is licensed under the MIT License — see the `LICENSE` file for details.
