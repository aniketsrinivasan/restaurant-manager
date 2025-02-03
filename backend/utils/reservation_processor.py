import json
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
from pathlib import Path
from tqdm import tqdm  # Add progress bar support
import asyncio
from dataclasses import dataclass
from itertools import islice
import os

from .llm.llm_wrapper import LanguageModel, LanguageModelConfig
from .llm.schemas import ReservationOutput

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProcessingConfig:
    """Configuration for batch processing"""
    BATCH_SIZE = int(os.getenv('BATCH_SIZE', '5'))  # Number of requests to process concurrently
    BATCH_DELAY = float(os.getenv('BATCH_DELAY', '6'))  # Seconds to wait between batches

class ReservationProcessor:
    """Process reservations using structured LLM outputs."""
    
    def __init__(self, model_config: Optional[LanguageModelConfig] = None):
        """Initialize the processor with a language model configuration."""
        logger.info("Initializing ReservationProcessor...")
        self.model_config = model_config or LanguageModelConfig(
            model="openai",
            model_name="gpt-4",
            temperature=0,
            max_retries=2,
            use_async=True   # Set to True to use async operations
        )
        self.llm = LanguageModel(
            config=self.model_config,
            structured_output=ReservationOutput
        )
        logger.info("Initialization complete.")

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
        3. Track special requests from emails, be detailed with special requests
        4. Identify preferences from past reviews, be specific and detailed
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
            logger.debug(f"Client data: {json.dumps(client_data, indent=2)}")
            
            prompt = self._create_client_prompt(client_data)
            
            # Get structured response from LLM
            logger.info("Sending request to LLM...")
            response = await self.llm.a_get_structured_response(prompt)
            logger.info(f"Successfully processed client: {client_data.get('name')}")
            return response
            
        except Exception as e:
            logger.error(f"Error processing client {client_data.get('name', 'Unknown')}: {str(e)}")
            raise

    @staticmethod
    def batch_items(items, batch_size):
        """Helper to create batches from an iterable"""
        iterator = iter(items)
        return iter(lambda: list(islice(iterator, batch_size)), [])

    async def process_reservations(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process all reservations."""
        try:
            processed_data = {
                "metadata": {
                    "processed_at": datetime.now().isoformat(),
                    "input_file": self.input_file,
                    "total_processed": 0,
                    "successful": 0,
                    "failed": 0
                },
                "reservations": []
            }
            
            diners = input_data.get("diners", [])
            total_diners = len(diners)
            logger.info(f"Processing {total_diners} diners in batches of {ProcessingConfig.BATCH_SIZE}")
            
            for batch_num, batch in enumerate(self.batch_items(diners, ProcessingConfig.BATCH_SIZE)):
                # Create tasks for current batch
                tasks = []
                for diner in batch:
                    source_id = str(hash(diner["name"] + str(diner.get("reviews", []))))
                    tasks.append(self._process_single_diner(diner, source_id, processed_data))
                
                # Process current batch
                await asyncio.gather(*tasks)
                
                # Add delay between batches if not the last batch
                if batch_num * ProcessingConfig.BATCH_SIZE < total_diners:
                    logger.debug(f"Completed batch {batch_num + 1}. Waiting {ProcessingConfig.BATCH_DELAY}s before next batch...")
                    await asyncio.sleep(ProcessingConfig.BATCH_DELAY)
            
            return processed_data
        except Exception as e:
            logger.error(f"Error processing reservations: {str(e)}")
            raise

    async def _process_single_diner(self, diner: Dict[str, Any], source_id: str, processed_data: Dict[str, Any]):
        """Process a single diner."""
        try:
            # First get LLM processed data
            llm_processed = await self.llm.a_get_structured_response(
                self._create_client_prompt(diner)
            )
            
            # Then create the final reservation object
            processed_reservation = {
                **llm_processed.dict(),
                "original_data": {
                    "name": diner["name"],
                    "reviews": diner["reviews"],
                    "emails": diner["emails"],
                    "reservations": diner.get("reservations", [])
                },
                "source_id": source_id
            }
            
            processed_data["reservations"].append(processed_reservation)
            processed_data["metadata"]["successful"] += 1
            
        except Exception as e:
            logger.error(f"Failed to process {diner['name']}: {str(e)}")
            processed_data["metadata"]["failed"] += 1
        finally:
            processed_data["metadata"]["total_processed"] += 1

    async def process_reservation_file(self, input_file: str, output_file: str):
        """Process all reservations from a JSON file."""
        try:
            logger.info(f"Reading input file: {input_file}")
            with open(input_file, 'r') as f:
                data = json.load(f)
            
            total_diners = len(data.get('diners', []))
            logger.info(f"Found {total_diners} diners to process")
            
            processed_data = {
                'metadata': {
                    'processed_at': datetime.now().isoformat(),
                    'input_file': input_file,
                    'total_processed': 0,
                    'successful': 0,
                    'failed': 0
                },
                'reservations': []
            }
            
            # Process diners with progress bar
            with tqdm(total=total_diners, desc="Processing reservations") as pbar:
                diners = data.get('diners', [])
                for batch in self.batch_items(diners, ProcessingConfig.BATCH_SIZE):
                    # Create tasks for current batch
                    batch_tasks = []
                    for client in batch:
                        source_id = str(hash(client["name"] + str(client.get("reviews", []))))
                        task = asyncio.create_task(self._process_single_diner(client, source_id, processed_data))
                        task.add_done_callback(lambda _: pbar.update(1))
                        batch_tasks.append(task)
                    
                    # Process current batch
                    await asyncio.gather(*batch_tasks)
                    
                    # Add delay between batches
                    if len(batch) == ProcessingConfig.BATCH_SIZE:
                        await asyncio.sleep(ProcessingConfig.BATCH_DELAY)
            
            # Save processed data
            logger.info(f"Saving processed data to {output_file}")
            output_path = Path(output_file)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_file, 'w') as f:
                json.dump(processed_data, f, indent=2)
            
            # Log final statistics
            logger.info(f"Processing complete:")
            logger.info(f"Total processed: {processed_data['metadata']['total_processed']}")
            logger.info(f"Successful: {processed_data['metadata']['successful']}")
            logger.info(f"Failed: {processed_data['metadata']['failed']}")
            
        except Exception as e:
            logger.error(f"Error processing reservations: {str(e)}")
            raise 