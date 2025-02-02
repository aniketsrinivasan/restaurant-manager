import json
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass

from .llm.llm_wrapper import LanguageModel, LanguageModelConfig
from .llm.schemas import ReservationOutput

# Setup logging
logger = logging.getLogger(__name__)

class ReservationProcessor:
    """Process reservations using structured LLM outputs."""
    
    def __init__(self, model_config: Optional[LanguageModelConfig] = None):
        """Initialize the processor with a language model configuration."""
        self.model_config = model_config or LanguageModelConfig(
            model="openai",
            model_name="gpt-4",
            temperature=0,
            max_retries=2
        )
        self.llm = LanguageModel(
            config=self.model_config,
            structured_output=ReservationOutput
        )

    def _create_client_prompt(self, client_data: Dict[str, Any]) -> str:
        """Create a detailed prompt from client data."""
        prompt = f"""
        Process this client's reservation information and provide updated details.
        Pay special attention to any changes requested in recent emails.

        CLIENT INFORMATION:
        Name: {client_data.get('name')}
        
        CURRENT RESERVATION:
        {json.dumps(client_data.get('reservations', []), indent=2)}
        
        RECENT EMAILS:
        {json.dumps(client_data.get('emails', []), indent=2)}
        
        PREVIOUS REVIEWS:
        {json.dumps(client_data.get('reviews', []), indent=2)}

        Based on this information:
        1. Update the number of guests if changes were requested
        2. Note any dietary restrictions mentioned
        3. Track special requests from emails
        4. Identify preferences from past reviews
        5. Determine VIP status (this will be explicitly stated if provided, default to False otherwise)
        6. Preserve all pricing information for food items
        
        Return the updated reservation information in the specified structured format.
        Make sure to include all food prices exactly as they appear in the original order.
        """
        return prompt

    async def process_client(self, client_data: Dict[str, Any]) -> ReservationOutput:
        """Process a single client's information."""
        try:
            logger.info(f"Processing client: {client_data.get('name', 'Unknown')}")
            
            # Create prompt for the client
            prompt = self._create_client_prompt(client_data)
            
            # Get structured response from LLM
            response = self.llm.get_structured_response(prompt)
            logger.info(f"Successfully processed client: {client_data.get('name')}")
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing client {client_data.get('name', 'Unknown')}: {str(e)}")
            raise

    async def process_reservation_file(self, input_file: str, output_file: str):
        """Process all reservations from a JSON file."""
        try:
            # Read input file
            with open(input_file, 'r') as f:
                data = json.load(f)
            
            processed_data = {
                'metadata': {
                    'processed_at': datetime.now().isoformat(),
                    'input_file': input_file
                },
                'reservations': []
            }
            
            # Process each client
            for client in data.get('diners', []):
                processed_reservation = await self.process_client(client)
                processed_data['reservations'].append(processed_reservation.dict())
            
            # Save processed data
            output_path = Path(output_file)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_file, 'w') as f:
                json.dump(processed_data, f, indent=2)
            
            logger.info(f"Successfully processed {len(processed_data['reservations'])} reservations")
            
        except Exception as e:
            logger.error(f"Error processing reservations: {str(e)}")
            raise 