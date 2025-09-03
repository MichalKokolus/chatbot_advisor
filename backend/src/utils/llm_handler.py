"""
LLM handler for Gemini integration with direct Google Generative AI and guardrails.
"""

import os
from typing import List, Dict, Optional
import google.generativeai as genai
from nemoguardrails import LLMRails

from .guardrails_config import create_rails_instance


class PsychologicalAdvisorLLM:
    """LLM handler for psychological advisor with safety guardrails."""
    
    def __init__(self):
        # Init Gemini LLM directly
        api_key = os.getenv("API_KEY")
        if not api_key:
            # Debug info
            print(f"Current working directory: {os.getcwd()}")
            print(f"Environment variables containing 'API': {[k for k in os.environ.keys() if 'API' in k]}")
            raise ValueError("API_KEY env var not found for Gemini")
            
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Init guardrails (commented out for now due to complexity)
        # self.rails = create_rails_instance()
        
        self.system_prompt = """You are a compassionate and professional psychological advisor assistant. Your role is to:

1. Provide emotional support and guidance
2. Ask thoughtful questions to help users explore their feelings and thoughts
3. Suggest healthy coping strategies and techniques
4. Be empathetic, non-judgmental, and supportive
5. Encourage self-reflection and personal growth
6. Always maintain professional boundaries

IMPORTANT SAFETY RULES:
- Never diagnose mental health conditions or provide medical advice
- Always encourage users to seek professional help for serious mental health concerns
- Never suggest or discuss self-harm, suicide, or harmful activities
- If a user expresses suicidal thoughts, immediately encourage them to contact emergency services or a crisis hotline
- Stay focused on psychological support - do not discuss unrelated topics
- Be encouraging and help users find hope and positive perspectives

Remember: You are here to listen, support, and guide - not to replace professional mental health treatment."""
    
    async def get_response(
        self, 
        user_message: str, 
        conversation_history: List[Dict[str, str]] = None
    ) -> str:
        """Get LLM response with guardrails and conversation context."""
        
        try:
            # Build conversation context
            full_prompt = self.system_prompt + "\n\n"
            
            # Add conversation history if available
            if conversation_history:
                for msg in conversation_history[-10:]:  # Last 10 messages for context
                    role = "Human" if msg["role"] == "user" else "Assistant"
                    full_prompt += f"{role}: {msg['content']}\n"
            
            # Add current user message
            full_prompt += f"Human: {user_message}\nAssistant:"
            
            # Get response from Gemini
            response = await self.model.generate_content_async(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=1000,
                )
            )
            
            # Apply guardrails (simplified safety check)
            response_text = response.text
            response_text = self._apply_safety_filter(response_text)
            
            return response_text
            
        except Exception as e:
            print(f"LLM Error: {e}")  # For debugging
            # Fallback response for errors
            return ("I apologize, but I'm having trouble processing your message right now. "
                   "How are you feeling at the moment? I'm here to listen and support you.")
    
    def _apply_safety_filter(self, response: str) -> str:
        """Apply basic safety filtering (simplified version)."""
        
        # List of concerning keywords that should trigger safety response
        concerning_keywords = [
            "kill yourself", "suicide", "self-harm", "end it all", 
            "not worth living", "hurt yourself", "overdose"
        ]
        
        response_lower = response.lower()
        
        # Check if response contains concerning content
        for keyword in concerning_keywords:
            if keyword in response_lower:
                return ("I notice you might be going through a really difficult time. "
                       "Your life has value and there are people who want to help. "
                       "Please consider reaching out to a mental health professional "
                       "or a crisis helpline. In the US, you can call 988 for the "
                       "Suicide & Crisis Lifeline. How can we focus on finding some "
                       "support and coping strategies for you right now?")
        
        # Ensure response stays focused on psychological support
        if not self._is_psychology_focused(response):
            return ("I'm here to provide psychological support and guidance. "
                   "Let's focus on how you're feeling and what's on your mind. "
                   "What would you like to talk about regarding your emotional wellbeing?")
        
        return response
    
    def _is_psychology_focused(self, response: str) -> bool:
        """Check if response is focused on psychological topics."""
        psychology_keywords = [
            "feel", "emotion", "stress", "anxiety", "support", "coping", 
            "mental health", "wellbeing", "thoughts", "mood", "therapy",
            "counseling", "mindfulness", "self-care", "relationship"
        ]
        
        response_lower = response.lower()
        return any(keyword in response_lower for keyword in psychology_keywords)
