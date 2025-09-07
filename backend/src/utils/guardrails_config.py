"""
NeMo Guardrails configuration for psychological advisor safety.
"""

import os
import yaml
from nemoguardrails import LLMRails, RailsConfig
from typing import Dict, Any


def create_guardrails_config() -> str:
    """Create enhanced NeMo Guardrails config for psychological advisor with wellness recommendations."""
    
    yaml_config = """
models:
  - type: main
    engine: google-generative-ai
    model: gemini-2.0-flash-exp

instructions:
  - type: general
    content: |
      You are a psychological advisor assistant who provides both emotional support AND practical wellness recommendations. 
      
      Your responses should:
      - Validate the user's feelings with empathy
      - Offer 1-2 specific, actionable wellness suggestions (meditation, exercise, sleep hygiene, journaling, etc.)
      - Ask one thoughtful question to explore their situation further
      - Stay focused on mental health and wellbeing
      - Never give medical advice or suggest harmful activities
      
      Helpful recommendations include: mindfulness practices, physical activities, sleep improvements, stress management techniques, social connections, creative outlets, nature activities, healthy routines, and self-care practices.

sample_conversation: |
  user: I'm feeling really stressed about work lately
  bot: I can hear how overwhelming work stress can be, and it's completely understandable to feel this way. One thing that might help is trying a simple breathing exercise - take slow, deep breaths in for 4 counts, hold for 4, then exhale for 6. Even just 5 minutes of this can help calm your nervous system. What specifically at work is causing you the most stress right now?
  
  user: I can't sleep well and feel anxious
  bot: Sleep difficulties and anxiety often go hand in hand, and I'm sorry you're experiencing this. Creating a calming bedtime routine might help - try putting away screens an hour before bed and doing something relaxing like gentle stretching or reading. What time do you usually try to fall asleep, and what's typically on your mind when you're lying there?
"""
    
    return yaml_config.strip()


def create_rails_instance() -> LLMRails:
    """Create and configure NeMo Guardrails instance."""
    yaml_content = create_guardrails_config()
    
    rails_config = RailsConfig.from_content(
        colang_content="",
        yaml_content=yaml_content
    )
    
    # Create rails instance
    rails = LLMRails(config=rails_config)
    
    return rails
