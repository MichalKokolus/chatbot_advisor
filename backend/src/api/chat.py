"""
Chat API endpoints for psychological advisor.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, Field

from ..utils.session_manager import SessionManager, ConversationSession
from ..utils.llm_handler import PsychologicalAdvisorLLM

router = APIRouter(prefix="/chat", tags=["chat"])

# Global LLM instance (lazy initialization)
llm_handler = None

def get_llm_handler():
    """Get or create LLM handler instance."""
    global llm_handler
    if llm_handler is None:
        llm_handler = PsychologicalAdvisorLLM()
    return llm_handler


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str = Field(..., min_length=1, max_length=1000, description="User message")
    session_id: Optional[str] = Field(None, description="Session ID for conversation continuity")


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    response: str = Field(..., description="Assistant response")
    session_id: str = Field(..., description="Session ID for future requests")


def get_session_manager(request: Request) -> SessionManager:
    """Dependency to get session manager from app state."""
    return request.app.state.session_manager


@router.post("/message", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest,
    session_manager: SessionManager = Depends(get_session_manager)
) -> ChatResponse:
    """
    Send message to psychological advisor and get response.
    
    Maintains conversation context and applies safety guardrails.
    """
    
    try:
        # Get or create session
        session = session_manager.get_or_create_session(chat_request.session_id)
        
        # Add user message to session
        session.add_message("user", chat_request.message)
        
        # Get conversation history for context
        conversation_history = session.get_conversation_history()
        
        # Get LLM response with context
        llm = get_llm_handler()
        assistant_response = await llm.get_response(
            user_message=chat_request.message,
            conversation_history=conversation_history
        )
        
        # Add assistant response to session
        session.add_message("assistant", assistant_response)
        
        # Clean up expired sessions periodically
        session_manager.cleanup_expired_sessions()
        
        return ChatResponse(
            response=assistant_response,
            session_id=session.session_id
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat message: {str(e)}"
        )


@router.get("/session/{session_id}/history")
async def get_conversation_history(
    session_id: str,
    session_manager: SessionManager = Depends(get_session_manager)
):
    """Get conversation history for a session."""
    
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "messages": session.get_conversation_history(),
        "created_at": session.created_at.isoformat()
    }


@router.post("/session/new")
async def create_new_session(
    session_manager: SessionManager = Depends(get_session_manager)
):
    """Create a new conversation session."""
    
    session_id = session_manager.create_session()
    return {"session_id": session_id}


@router.delete("/session/{session_id}")
async def end_session(
    session_id: str,
    session_manager: SessionManager = Depends(get_session_manager)
):
    """End a conversation session."""
    
    if session_id in session_manager.sessions:
        del session_manager.sessions[session_id]
        return {"message": "Session ended successfully"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")
