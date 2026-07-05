# AI Interview Preparation System - Backend

This is the backend API for the AI Interview Preparation System, built using **FastAPI**, **MongoDB (Motor)**, and **Redis**.

## Core Features
- **Authentication**: JWT-based secure sign-in, sign-up, user profiles, and OTP validation.
- **AI Resume Analysis**: ATS score evaluation, skill gap parsing, and improvement suggestions.
- **AI Mock Interviews**: Real-time evaluation of HR, Technical, and Behavioral questions, including Speech feedback.
- **AI Coding Practice**: Automated syntax validation, logic verification, and optimization helper.
- **Dashboard & History**: Tracks previous interviews, reports, metrics, and configurations.

## Directory Structure
- `app/main.py`: Main router entrypoint and middleware integration.
- `app/config.py`: Environment-driven settings.
- `app/api/`: Endpoint definitions for user management, resume evaluation, ATS grading, interviews, etc.
- `app/models/`: Database model frameworks.
- `app/schemas/`: Pydantic model classes for requests/responses validation.
- `app/services/`: High-level service modules (Auth, AI, Pricing, Resume Parser).
- `app/ai/`: Core AI wrappers (LLM prompts, evaluation engines).
- `app/utils/`: Parsers (PDF, Resume), timers, and scoring helpers.

## Running Locally

### Prerequisites
- Python 3.10+
- MongoDB
- Redis

### Setup and Start
1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set your environment variables in `.env` (copy of `.env.example`).
4. Start the development server:
   ```bash
   python run.py
   ```
5. View API documentation (Swagger) at `http://localhost:8000/docs`.

### Running with Docker
```bash
docker-compose up --build
```
