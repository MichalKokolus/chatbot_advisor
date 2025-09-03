"""
NeMo Guardrails configuration for psychological advisor safety.
"""

import os
from nemoguardrails import LLMRails, RailsConfig
from typing import Dict, Any


def create_guardrails_config() -> Dict[str, Any]:
    """Create NeMo Guardrails config for psychological advisor."""
    
    config = {
        "models": [
            {
                "type": "main",
                "engine": "langchain",
                "model": "gemini-pro"
            }
        ],
        "rails": {
            "input": {
                "flows": [
                    {
                        "elements": [
                            {
                                "type": "check_input",
                                "name": "harmful_content_filter"
                            }
                        ]
                    }
                ]
            },
            "output": {
                "flows": [
                    {
                        "elements": [
                            {
                                "type": "check_output", 
                                "name": "psychological_advisor_filter"
                            }
                        ]
                    }
                ]
            }
        },
        "instructions": [
            {
                "type": "general",
                "content": """You are a helpful psychological advisor assistant. You MUST:

1. Only provide psychological support and guidance
2. Never give medical advice or diagnose mental health conditions
3. Always encourage users to seek professional help for serious issues
4. Be empathetic, non-judgmental, and supportive
5. Ask thoughtful questions to help users explore their feelings
6. Never suggest harmful activities or self-harm
7. Maintain professional boundaries
8. Focus on emotional support and coping strategies
9. Redirect conversations back to psychological support if they go off-topic
10. Never discuss topics unrelated to mental health and wellbeing

If asked about anything outside psychological support, politely redirect back to mental health topics."""
            }
        ],
        "sample_conversation": [
            {
                "user": "I'm feeling really stressed about work lately",
                "assistant": "I understand that work stress can be overwhelming. Can you tell me more about what specifically at work is causing you the most stress? Sometimes talking through the details can help us identify ways to cope better."
            },
            {
                "user": "Can you help me with my math homework?",
                "assistant": "I'm here to provide psychological support and guidance. While I can't help with homework, I'd be happy to talk about any stress or anxiety you might be feeling about your studies. How are you feeling about your academic workload?"
            }
        ]
    }
    
    return config


def create_rails_instance() -> LLMRails:
    """Create and configure NeMo Guardrails instance."""
    config_dict = create_guardrails_config()
    rails_config = RailsConfig.from_content(
        colang_content="",
        yaml_content=str(config_dict)
    )
    
    # Create rails instance
    rails = LLMRails(config=rails_config)
    
    return rails
