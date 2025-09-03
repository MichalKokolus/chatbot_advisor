"""
Session manager for maintaining conversation memory without database.
"""

import uuid
from typing import Dict, List, Optional
from datetime import datetime, timedelta


class ConversationSession:
    """Single conversation session with memory."""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        self.messages: List[Dict[str, str]] = []
        self.user_context: Dict[str, str] = {}
        
    def add_message(self, role: str, content: str):
        """Add msg to conversation history."""
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        self.last_activity = datetime.now()
    
    def get_conversation_history(self) -> List[Dict[str, str]]:
        """Get full conversation history for LLM context."""
        return self.messages
    
    def update_context(self, key: str, value: str):
        """Update user context info (e.g., name, problem type)."""
        self.user_context[key] = value
    
    def is_expired(self, max_age_hours: int = 24) -> bool:
        """Check if session is expired."""
        return datetime.now() - self.last_activity > timedelta(hours=max_age_hours)


class SessionManager:
    """Manages multiple conversation sessions in memory."""
    
    def __init__(self):
        self.sessions: Dict[str, ConversationSession] = {}
    
    def create_session(self) -> str:
        """Create new conversation session and return session ID."""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = ConversationSession(session_id)
        return session_id
    
    def get_session(self, session_id: str) -> Optional[ConversationSession]:
        """Get existing session by ID."""
        return self.sessions.get(session_id)
    
    def get_or_create_session(self, session_id: Optional[str] = None) -> ConversationSession:
        """Get existing session or create new one."""
        if session_id and session_id in self.sessions:
            session = self.sessions[session_id]
            if not session.is_expired():
                return session
            else:
                # Remove expired session
                del self.sessions[session_id]
        
        # Create new session
        new_session_id = self.create_session()
        return self.sessions[new_session_id]
    
    def cleanup_expired_sessions(self):
        """Remove expired sessions to prevent memory leaks."""
        expired_sessions = [
            sid for sid, session in self.sessions.items() 
            if session.is_expired()
        ]
        for sid in expired_sessions:
            del self.sessions[sid]
