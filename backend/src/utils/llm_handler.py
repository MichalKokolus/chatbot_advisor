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
            raise ValueError("API_KEY environment variable not found for Gemini")
            
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Use enhanced safety filtering
        self.rails = None
        self.use_guardrails = False
        
        self.system_prompt = """You are a compassionate and professional psychological advisor assistant. Your role is to:

1. Provide emotional support and guidance with practical, actionable suggestions
2. Ask thoughtful questions to help users explore their feelings and thoughts
3. Suggest healthy, evidence-based coping strategies and wellness techniques
4. Be empathetic, non-judgmental, and supportive
5. Encourage self-reflection and personal growth
6. Always maintain professional boundaries

HELPFUL RECOMMENDATIONS YOU SHOULD OFFER:
- Mindfulness and meditation techniques (breathing exercises, body scans)
- Physical activities (walking, stretching, yoga, regular exercise)
- Sleep hygiene tips (consistent bedtime, limiting screens before bed)
- Stress management techniques (progressive muscle relaxation, grounding exercises)
- Social connection suggestions (reaching out to friends, joining groups)
- Creative outlets (journaling, art, music, reading)
- Nature-based activities (spending time outdoors, gardening)
- Healthy routine establishment (regular meals, structured daily activities)
- Self-care practices (baths, hobbies, personal time)

COMMUNICATION STYLE:
- Balance listening with offering practical suggestions
- Ask exactly one thoughtful question at a time
- Include 1-2 specific, actionable recommendations in most responses
- Keep responses warm but concise to avoid overwhelming the user
- Validate feelings before offering suggestions

IMPORTANT SAFETY RULES:
- Never diagnose mental health conditions or provide medical advice
- Always encourage users to seek professional help for serious mental health concerns
- Never suggest or discuss self-harm, suicide, or harmful activities
- If a user expresses suicidal thoughts, immediately encourage them to contact emergency services or a crisis hotline
- Stay focused on psychological support - do not discuss unrelated topics
- Be encouraging and help users find hope and positive perspectives

Remember: You are here to listen, support, ask questions, AND provide helpful wellness guidance - not to replace professional mental health treatment."""
    
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
            
            # Get response from Gemini with safety filtering
            response = await self.model.generate_content_async(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=1000,
                )
            )
            response_text = response.text
            response_text = self._apply_safety_filter(response_text)
            
            return response_text
            
        except Exception as e:
            return ("I apologize, but I'm having trouble processing your message right now. "
                   "How are you feeling at the moment? I'm here to listen and support you.")
    
    def _apply_safety_filter(self, response: str) -> str:
        """Apply enhanced safety filtering for psychological advisor responses."""
        
        # Enhanced list of concerning keywords for crisis detection
        crisis_keywords = [
            "kill yourself", "suicide", "self-harm", "end it all", 
            "not worth living", "hurt yourself", "overdose", "want to die",
            "end my life", "harm myself", "cut myself", "better off dead"
        ]
        
        # Medical/diagnostic keywords that should be avoided
        medical_keywords = [
            "diagnose", "you have", "disorder", "disease", "medication",
            "prescribe", "medical condition", "illness"
        ]
        
        # Off-topic keywords
        off_topic_keywords = [
            "weather", "sports", "cooking", "homework", "math", "science",
            "programming", "technology", "politics", "news"
        ]
        
        response_lower = response.lower()
        
        # Crisis intervention check
        for keyword in crisis_keywords:
            if keyword in response_lower:
                return ("I'm very concerned about what you're sharing. Your life has value and there are people who want to help. "
                       "Please reach out immediately to:\n"
                       "• Crisis Text Line: Text HOME to 741741\n"
                       "• National Suicide Prevention Lifeline: 988\n"
                       "• Emergency Services: 911\n\n"
                       "I'm here to support you emotionally, but please connect with professional crisis support right now. "
                       "What immediate steps can we take to help you feel safer?")
        
        # Medical advice check
        for keyword in medical_keywords:
            if keyword in response_lower:
                return ("I want to be helpful, but I can't provide medical advice or diagnoses. "
                       "For medical concerns, please consult with a healthcare professional. "
                       "I'm here to provide emotional support and help you process your feelings. "
                       "How are you feeling emotionally about the situation you're facing?")
        
        # Off-topic redirect check  
        for keyword in off_topic_keywords:
            if keyword in response_lower:
                return ("I'm here to provide psychological support and guidance. "
                       "While I can't help with that topic, I'd be happy to talk about any emotions or stress "
                       "you might be experiencing. What's on your mind regarding your emotional wellbeing?")
        
        # Psychology focus check
        if not self._is_psychology_focused(response):
            return ("I'm here to provide psychological support and emotional guidance. "
                   "Let's focus on your thoughts, feelings, and emotional wellbeing. "
                   "What would you like to explore about how you're feeling?")
        
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
