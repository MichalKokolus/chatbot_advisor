"""
NeMo Guardrails configuration for psychological advisor safety.
"""

import os
import yaml
from nemoguardrails import LLMRails, RailsConfig
from typing import Dict, Any


def create_guardrails_config() -> str:
    """Create simple NeMo Guardrails config for psychological advisor."""
    
    yaml_config = """
models:
  - type: main
    engine: gemini
    model: gemini-2.0-flash-exp

instructions:
  - type: general
    content: |
      You are a psychological advisor assistant. Always provide supportive, empathetic responses focused on mental health and wellbeing. Never give medical advice or suggest harmful activities.

sample_conversation: "user: I'm feeling stressed\nbot: I understand that stress can be overwhelming. Can you tell me more about what's causing you to feel this way?"
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
