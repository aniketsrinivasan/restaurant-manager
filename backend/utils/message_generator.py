from typing import Dict, Any
import logging
from .llm.llm_wrapper import LanguageModel, LanguageModelConfig
from .llm.schemas import MessageResponse
import json

logger = logging.getLogger(__name__)

class MessageGenerator:
    """Generate contextual responses to client messages."""
    
    def __init__(self, model_config: LanguageModelConfig = None):
        self.model_config = model_config or LanguageModelConfig(
            model="openai",
            model_name="gpt-4",
            temperature=0.7,  # Slightly higher for more natural responses
            max_retries=2,
            use_async=True
        )
        self.llm = LanguageModel(
            config=self.model_config,
            structured_output=MessageResponse
        )

    def _create_response_prompt(self, 
                              client_message: str, 
                              reservation_context: Dict[str, Any]) -> str:
        """Create a detailed prompt for response generation."""
        # Get original data from the reservation context
        original_data = reservation_context.get('original_data', {})
        
        return f"""
        Generate a concise, helpful response to a client's message. Use the full context 
        of their reservation to provide a personalized and relevant reply.

        RESERVATION CONTEXT:
        - Client: {original_data.get('name', 'Unknown')}
        - Reservation Details: {json.dumps(original_data.get('reservations', []), indent=2)}
        - Previous Reviews: {json.dumps(original_data.get('reviews', []), indent=2)}
        - Previous Communications: {json.dumps(original_data.get('emails', []), indent=2)}

        CLIENT MESSAGE:
        {client_message}

        Generate a brief, natural-sounding response that:
        1. Addresses their specific query
        2. Acknowledges any special requests or preferences from their history
        3. Maintains appropriate formality
        4. Includes relevant details from their reservation and history
        5. Is concise (max 2-3 sentences)
        """

    async def generate_response(self, 
                              client_message: str, 
                              reservation_context: Dict[str, Any]) -> str:
        """Generate a response to the client message."""
        try:
            prompt = self._create_response_prompt(client_message, reservation_context)
            response = await self.llm.a_get_structured_response(prompt)
            return response.suggested_reply
            
        except Exception as e:
            logger.error(f"Error generating message response: {str(e)}")
            raise 