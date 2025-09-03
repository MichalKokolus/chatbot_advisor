"""
FastAPI app for psychological advisor chatbot with Gemini LLM and NeMo Guardrails.
"""

import os
from contextlib import asynccontextmanager
from typing import Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .api.chat import router as chat_router
from .utils.session_manager import SessionManager

# Load env vars from backend directory
import pathlib
backend_dir = pathlib.Path(__file__).parent.parent
load_dotenv(backend_dir / ".env")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan mgmt for FastAPI app - init/cleanup resources."""
    # Startup: init session manager
    app.state.session_manager = SessionManager()
    
    yield
    
    # Shutdown: cleanup if needed
    pass


# Create FastAPI app with lifespan mgmt
app = FastAPI(
    title="Psychological Advisor API",
    description="AI-powered psychological advisor with safety guardrails",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Psychological Advisor API is running", "status": "healthy"}


@app.get("/health")
async def health_check():
    """Detailed health check for monitoring."""
    return {
        "status": "healthy",
        "service": "psychological-advisor-api",
        "version": "0.1.0"
    }
