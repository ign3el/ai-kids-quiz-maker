from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import quiz
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Kids Quiz Maker API")

# Configure CORS so the React frontend can communicate with the backend during local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}
